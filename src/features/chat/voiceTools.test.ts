import assert from "node:assert/strict";
import { test } from "node:test";
import { voiceToolHandler } from "./voiceTools";

function response(name = "read_workspace_context", args = "{}", id = "call_1") {
  return {
    type: "response.done",
    response: {
      status: "completed",
      output: [{ type: "function_call", name, arguments: args, call_id: id }],
    },
  };
}

test("voice tools return real data before requesting a follow-up and deduplicate calls", async () => {
  const calls: unknown[] = [],
    sent: Record<string, unknown>[] = [];
  const handler = voiceToolHandler({
    active: () => true,
    execute: async (call) => {
      calls.push(call);
      return { ok: true, result: { sequence: 42 } };
    },
    send: (event) => sent.push(event),
    changed: () => {},
  });
  await handler(response());
  await handler(response());
  assert.equal(calls.length, 1);
  assert.deepEqual(calls[0], {
    name: "read_workspace_context",
    arguments: {},
    request_id: "call_1",
  });
  assert.deepEqual(sent, [
    {
      type: "conversation.item.create",
      item: {
        type: "function_call_output",
        call_id: "call_1",
        output: '{"ok":true,"result":{"sequence":42}}',
      },
    },
    { type: "response.create" },
  ]);
});

test("tool allowlist rejects injected actions, invalid JSON and foreign fields without an API call", async () => {
  let executions = 0;
  const handler = voiceToolHandler({
    active: () => true,
    execute: async () => {
      executions++;
    },
    send: () => {},
    changed: () => {},
  });
  for (const [index, [name, args]] of [
    ["execute_shell", "{}"],
    ["control_live_simulation", '{"action":"move_motor"}'],
    ["control_live_simulation", '{"action":"start","physical_execution":true}'],
    ["control_live_simulation", '{"action":"stop","session_id":"../another"}'],
    [
      "control_live_simulation",
      '{"action":"start","session_id":"81292f07-1111-4222-a333-123456789abc"}',
    ],
    ["read_workspace_context", '{"tenant":"another"}'],
    ["read_workspace_context", "not-json"],
    ["read_workspace_context", "[]"],
  ].entries())
    await handler(response(name, args, `call_${index}`));
  assert.equal(executions, 0);
});

test("stopping voice during a tool request suppresses late output and scene updates", async () => {
  let active = true,
    sends = 0,
    changes = 0;
  let resolve: (value: unknown) => void = () => {};
  const pending = new Promise((done) => {
    resolve = done;
  });
  const handler = voiceToolHandler({
    active: () => active,
    execute: async () => pending,
    send: () => {
      sends++;
    },
    changed: () => {
      changes++;
    },
  });
  const task = handler(
    response("control_live_simulation", '{"action":"start"}'),
  );
  active = false;
  resolve({ ok: true });
  await task;
  assert.equal(sends, 0);
  assert.equal(changes, 0);
});

test("failed tools produce bounded failure output and do not expose raw diagnostics", async () => {
  const sent: Record<string, unknown>[] = [];
  const handler = voiceToolHandler({
    active: () => true,
    execute: async () => {
      throw new Error("private token diagnostic");
    },
    send: (event) => sent.push(event),
    changed: () => {},
  });
  await handler(response());
  assert.match(JSON.stringify(sent), /tool_unavailable/);
  assert.doesNotMatch(JSON.stringify(sent), /private|token/);
});

test("cancelled responses and partial function arguments never execute", async () => {
  let executions = 0;
  const handler = voiceToolHandler({
    active: () => true,
    execute: async () => {
      executions++;
    },
    send: () => {},
    changed: () => {},
  });
  const cancelled = response();
  cancelled.response.status = "cancelled";
  await handler(cancelled);
  await handler({
    ...response(),
    type: "response.function_call_arguments.delta",
  });
  await handler(response());
  assert.equal(executions, 0);
});

test("concurrent responses serialize controls and a repeated event cannot replay a pending mutation", async () => {
  let calls = 0,
    active = 0,
    maximum = 0;
  const handler = voiceToolHandler({
    active: () => true,
    send: () => {},
    changed: () => {},
    execute: async () => {
      calls += 1;
      active += 1;
      maximum = Math.max(maximum, active);
      await Promise.resolve();
      active -= 1;
      return { ok: true };
    },
  });
  await Promise.all([
    handler(
      response("control_live_simulation", '{"action":"start"}', "call_1"),
    ),
    handler(
      response("control_live_simulation", '{"action":"start"}', "call_1"),
    ),
    handler(response("control_live_simulation", '{"action":"stop"}', "call_2")),
  ]);
  assert.equal(calls, 2);
  assert.equal(maximum, 1);
});

test("new user speech suppresses a late follow-up and prevents queued old controls", async () => {
  let resolve: (value: unknown) => void = () => {};
  const pending = new Promise((done) => {
    resolve = done;
  });
  let calls = 0;
  const sent: Record<string, unknown>[] = [];
  const handler = voiceToolHandler({
    active: () => true,
    changed: () => {},
    send: (value) => sent.push(value),
    execute: async () => {
      calls += 1;
      return pending;
    },
  });
  const first = handler(response());
  await Promise.resolve();
  const second = handler(
    response("control_live_simulation", '{"action":"start"}', "call_2"),
  );
  await handler({ type: "input_audio_buffer.speech_started" });
  resolve({ ok: true });
  await Promise.all([first, second]);
  assert.equal(calls, 1);
  assert.ok(sent.every((item) => item.type !== "response.create"));
  assert.match(JSON.stringify(sent), /superseded_by_user/);
});

test("cancelled response IDs are blocked even if cancellation omitted its partial outputs", async () => {
  let calls = 0;
  const handler = voiceToolHandler({
    active: () => true,
    send: () => {},
    changed: () => {},
    execute: async () => {
      calls += 1;
    },
  });
  await handler({
    type: "response.done",
    response: { id: "response-1", status: "cancelled", output: [] },
  });
  const value = response();
  await handler({
    ...value,
    response: { ...value.response, id: "response-1" },
  });
  assert.equal(calls, 0);
});

test("the session call budget remains bounded and never executes overflow mutations", async () => {
  let calls = 0;
  const handler = voiceToolHandler({
    active: () => true,
    send: () => {},
    changed: () => {},
    execute: async () => {
      calls += 1;
      return { ok: true };
    },
  });
  for (let index = 0; index < 128; index++)
    await handler(response("read_workspace_context", "{}", `call_${index}`));
  await assert.rejects(
    handler(
      response("control_live_simulation", '{"action":"start"}', "overflow"),
    ),
    /voice_tool_limit_reached/,
  );
  await assert.rejects(
    handler(
      response("control_live_simulation", '{"action":"start"}', "another"),
    ),
    /voice_tool_limit_reached/,
  );
  assert.equal(calls, 128);
});
