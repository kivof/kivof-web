import type { NextRequest } from "next/server";
import { safeError } from "@/lib/api/boundary";
import { proxyLiveStream } from "@/lib/api/liveStream";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    return await proxyLiveStream(request, (await context.params).id);
  } catch (error) {
    const failure = safeError(error);
    return Response.json(
      { error: failure.code },
      {
        status: failure.status,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
