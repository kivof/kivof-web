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
  assert.equal(executions, 0);
});
