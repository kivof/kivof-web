import { type LiveScene, parseLiveScene } from "@/lib/models/liveScene";
import { waitForLiveFeed } from "./liveFeed";

const MAX_LINE_BYTES = 2_000_000;
const UNAVAILABLE = new Set([404, 405, 501, 503]);

export async function readLiveStream(
  body: ReadableStream<Uint8Array>,
  id: string,
  signal: AbortSignal,
  receive: (scene: LiveScene) => void,
) {
  const reader = body.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let buffer = new Uint8Array(0);
  const abort = () => {
    void reader.cancel().catch(() => undefined);
  };
  signal.addEventListener("abort", abort, { once: true });
  try {
    while (!signal.aborted) {
      const result = await reader.read();
      if (signal.aborted) return;
      if (result.done) {
        if (buffer.length) throw new Error("invalid_live_stream");
        return;
      }
      let offset = 0;
      while (offset < result.value.length) {
        const newline = result.value.indexOf(10, offset);
        const end = newline < 0 ? result.value.length : newline;
        const segment = result.value.subarray(offset, end);
        if (buffer.length + segment.length > MAX_LINE_BYTES)
          throw new Error("live_stream_too_large");
        const line = new Uint8Array(buffer.length + segment.length);
        line.set(buffer);
        line.set(segment, buffer.length);
        if (newline < 0) {
          buffer = line;
          break;
        }
        buffer = new Uint8Array(0);
        offset = newline + 1;
        if (!line.length) continue;
        const scene = parseLiveScene(JSON.parse(decoder.decode(line)));
        if (scene.id !== id) throw new Error("invalid_live_stream");
        receive(scene);
        if (scene.status === "stopped" || scene.status === "failed") return;
      }
    }
  } finally {
    signal.removeEventListener("abort", abort);
    await reader.cancel().catch(() => undefined);
    reader.releaseLock();
  }
}

export async function streamLiveFeed(
  id: string,
  signal: AbortSignal,
  receive: (scene: LiveScene) => void,
  request: typeof fetch = fetch,
): Promise<"unavailable" | "closed"> {
  const timeout = new AbortController();
  let timer = setTimeout(
    () => timeout.abort(new Error("live_stream_timeout")),
    15000,
  );
  const connection = AbortSignal.any([signal, timeout.signal]);
  try {
    const response = await request(`/api/simulation/live/${id}/stream`, {
      credentials: "same-origin",
      cache: "no-store",
      signal: connection,
      headers: { Accept: "application/x-ndjson" },
    });
    if (UNAVAILABLE.has(response.status)) return "unavailable";
    if (!response.ok)
      throw new Error(
        response.status === 401 ? "unauthorized" : "live_stream_unavailable",
      );
    if (
      !response.body ||
      response.headers.get("content-type")?.split(";")[0].trim() !==
        "application/x-ndjson"
    )
      throw new Error("invalid_live_stream");
    await readLiveStream(response.body, id, connection, (scene) => {
      clearTimeout(timer);
      timer = setTimeout(
        () => timeout.abort(new Error("live_stream_timeout")),
        15000,
      );
      receive(scene);
    });
    if (timeout.signal.aborted) throw timeout.signal.reason;
    return "closed";
  } finally {
    clearTimeout(timer);
    timeout.abort();
  }
}

export async function followLiveStream({
  id,
  signal,
  receive,
  active,
  fallback,
  failure,
}: {
  id: string;
  signal: AbortSignal;
  receive: (scene: LiveScene) => void;
  active: () => boolean;
  fallback: () => Promise<void>;
  failure: (error: unknown) => void;
}) {
  while (!signal.aborted && active()) {
    let delay = 0;
    try {
      const result = await streamLiveFeed(id, signal, receive);
      if (signal.aborted || !active()) return;
      if (result === "unavailable") {
        await fallback();
        return;
      }
    } catch (error) {
      if (signal.aborted || !active()) return;
      failure(error);
      delay = 1000;
    }
    await waitForLiveFeed(delay, signal);
  }
}
