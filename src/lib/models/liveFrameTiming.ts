import type { LiveScene } from "./liveScene";

export type FrameSample = {
  sequence: number;
  received: number;
  captured: number;
  simulation: number;
};

export function sampleLiveFrame(
  previous: FrameSample[],
  scene: LiveScene,
  received: number,
): FrameSample[] {
  if (!scene.frame || scene.sequence <= (previous.at(-1)?.sequence ?? -1))
    return previous;
  return [
    ...previous.slice(-15),
    {
      sequence: scene.sequence,
      received,
      captured: Date.parse(scene.captured_at ?? ""),
      simulation: scene.simulation_time_s ?? 0,
    },
  ];
}

export function liveFrameTiming(samples: FrameSample[], now: number) {
  const first = samples[0];
  const last = samples.at(-1);
  const elapsed = first && last ? last.received - first.received : 0;
  const captured = first && last ? last.captured - first.captured : 0;
  return {
    age: last ? Math.max(0, now - last.captured) / 1000 : 0,
    fps: elapsed > 0 ? ((samples.length - 1) * 1000) / elapsed : 0,
    speed:
      captured > 0 && last && first
        ? ((last.simulation - first.simulation) * 1000) / captured
        : null,
  };
}
