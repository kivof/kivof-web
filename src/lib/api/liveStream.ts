import type { NextRequest } from "next/server";
import { config } from "@/lib/config";
import { parseLiveScene } from "@/lib/models/liveScene";
import { ApiError, boundedText, upstreamErrorCode } from "./boundary";
import { upstreamHeaders } from "./server";

const MAX_FRAME_BYTES = 2_000_000;

export function validatedLiveFrames(id: string) {
  const decoder = new TextDecoder("utf-8", { fatal: true });
  const encoder = new TextEncoder();
  let pending = "";
  return new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      pending += decoder.decode(chunk, { stream: true });
      let newline = pending.indexOf("\n");
      while (newline >= 0) {
        const line = pending.slice(0, newline);
        pending = pending.slice(newline + 1);
        if (line.trim()) {
          if (encoder.encode(line).length > MAX_FRAME_BYTES)
            throw new ApiError(502, "live_output_rejected");
          const scene = parseLiveScene(JSON.parse(line));
          if (scene.id !== id) throw new ApiError(502, "live_output_rejected");
          controller.enqueue(encoder.encode(`${line}\n`));
        }
        newline = pending.indexOf("\n");
      }
      if (encoder.encode(pending).length > MAX_FRAME_BYTES)
        throw new ApiError(502, "live_output_rejected");
    },
    flush() {
      pending += decoder.decode();
      if (pending.trim()) throw new ApiError(502, "live_output_rejected");
    },
  });
}

async function streamFailure(response: Response) {
  let code = response.status === 401 ? "unauthorized" : "live_unavailable";
  try {
    code =
      upstreamErrorCode(JSON.parse(await boundedText(response, 4096))) ?? code;
  } catch {
    // Never relay arbitrary upstream diagnostics into the browser stream.
  }
  return new ApiError(response.status, code);
}

export async function proxyLiveStream(request: NextRequest, id: string) {
  if (!/^[a-zA-Z0-9_-]{1,128}$/.test(id))
    throw new ApiError(400, "invalid_request");
  const settings = config();
  const token = request.cookies.get(settings.cookieName)?.value;
  if (!token) throw new ApiError(401, "unauthorized");
  if (!settings.backend) throw new ApiError(503, "configuration_missing");
  const upstream = await fetch(
    `${settings.backend}/v1/simulation/live/${id}/stream`,
    {
      headers: upstreamHeaders(new Headers(), token),
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(40000)]),
    },
  );
  if (!upstream.ok) throw await streamFailure(upstream);
  if (
    !upstream.body ||
    !upstream.headers.get("content-type")?.startsWith("application/x-ndjson")
  ) {
    await upstream.body?.cancel();
    throw new ApiError(502, "live_output_rejected");
  }
  return new Response(upstream.body.pipeThrough(validatedLiveFrames(id)), {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "X-Accel-Buffering": "no",
    },
  });
}
