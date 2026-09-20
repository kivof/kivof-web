import assert from "node:assert/strict";
import { test } from "node:test";
import {
  clampCamera,
  DEFAULT_CAMERA,
  moveCamera,
  parseLiveScene,
  robotAtPoint,
} from "./liveScene";

const snapshot = () => ({
  id: "live-123",
  status: "live",
  source: "isaac-sim",
  sequence: 12,
  physical_execution: false,
  controller: "scripted-joint-diagnostic",
  task_qualified: false,
  camera: structuredClone(DEFAULT_CAMERA),
  captured_at: "2026-09-20T12:00:00Z",
  simulation_time_s: 2.4,
  frame: {
    mime_type: "image/png",
    width: 960,
    height: 864,
    sha256: "a".repeat(64),
    data_base64: "iVBORw0KGgo=",
  },
  robots: Array.from({ length: 8 }, (_, i) => ({
    id: `franka-${i}`,
    model: "Franka Panda",
    joint_names: Array.from({ length: 7 }, (_, j) => `joint-${j}`),
    joint_positions: Array(7).fill(0.3),
    joint_velocities: Array(7).fill(0.1),
    position: [i, 1, 0],
    screen: [0.5, 0.5],
  })),
});

test("image picking selects the nearest projected robot and ignores empty space", () => {
  const robots = parseLiveScene(snapshot()).robots;
  robots[1].screen = [0.7, 0.7];
  assert.equal(robotAtPoint(robots, 0.72, 0.69), "franka-1");
  assert.equal(robotAtPoint(robots, 0.1, 0.1), undefined);
  robots[1].screen = [-1, 0.7];
  assert.equal(robotAtPoint(robots, -1, 0.7), undefined);
});
test("native live state preserves camera, telemetry and bounded PNG", () => {
  const parsed = parseLiveScene(snapshot());
  assert.equal(parsed.frame?.data_url, "data:image/png;base64,iVBORw0KGgo=");
  assert.equal(parsed.robots.length, 8);
  assert.deepEqual(parsed.camera, DEFAULT_CAMERA);
  assert.equal(parsed.robots[3].joint_positions[1], 0.3);
});
test("compact JPEG frames require matching media signatures and complete bytes", () => {
  const data = snapshot();
  const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0xff, 0xd9]).toString(
    "base64",
  );
  data.frame.mime_type = "image/jpeg";
  data.frame.data_base64 = jpeg;
  assert.equal(
    parseLiveScene(data).frame?.data_url,
    `data:image/jpeg;base64,${jpeg}`,
  );
  for (const patch of [
    { mime_type: "image/png" },
    { mime_type: "image/svg+xml" },
    { data_base64: "/9j/4AAA" },
    { data_base64: "iVBORw0KGgo=" },
    { data_base64: `${jpeg}x` },
  ])
    assert.throws(() =>
      parseLiveScene({ ...data, frame: { ...data.frame, ...patch } }),
    );
});
test("live state rejects forged provenance, arbitrary media, invalid telemetry and duplicate robots", () => {
  for (const patch of [
    { source: "physical" },
    { physical_execution: true },
    { task_qualified: true },
    { id: "../other" },
    { sequence: -1 },
    { controller: "arbitrary-command" },
    { frame: undefined },
    { captured_at: "unknown" },
    { simulation_time_s: NaN },
  ])
    assert.throws(() => parseLiveScene({ ...snapshot(), ...patch }));
  const data = snapshot();
  data.frame.data_base64 = "https://untrusted.example/frame.png";
  assert.throws(() => parseLiveScene(data));
  const duplicate = snapshot();
  duplicate.robots[1].id = duplicate.robots[0].id;
  assert.throws(() => parseLiveScene(duplicate));
  const invalid = snapshot();
  invalid.robots[0].joint_positions[0] = Infinity;
  assert.throws(() => parseLiveScene(invalid));
});
test("starting session never requires or invents frames", () => {
  const data = snapshot();
  const parsed = parseLiveScene({
    ...data,
    status: "starting",
    frame: undefined,
    robots: undefined,
  });
  assert.equal(parsed.frame, undefined);
  assert.deepEqual(parsed.robots, []);
});
test("camera navigation orbits, pans in camera axes and clamps scene limits", () => {
  const orbit = moveCamera(DEFAULT_CAMERA, 20, 5);
  assert.ok(Math.abs(orbit.yaw - (DEFAULT_CAMERA.yaw + 20)) < 0.00001);
  assert.equal(orbit.pitch, DEFAULT_CAMERA.pitch + 5);
  assert.deepEqual(orbit.target, DEFAULT_CAMERA.target);
  const pan = moveCamera(DEFAULT_CAMERA, 8, 0, true);
  assert.notDeepEqual(pan.target, DEFAULT_CAMERA.target);
  assert.equal(pan.yaw, DEFAULT_CAMERA.yaw);
  assert.deepEqual(
    clampCamera({ yaw: 370, pitch: 100, distance: 50, target: [20, -20, 50] }),
    { yaw: 10, pitch: 85, distance: 25, target: [10, -5, 3] },
  );
});
