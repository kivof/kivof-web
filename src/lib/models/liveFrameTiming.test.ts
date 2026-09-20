import assert from "node:assert/strict";
import { test } from "node:test";
import { liveFrameTiming, sampleLiveFrame } from "./liveFrameTiming";
import { DEFAULT_CAMERA, type LiveScene } from "./liveScene";

function frame(
  sequence: number,
  captured: number,
  simulation: number,
): LiveScene {
  return {
    id: "live-1",
    status: "live",
    sequence,
    camera: DEFAULT_CAMERA,
    robots: [],
    captured_at: new Date(captured).toISOString(),
    simulation_time_s: simulation,
    frame: { width: 640, height: 576, sha256: "a".repeat(64), data_url: "" },
  };
}

test("freshness includes transport delay and simulation speed uses measured capture time", () => {
  const first = sampleLiveFrame([], frame(10, 1000, 1), 2000);
  const samples = sampleLiveFrame(first, frame(20, 2000, 2), 3000);
  assert.deepEqual(liveFrameTiming(samples, 4000), {
    age: 2,
    fps: 1,
    speed: 1,
  });
  const slow = sampleLiveFrame(first, frame(20, 2000, 1.06), 3000);
  assert.ok(
    Math.abs((liveFrameTiming(slow, 4000).speed ?? 0) - 0.06) < 0.00001,
  );
});

test("duplicate or out-of-order frames do not invent motion or reset freshness", () => {
  const samples = sampleLiveFrame([], frame(10, 1000, 1), 2000);
  assert.equal(sampleLiveFrame(samples, frame(10, 1000, 1), 3000), samples);
  assert.equal(sampleLiveFrame(samples, frame(9, 900, 0.9), 3000), samples);
  assert.deepEqual(liveFrameTiming(samples, 6000), {
    age: 5,
    fps: 0,
    speed: null,
  });
});
