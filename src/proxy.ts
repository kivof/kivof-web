import { type NextRequest, NextResponse } from "next/server";
import { canonicalPageUrl } from "@/lib/api/canonicalOrigin";
import { config as settings } from "@/lib/config";
export function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const configuration = settings();
  const endpoint = configuration.realtime;
  const connect = endpoint ? ` ${new URL(endpoint).origin}` : "";
  const csp = `default-src 'self'; script-src 'self' 'nonce-${nonce}' 'strict-dynamic'; style-src 'self' 'nonce-${nonce}'; style-src-attr 'none'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'${connect}; media-src 'self' blob:; worker-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; report-uri /api/csp-report; report-to csp;`;
  const headers = new Headers(request.headers);
  headers.set("x-nonce", nonce);
  headers.set("Content-Security-Policy", csp);
  const canonical = canonicalPageUrl(request, configuration.origin);
  const response = canonical
    ? NextResponse.redirect(canonical, 307)
    : NextResponse.next({ request: { headers } });
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Reporting-Endpoints", 'csp="/api/csp-report"');
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Embedder-Policy", "require-corp");
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin");
  // Microphone is available only after an explicit user-started voice action.
  response.headers.set(
    "Permissions-Policy",
    "microphone=(self), camera=(), geolocation=(), payment=(), usb=(), accelerometer=(), gyroscope=(), magnetometer=(), browsing-topics=()",
  );
  if (request.nextUrl.protocol === "https:")
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload",
    );
  return response;
}
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
