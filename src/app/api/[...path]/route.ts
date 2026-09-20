import { type NextRequest, NextResponse } from "next/server";
import { safeError } from "@/lib/api/boundary";
import { proxyRequest, verifyOrigin } from "@/lib/api/server";
import { config } from "@/lib/config";

export const runtime = "nodejs";
async function handle(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const path = (await context.params).path.join("/");
  const settings = config();
  try {
    if (path === "auth/logout" && request.method === "POST") {
      verifyOrigin(request);
      const response = NextResponse.json({ ok: true });
      response.cookies.set(settings.cookieName, "", {
        httpOnly: true,
        secure: settings.secureCookie,
        sameSite: "strict",
        path: "/",
        maxAge: 0,
      });
      return response;
    }
    const data = await proxyRequest(request, path);
    if (path === "realtime/session") data.url = settings.realtime;
    const token = path === "auth/login" ? data.token : undefined;
    if (path === "auth/login") delete data.token;
    const response = NextResponse.json(data, {
      headers: { "Cache-Control": "no-store" },
    });
    if (typeof token === "string" && token.length > 0 && token.length < 4096)
      response.cookies.set(settings.cookieName, token, {
        httpOnly: true,
        secure: settings.secureCookie,
        sameSite: "strict",
        path: "/",
        maxAge: settings.sessionSeconds,
      });
    return response;
  } catch (error) {
    const failure = safeError(error);
    return NextResponse.json(
      { error: failure.code },
      { status: failure.status, headers: { "Cache-Control": "no-store" } },
    );
  }
}
export const GET = handle;
export const POST = handle;
