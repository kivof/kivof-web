import type { NextRequest } from "next/server";
import { config } from "@/lib/config";
import { ApiError, boundedText, jsonObject } from "./boundary";

const routes: Record<string, string[]> = {
  "auth/login": ["POST"],
  "auth/me": ["GET"],
  overview: ["GET"],
  models: ["GET"],
  runs: ["GET", "POST"],
  sensors: ["GET"],
  ontology: ["GET"],
  labels: ["GET", "POST"],
  chat: ["POST"],
  "realtime/session": ["POST"],
};
export function allowedRoute(path: string, method: string) {
  return (
    routes[path]?.includes(method) ||
    (method === "GET" && /^runs\/[a-zA-Z0-9_-]{1,128}$/.test(path))
  );
}
export function verifyOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const expected = config().origin;
  if (!expected) throw new ApiError(503, "configuration_missing");
  if (origin !== new URL(expected).origin)
    throw new ApiError(403, "origin_rejected");
}
export async function proxyRequest(request: NextRequest, path: string) {
  const settings = config();
  if (!allowedRoute(path, request.method)) throw new ApiError(404, "not_found");
  if (request.method !== "GET") verifyOrigin(request);
  if (!settings.backend) throw new ApiError(503, "configuration_missing");
  const token = request.cookies.get(settings.cookieName)?.value;
  if (path !== "auth/login" && !token) throw new ApiError(401, "unauthorized");
  const body =
    request.method === "GET"
      ? undefined
      : await boundedText(request, settings.maxBodyBytes);
  if (body) jsonObject(JSON.parse(body));
  const headers = new Headers({ "Content-Type": "application/json" });
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const upstream = await fetch(`${settings.backend}/v1/${path}`, {
    method: request.method,
    headers,
    body,
    cache: "no-store",
    signal: AbortSignal.timeout(180_000),
  });
  if (!upstream.ok)
    throw new ApiError(
      upstream.status,
      upstream.status === 401 ? "unauthorized" : "request_failed",
    );
  return jsonObject(
    JSON.parse(await boundedText(upstream, settings.maxResponseBytes)),
  );
}
