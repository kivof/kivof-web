import type { LiveScene } from "@/lib/models/liveScene";

const MIN_REQUEST_INTERVAL_MS = 125;

export function waitForLiveFeed(
  delay: number,
  signal: AbortSignal,
): Promise<void> {
  return new Promise((resolve) => {
    const finish = () => {
      clearTimeout(timer);
      signal.removeEventListener("abort", finish);
      resolve();
    };
    const timer = setTimeout(finish, delay);
    signal.addEventListener("abort", finish, { once: true });
    if (signal.aborted) finish();
  });
}

export async function pollLiveFeed({
  signal,
  read,
  receive,
  failure,
  visible = () => !document.hidden,
  now = () => performance.now(),
  pause = waitForLiveFeed,
}: {
  signal: AbortSignal;
  read: (signal: AbortSignal) => Promise<LiveScene>;
  receive: (scene: LiveScene) => void;
  failure: (error: unknown) => boolean;
  visible?: () => boolean;
  now?: () => number;
  pause?: (delay: number, signal: AbortSignal) => Promise<void>;
}) {
  while (!signal.aborted) {
    const started = now();
    let delay = MIN_REQUEST_INTERVAL_MS;
    try {
      if (visible()) {
        const scene = await read(signal);
        if (signal.aborted) return;
        receive(scene);
        if (scene.status === "failed" || scene.status === "stopped") return;
        if (scene.status === "starting") delay = 500;
      } else delay = 1000;
    } catch (error) {
      if (signal.aborted || !failure(error)) return;
      delay = 1000;
    }
    if (!signal.aborted)
      await pause(Math.max(0, delay - (now() - started)), signal);
  }
}
