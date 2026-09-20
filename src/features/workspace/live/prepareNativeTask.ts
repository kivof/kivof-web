import { api } from "@/lib/api/client";
import { parseLiveScene } from "@/lib/models/liveScene";

type Request = (path: string, method: "GET" | "DELETE") => Promise<unknown>;
const request: Request = (path, method) =>
  api(path, undefined, undefined, method);

export async function prepareNativeTask(
  read: Request = request,
  publish: (value: unknown) => void = (value) =>
    window.dispatchEvent(
      new CustomEvent("kivof:live-session", { detail: value }),
    ),
) {
  const context = await read("assistant/context", "GET");
  if (!context || typeof context !== "object" || Array.isArray(context))
    throw new Error("invalid_response");
  const id = (context as Record<string, unknown>).current_live_session;
  if (id === null) return;
  if (typeof id !== "string" || !/^[a-zA-Z0-9_-]{1,128}$/.test(id))
    throw new Error("invalid_response");
  const result = await read(`simulation/live/${id}`, "DELETE");
  const scene = parseLiveScene(result);
  if (scene.id !== id || scene.status !== "stopped")
    throw new Error("live_stop_unconfirmed");
  publish(result);
}
