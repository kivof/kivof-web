export type Camera = {
  yaw: number;
  pitch: number;
  distance: number;
  target: [number, number, number];
};
export type LiveRobot = {
  id: string;
  model: string;
  joint_names: string[];
  joint_positions: number[];
  joint_velocities: number[];
  position: [number, number, number];
  screen: [number, number] | null;
};
export type LiveScene = {
  id: string;
  status: "starting" | "live" | "stopped" | "failed";
  sequence: number;
  camera: Camera;
  robots: LiveRobot[];
  captured_at?: string;
  simulation_time_s?: number;
  frame?: { width: number; height: number; sha256: string; data_url: string };
};
export const DEFAULT_CAMERA: Camera = {
  yaw: -133.49,
  pitch: 37.65,
  distance: 13.56,
  target: [2.4, 0.8, 0.2],
};
const finite = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);
const vector = (value: unknown, length: number): value is number[] =>
  Array.isArray(value) && value.length === length && value.every(finite);
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("invalid_live_scene");
  return value as Record<string, unknown>;
}
export function clampCamera(camera: Camera): Camera {
  const clamp = (value: number, min: number, max: number) =>
    Math.max(min, Math.min(max, value));
  return {
    yaw: ((((camera.yaw + 180) % 360) + 360) % 360) - 180,
    pitch: clamp(camera.pitch, 10, 85),
    distance: clamp(camera.distance, 2, 25),
    target: [
      clamp(camera.target[0], -5, 10),
      clamp(camera.target[1], -5, 7),
      clamp(camera.target[2], 0, 3),
    ],
  };
}
function parseCamera(value: unknown): Camera {
  const camera = object(value);
  if (
    !finite(camera.yaw) ||
    !finite(camera.pitch) ||
    !finite(camera.distance) ||
    !vector(camera.target, 3)
  )
    throw new Error("invalid_live_camera");
  const candidate = camera as Camera;
  const bounded = clampCamera(candidate);
  if (Math.abs(bounded.yaw - candidate.yaw) > 0.00001 && candidate.yaw !== 180)
    throw new Error("invalid_live_camera");
  if (
    bounded.pitch !== candidate.pitch ||
    bounded.distance !== candidate.distance ||
    bounded.target.some((v, i) => v !== candidate.target[i])
  )
    throw new Error("invalid_live_camera");
  return candidate;
}
function parseRobot(value: unknown): LiveRobot {
  const robot = object(value);
  if (
    typeof robot.id !== "string" ||
    !/^franka-[0-7]$/.test(robot.id) ||
    typeof robot.model !== "string" ||
    robot.model.length > 128 ||
    !Array.isArray(robot.joint_names) ||
    robot.joint_names.length !== 7 ||
    !robot.joint_names.every((v) => typeof v === "string" && v.length < 128) ||
    !vector(robot.joint_positions, 7) ||
    !vector(robot.joint_velocities, 7) ||
    !vector(robot.position, 3) ||
    !(robot.screen === null || vector(robot.screen, 2))
  )
    throw new Error("invalid_live_robot");
  return robot as LiveRobot;
}
function parseFrame(value: unknown): NonNullable<LiveScene["frame"]> {
  const frame = object(value);
  if (
    frame.mime_type !== "image/png" ||
    !finite(frame.width) ||
    !finite(frame.height) ||
    frame.width < 1 ||
    frame.height < 1 ||
    frame.width > 1920 ||
    frame.height > 1920 ||
    typeof frame.sha256 !== "string" ||
    !/^[a-f0-9]{64}$/.test(frame.sha256) ||
    typeof frame.data_base64 !== "string" ||
    frame.data_base64.length > 2_000_000 ||
    !/^iVBORw0KGgo[A-Za-z0-9+/]*={0,2}$/.test(frame.data_base64)
  )
    throw new Error("invalid_live_frame");
  return {
    width: frame.width,
    height: frame.height,
    sha256: frame.sha256,
    data_url: `data:image/png;base64,${frame.data_base64}`,
  };
}
export function parseLiveScene(value: unknown): LiveScene {
  const data = object(value);
  if (
    data.source !== "isaac-sim" ||
    data.physical_execution !== false ||
    data.task_qualified !== false ||
    data.controller !== "scripted-joint-diagnostic" ||
    typeof data.id !== "string" ||
    !/^[a-zA-Z0-9_-]{1,128}$/.test(data.id) ||
    !["starting", "live", "stopped", "failed"].includes(String(data.status)) ||
    !Number.isSafeInteger(data.sequence) ||
    Number(data.sequence) < 0
  )
    throw new Error("invalid_live_scene");
  const robots = data.robots === undefined ? [] : data.robots;
  if (!Array.isArray(robots) || robots.length > 8)
    throw new Error("invalid_live_scene");
  const parsed = robots.map(parseRobot);
  if (new Set(parsed.map((robot) => robot.id)).size !== parsed.length)
    throw new Error("invalid_live_scene");
  const scene: LiveScene = {
    id: data.id,
    status: data.status as LiveScene["status"],
    sequence: Number(data.sequence),
    camera: parseCamera(data.camera),
    robots: parsed,
  };
  if (data.frame !== undefined) {
    if (
      typeof data.captured_at !== "string" ||
      !Number.isFinite(Date.parse(data.captured_at)) ||
      !finite(data.simulation_time_s) ||
      data.simulation_time_s < 0
    )
      throw new Error("invalid_live_scene");
    scene.frame = parseFrame(data.frame);
    scene.captured_at = data.captured_at;
    scene.simulation_time_s = data.simulation_time_s;
  }
  if (scene.status === "live" && (!scene.frame || scene.robots.length !== 8))
    throw new Error("invalid_live_scene");
  return scene;
}
export function moveCamera(
  camera: Camera,
  dx: number,
  dy: number,
  pan = false,
): Camera {
  if (!pan)
    return clampCamera({
      ...camera,
      yaw: camera.yaw + dx,
      pitch: camera.pitch + dy,
    });
  const yaw = (camera.yaw * Math.PI) / 180;
  const scale = camera.distance / 90;
  return clampCamera({
    ...camera,
    target: [
      camera.target[0] + (Math.sin(yaw) * dx + Math.cos(yaw) * dy) * scale,
      camera.target[1] + (-Math.cos(yaw) * dx + Math.sin(yaw) * dy) * scale,
      camera.target[2],
    ],
  });
}

export function robotAtPoint(robots: LiveRobot[], x: number, y: number) {
  return robots
    .filter((robot) => robot.screen?.every((value) => value >= 0 && value <= 1))
    .map((robot) => ({
      robot,
      distance: Math.hypot(
        (robot.screen?.[0] ?? 0) - x,
        (robot.screen?.[1] ?? 0) - y,
      ),
    }))
    .filter((candidate) => candidate.distance < 0.065)
    .sort((left, right) => left.distance - right.distance)[0]?.robot.id;
}
