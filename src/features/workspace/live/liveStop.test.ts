import assert from "node:assert/strict";
import { test } from "node:test";
import { DEFAULT_CAMERA, parseLiveScene } from "@/lib/models/liveScene";
import { confirmLiveStop } from "./liveStop";

const stopped = {
  id: "live-owned",
  status: "stopped",
  sequence: 4,
  camera: DEFAULT_CAMERA,
  source: "isaac-sim",
  physical_execution: false,
  task_qualified: false,
  controller: "scripted-joint-diagnostic",
};

test("only a validated stop for the requested live session is acknowledged", () => {
  assert.deepEqual(
    confirmLiveStop("live-owned", stopped),
    parseLiveScene(stopped),
  );
  for (const value of [
    { ...stopped, id: "foreign-session" },
    { ...stopped, status: "starting" },
    { ...stopped, status: "failed" },
  ])
    assert.throws(() => confirmLiveStop("live-owned", value), {
      message: "live_stop_unconfirmed",
    });
});

test("a well-formed still-live HTTP 200 snapshot cannot acknowledge stop", () => {
  const live = {
    ...stopped,
    status: "live",
    captured_at: "2026-09-20T12:00:00Z",
    simulation_time_s: 1,
    frame: {
      mime_type: "image/png",
      width: 640,
      height: 576,
      sha256: "a".repeat(64),
      data_base64: "iVBORw0KGgo=",
    },
    robots: Array.from({ length: 8 }, (_, index) => ({
      id: `franka-${index}`,
      model: "Franka Panda",
      joint_names: Array.from({ length: 7 }, (_, joint) => `joint-${joint}`),
      joint_positions: Array(7).fill(0),
      joint_velocities: Array(7).fill(0),
      position: [index, 0, 0],
      screen: null,
    })),
  };
  assert.equal(parseLiveScene(live).status, "live");
  assert.throws(() => confirmLiveStop("live-owned", live), {
    message: "live_stop_unconfirmed",
  });
});

test("malformed or forged successful HTTP bodies never acknowledge a stop", () => {
  for (const value of [
    null,
    {},
    { ok: true },
    { ...stopped, camera: undefined },
    { ...stopped, physical_execution: true },
    { ...stopped, source: "unverified" },
  ])
    assert.throws(() => confirmLiveStop("live-owned", value));
});
