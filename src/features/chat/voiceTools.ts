type ToolCall = {
  name: string;
  arguments: Record<string, unknown>;
  request_id: string;
};

type Bridge = {
  execute: (call: ToolCall) => Promise<unknown>;
  send: (event: Record<string, unknown>) => void;
  active: () => boolean;
  changed: (result: unknown) => void;
};

function object(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function parseCall(value: Record<string, unknown>): ToolCall | null {
  const { name, call_id, arguments: raw } = value;
  if (
    typeof call_id !== "string" ||
    !/^[A-Za-z0-9_.-]{1,128}$/.test(call_id) ||
    typeof raw !== "string" ||
    raw.length > 1024
  )
    return null;
  const args = object(JSON.parse(raw));
  if (!args) return null;
  if (name === "read_workspace_context" && Object.keys(args).length === 0)
    return { name, arguments: args, request_id: call_id };
  if (
    name !== "control_live_simulation" ||
    !["start", "stop"].includes(String(args.action)) ||
    Object.keys(args).some((key) => !["action", "session_id"].includes(key)) ||
    (args.session_id != null &&
      (typeof args.session_id !== "string" ||
        !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(
          args.session_id,
        ))) ||
    (args.action === "start" && args.session_id != null)
  )
    return null;
  return { name, arguments: args, request_id: call_id };
}

async function executeCall(value: Record<string, unknown>, bridge: Bridge) {
  try {
    const call = parseCall(value);
    if (!call) return { ok: false, error: "invalid_tool_call" };
    const result = await bridge.execute(call);
    if (bridge.active() && call.name === "control_live_simulation")
      bridge.changed(result);
    return result;
  } catch {
    return { ok: false, error: "tool_unavailable" };
  }
}

/** Only complete responses can execute tools; repeated events cannot replay writes. */
export function voiceToolHandler(bridge: Bridge) {
  const seen = new Set<string>();
  const cancelled = new Set<string>();
  const cancelledResponses = new Set<string>();
  let turn = 0;
  let queue = Promise.resolve();
  function reserve(set: Set<string>, id: string) {
    if (set.has(id)) return false;
    if (set.size >= 128) throw new Error("voice_tool_limit_reached");
    set.add(id);
    return true;
  }
  return async (event: unknown) => {
    const value = object(event);
    if (value?.type === "input_audio_buffer.speech_started") {
      turn += 1;
      return;
    }
    const response = object(value?.response);
    if (value?.type !== "response.done" || !response || !bridge.active())
      return;
    const responseId = typeof response.id === "string" ? response.id : "";
    if (responseId.length > 128) return;
    if (response.status !== "completed") {
      if (responseId) reserve(cancelledResponses, responseId);
    } else if (responseId && cancelledResponses.has(responseId)) return;
    const outputs = response.output;
    if (!Array.isArray(outputs) || outputs.length > 8) return;
    const calls: Record<string, unknown>[] = [];
    for (const output of outputs) {
      const item = object(output);
      if (!item || item.type !== "function_call") continue;
      const id = item.call_id;
      if (typeof id !== "string" || !/^[A-Za-z0-9_.-]{1,128}$/.test(id))
        continue;
      if (response.status !== "completed") {
        reserve(cancelled, id);
        reserve(seen, id);
      } else if (reserve(seen, id)) calls.push(item);
    }
    if (!calls.length) return;
    const submittedTurn = turn;
    const process = async () => {
      let completed = false;
      for (const item of calls) {
        const id = item.call_id as string;
        if (!bridge.active()) return;
        if (cancelled.has(id) || cancelledResponses.has(responseId)) continue;
        const result =
          submittedTurn === turn
            ? await executeCall(item, bridge)
            : { ok: false, error: "superseded_by_user" };
        if (!bridge.active()) return;
        if (cancelled.has(id) || cancelledResponses.has(responseId)) continue;
        bridge.send({
          type: "conversation.item.create",
          item: {
            type: "function_call_output",
            call_id: id,
            output: JSON.stringify(result),
          },
        });
        completed = true;
      }
      if (completed && bridge.active() && submittedTurn === turn)
        bridge.send({ type: "response.create" });
    };
    queue = queue.then(process, process);
    await queue;
  };
}
