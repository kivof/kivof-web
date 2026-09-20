import type { Run } from "./domain";
export type IsaacFrame = {
  simulation_time_s: number;
  data_url: string;
  sha256: string;
  source: "isaac-sim";
};
export function isaacFrames(run: Run | null | undefined): IsaacFrame[] {
  if (run?.source !== "isaac-sim" || !Array.isArray(run.evidence.frames))
    return [];
  return run.evidence.frames
    .slice(0, 12)
    .filter((frame): frame is IsaacFrame => {
      if (!frame || typeof frame !== "object") return false;
      const value = frame as Record<string, unknown>;
      return (
        value.source === "isaac-sim" &&
        value.media_type === "image/png" &&
        typeof value.simulation_time_s === "number" &&
        Number.isFinite(value.simulation_time_s) &&
        value.simulation_time_s >= 0 &&
        typeof value.sha256 === "string" &&
        /^[a-f0-9]{64}$/i.test(value.sha256) &&
        typeof value.data_url === "string" &&
        value.data_url.length <= 2_000_000 &&
        /^data:image\/png;base64,iVBORw0KGgo[A-Za-z0-9+/]*={0,2}$/.test(
          value.data_url,
        )
      );
    });
}
export function robotState(run: Run | null | undefined) {
  const robot = run?.source === "isaac-sim" ? run.evidence.robot : undefined;
  if (!robot || typeof robot !== "object" || Array.isArray(robot)) return null;
  const data = robot as Record<string, unknown>;
  const names = data.joint_names;
  const positions = data.joint_positions_rad;
  const velocities = data.joint_velocities_rad_s;
  if (
    typeof data.model !== "string" ||
    data.model.length > 128 ||
    !Array.isArray(names) ||
    names.length > 32 ||
    !names.every((x) => typeof x === "string" && x.length < 128) ||
    !Array.isArray(positions) ||
    positions.length !== names.length ||
    !positions.every((x) => typeof x === "number" && Number.isFinite(x))
  )
    return null;
  return {
    model: data.model,
    names: names as string[],
    positions: positions as number[],
    velocities:
      Array.isArray(velocities) &&
      velocities.length === names.length &&
      velocities.every((x) => typeof x === "number" && Number.isFinite(x))
        ? (velocities as number[])
        : [],
  };
}

export function robotStates(run: Run | null | undefined) {
  if (run?.source !== "isaac-sim" || !Array.isArray(run.evidence.robots))
    return [];
  const primary = run.evidence.robot as Record<string, unknown> | undefined;
  const seen = new Set<string>();
  return run.evidence.robots.slice(0, 8).flatMap((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return [];
    const robot = item as Record<string, unknown>;
    if (
      typeof robot.id !== "string" ||
      !/^franka-[0-7]$/.test(robot.id) ||
      seen.has(robot.id)
    )
      return [];
    const state = robotState({
      ...run,
      evidence: {
        robot: {
          ...robot,
          joint_names:
            robot.joint_names ??
            (robot.model === primary?.model ? primary?.joint_names : undefined),
        },
      },
    });
    if (!state) return [];
    seen.add(robot.id);
    return [{ ...state, id: robot.id }];
  });
}

export function nativeSceneTaskUnqualified(run: Run | null | undefined) {
  return (
    run?.source === "isaac-sim" &&
    run.status === "failed" &&
    run.evidence.native_scene_passed === true &&
    run.verification.passed === false &&
    run.verification.independent === true &&
    run.verification.error_code === "AUTONOMOUS_TASK_NOT_QUALIFIED" &&
    isaacFrames(run).length > 0
  );
}
