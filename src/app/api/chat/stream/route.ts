import { type NextRequest, NextResponse } from "next/server";
import {
  ApiError,
  boundedText,
  jsonObject,
  safeError,
} from "@/lib/api/boundary";
import { upstreamHeaders, verifyOrigin } from "@/lib/api/server";
import { config } from "@/lib/config";

export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  try {
    verifyOrigin(request);
    const settings = config();
    if (!settings.backend) throw new ApiError(503, "configuration_missing");
    const token = request.cookies.get(settings.cookieName)?.value;
    if (!token) throw new ApiError(401, "unauthorized");
    const body = await boundedText(request, settings.maxBodyBytes);
    jsonObject(JSON.parse(body));
    const upstream = await fetch(`${settings.backend}/v1/chat/stream`, {
      method: "POST",
      headers: upstreamHeaders(request.headers, token),
      body,
      cache: "no-store",
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(180_000)]),
    });
    if (!upstream.ok)
      throw new ApiError(
        upstream.status,
        upstream.status === 401
          ? "unauthorized"
          : upstream.status === 429
            ? "rate_limited"
            : "provider_unavailable",
      );
    if (
      !upstream.body ||
      !upstream.headers.get("content-type")?.includes("application/x-ndjson")
    )
      throw new ApiError(502, "invalid_response");
    let bytes = 0;
    const bounded = new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        bytes += chunk.byteLength;
        if (bytes > settings.maxResponseBytes)
          throw new ApiError(502, "invalid_response");
        controller.enqueue(chunk);
      },
    });
    return new Response(upstream.body.pipeThrough(bounded), {
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    const failure = safeError(error);
    return NextResponse.json(
      { error: failure.code },
      { status: failure.status, headers: { "Cache-Control": "no-store" } },
    );
  }
}
