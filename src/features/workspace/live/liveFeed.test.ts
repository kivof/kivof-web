import assert from "node:assert/strict";
import { test } from "node:test";
import { DEFAULT_CAMERA, type LiveScene } from "@/lib/models/liveScene";
import { pollLiveFeed } from "./liveFeed";

const scene = (
  sequence: number,
  status: LiveScene["status"] = "live",
): LiveScene => ({
  id: "live-1",
  status,
  sequence,
  camera: DEFAULT_CAMERA,
  robots: [],
});

test("slow requests continue immediately without a 500ms timer or overlap", async () => {
  const controller = new AbortController();
  let clock = 0;
  let inFlight = 0;
  let maximum = 0;
  let sequence = 0;
  const received: number[] = [];
  const delays: number[] = [];
  await pollLiveFeed({
    signal: controller.signal,
    visible: () => true,
    now: () => clock,
    read: async () => {
      inFlight += 1;
      maximum = Math.max(maximum, inFlight);
      await Promise.resolve();
      clock += 300;
      inFlight -= 1;
      return scene(++sequence, sequence === 3 ? "stopped" : "live");
    },
    receive: (value) => received.push(value.sequence),
    failure: () => false,
    pause: async (delay) => {
      delays.push(delay);
      clock += delay;
    },
  });
  assert.equal(maximum, 1);
  assert.deepEqual(received, [1, 2, 3]);
  assert.deepEqual(delays, [0, 0]);
});

test("fast requests respect the bounded cadence and aborted responses are discarded", async () => {
  const controller = new AbortController();
  let sequence = 0;
  const received: number[] = [];
  const delays: number[] = [];
  await pollLiveFeed({
    signal: controller.signal,
    visible: () => true,
    now: () => 0,
    read: async () => {
      sequence += 1;
      if (sequence === 2) controller.abort();
      return scene(sequence);
    },
    receive: (value) => received.push(value.sequence),
    failure: () => false,
    pause: async (delay) => {
      delays.push(delay);
    },
  });
  assert.deepEqual(received, [1]);
  assert.deepEqual(delays, [125]);
});
