import assert from "node:assert/strict";
import { test } from "node:test";
import { DEFAULT_CAMERA } from "@/lib/models/liveScene";
import { prepareNativeTask } from "./prepareNativeTask";

const stopped = {
  id: "live-owned",
  status: "stopped",
  sequence: 0,
  camera: DEFAULT_CAMERA,
  source: "isaac-sim",
  physical_execution: false,
  task_qualified: false,
  controller: "scripted-joint-diagnostic",
};

test("native task stops only the authenticated current session and publishes its confirmed stop", async () => {
  const calls: string[] = [];
  const published: unknown[] = [];
  await prepareNativeTask(
    async (path, method) => {
      calls.push(`${method} ${path}`);
      return method === "GET"
        ? { current_live_session: "live-owned" }
        : stopped;
    },
    (value) => published.push(value),
  );
  assert.deepEqual(calls, [
    "GET assistant/context",
    "DELETE simulation/live/live-owned",
  ]);
  assert.deepEqual(published, [stopped]);
});

test("no active session needs no stop and invalid context cannot choose a service path", async () => {
  let calls = 0;
  await prepareNativeTask(
    async () => {
      calls += 1;
      return { current_live_session: null };
    },
    () => {},
  );
  assert.equal(calls, 1);
  for (const current_live_session of [
    "../other",
    "https://other.example",
    undefined,
    3,
  ]) {
    calls = 0;
    await assert.rejects(
      prepareNativeTask(
        async () => {
          calls += 1;
          return { current_live_session };
        },
        () => {},
      ),
    );
    assert.equal(calls, 1);
  }
});

test("a failed or substituted stop blocks the dependent GPU task", async () => {
  for (const result of [
    { ...stopped, id: "other" },
    { ...stopped, status: "starting" },
    null,
  ]) {
    let started = false;
    let published = false;
    await assert.rejects(
      prepareNativeTask(
        async (_path, method) => {
          if (method === "GET") return { current_live_session: "live-owned" };
          if (result === null) throw new Error("live_worker_busy");
          return result;
        },
        () => {
          published = true;
        },
      ).then(() => {
        started = true;
      }),
    );
    assert.equal(started, false);
    assert.equal(published, false);
  }
});
