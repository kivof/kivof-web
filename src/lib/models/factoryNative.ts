export type FactoryFrame = {
  dataUrl: string;
  sha256: string;
  width: number;
  height: number;
  time: number;
};
export type FactoryNative = {
  frames: FactoryFrame[];
  samples: {
    time: number;
    positions: number[];
    velocities: number[];
    item: number[];
  }[];
  distance: number | null;
  speed: number | null;
  released: boolean | null;
  lifted: boolean | null;
};
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("invalid_factory_native");
  return value as Record<string, unknown>;
}
function numeric(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value))
    throw new Error("invalid_factory_native");
  return value;
}
function vector(value: unknown, length: number): number[] {
  if (!Array.isArray(value) || value.length !== length)
    throw new Error("invalid_factory_native");
  return value.map(numeric);
}
function optionalNumber(value: unknown) {
  return value == null ? null : numeric(value);
}
function optionalBoolean(value: unknown) {
  if (value == null) return null;
  if (typeof value !== "boolean") throw new Error("invalid_factory_native");
  return value;
}
function parseFrame(raw: unknown): FactoryFrame {
  const frame = object(raw);
  if (
    frame.source !== "isaac-sim" ||
    frame.media_type !== "image/png" ||
    typeof frame.base64 !== "string" ||
    frame.base64.length > 500_000 ||
    !/^[A-Za-z0-9+/]+={0,2}$/.test(frame.base64) ||
    frame.base64.length % 4 !== 0 ||
    typeof frame.sha256 !== "string" ||
    !/^[a-f0-9]{64}$/i.test(frame.sha256)
  )
    throw new Error("invalid_factory_frame");
  const width = numeric(frame.width),
    height = numeric(frame.height),
    time = numeric(frame.simulation_time_s);
  if (
    !Number.isInteger(width) ||
    !Number.isInteger(height) ||
    width < 1 ||
    height < 1 ||
    width > 2048 ||
    height > 2048 ||
    time < 0
  )
    throw new Error("invalid_factory_frame");
  const header = Uint8Array.from(atob(frame.base64.slice(0, 44)), (character) =>
    character.charCodeAt(0),
  );
  const signature = [137, 80, 78, 71, 13, 10, 26, 10];
  if (
    header.length < 24 ||
    signature.some((value, index) => header[index] !== value) ||
    String.fromCharCode(...header.slice(12, 16)) !== "IHDR"
  )
    throw new Error("invalid_factory_png");
  const view = new DataView(header.buffer);
  if (view.getUint32(16) !== width || view.getUint32(20) !== height)
    throw new Error("invalid_factory_frame_dimensions");
  return {
    dataUrl: `data:image/png;base64,${frame.base64}`,
    sha256: frame.sha256.toLowerCase(),
    width,
    height,
    time,
  };
}
export function parseFactoryNative(
  raw: Record<string, unknown>,
): FactoryNative | null {
  if (raw.source !== "isaac-sim") return null;
  const evidence = object(raw.evidence),
    simulation = object(evidence.simulation),
    verification = object(raw.verification);
  if (
    raw.data_origin !== "simulated" ||
    raw.physical_execution !== false ||
    simulation.isaac_sim !== true ||
    simulation.physics !== true ||
    simulation.trained_model !== false ||
    simulation.task_qualified !== false
  )
    throw new Error("invalid_factory_native_origin");
  if (
    !Array.isArray(evidence.frames) ||
    evidence.frames.length < 1 ||
    evidence.frames.length > 12
  )
    throw new Error("invalid_factory_frames");
  if (!Array.isArray(raw.observations) || raw.observations.length > 64)
    throw new Error("invalid_factory_samples");
  const samples = raw.observations.map((value) => {
    const sample = object(value);
    if (sample.data_origin !== "simulated")
      throw new Error("invalid_factory_sample_origin");
    return {
      time: numeric(sample.simulation_time_s),
      positions: vector(sample.joint_positions_rad, 7),
      velocities: vector(sample.joint_velocities_rad_s, 7),
      item: vector(sample.item_position_m, 3),
    };
  });
  return {
    frames: evidence.frames.map(parseFrame),
    samples,
    distance: optionalNumber(verification.distance_to_bin_m),
    speed: optionalNumber(verification.linear_speed_m_s),
    released: optionalBoolean(verification.released),
    lifted: optionalBoolean(verification.lift_observed),
  };
}
export async function verifyFactoryFrame(frame: FactoryFrame) {
  const bytes = Uint8Array.from(
    atob(frame.dataUrl.slice("data:image/png;base64,".length)),
    (character) => character.charCodeAt(0),
  );
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const hash = Array.from(new Uint8Array(digest), (value) =>
    value.toString(16).padStart(2, "0"),
  ).join("");
  return hash === frame.sha256;
}
export function factorySimulationInput(scenario: string, engine: string) {
  if (
    !["cpu", "isaac"].includes(engine) ||
    ![
      "nominal",
      "occlusion",
      "force_spike",
      "stale_sensor",
      "foreign_object",
      "empty_belt",
      "sensor_conflict",
      "misroute",
    ].includes(scenario)
  )
    throw new Error("invalid_factory_simulation");
  return { scenario, engine };
}
