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
        !/^[a-zA-Z0-9_-]{1,128}$/.test(args.session_id)))
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
  return async (event: unknown) => {
    const value = object(event);
    const response = object(value?.response);
    if (value?.type !== "response.done" || response?.status !== "completed")
      return;
    const outputs = response.output;
    if (!Array.isArray(outputs) || outputs.length > 8) return;
    let completed = false;
    for (const output of outputs) {
      const item = object(output);
      if (!item || item.type !== "function_call") continue;
      const id = item.call_id;
      if (typeof id !== "string" || !/^[A-Za-z0-9_.-]{1,128}$/.test(id))
        continue;
      if (seen.has(id) || !bridge.active()) continue;
      seen.add(id);
      const result =
        seen.size <= 128
          ? await executeCall(item, bridge)
          : { ok: false, error: "tool_limit_reached" };
      if (!bridge.active()) return;
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
    if (completed && bridge.active()) bridge.send({ type: "response.create" });
  };
}
