import { parseLiveScene } from "@/lib/models/liveScene";

export function confirmLiveStop(id: string, value: unknown) {
  const scene = parseLiveScene(value);
  if (scene.id !== id || scene.status !== "stopped")
    throw new Error("live_stop_unconfirmed");
  return scene;
}
