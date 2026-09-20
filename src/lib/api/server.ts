import type { NextRequest } from "next/server";
import { config } from "@/lib/config";
import { ApiError, boundedText, jsonObject } from "./boundary";

const routes: Record<string, string[]> = {
  "auth/login": ["POST"],
  "auth/me": ["GET"],
  "auth/logout": ["POST"],
  overview: ["GET"],
  models: ["GET"],
  runs: ["GET", "POST"],
  sensors: ["GET"],
  ontology: ["GET"],
  labels: ["GET", "POST"],
  chat: ["GET", "POST", "DELETE"],
  learning: ["GET"],
  "learning/policy": ["POST"],
  "learning/training": ["GET", "POST"],
  "learning/world-model": ["POST"],
  "realtime/session": ["POST"],
};
export function allowedRoute(path: string, method: string) {
  return (
    routes[path]?.includes(method) ||
    ((method === "GET" || method === "DELETE") &&
      /^learning\/training\/[a-zA-Z0-9_-]{1,128}$/.test(path)) ||
    (method === "GET" && /^chat\/[a-zA-Z0-9_-]{1,128}\/image$/.test(path)) ||
    (method === "DELETE" && /^labels\/[a-zA-Z0-9_-]{1,128}$/.test(path)) ||
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
export function upstreamHeaders(incoming: Headers, token?: string) {
  const headers = new Headers({ "Content-Type": "application/json" });
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const key = incoming.get("idempotency-key");
  if (key !== null) {
    if (!/^[\x21-\x7e]{1,128}$/.test(key))
      throw new ApiError(400, "invalid_request");
    headers.set("idempotency-key", key);
  }
  return headers;
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
  const headers = upstreamHeaders(request.headers, token);
  const upstream = await fetch(`${settings.backend}/v1/${path}`, {
    method: request.method,
    headers,
    body,
    cache: "no-store",
    signal: AbortSignal.any([request.signal, AbortSignal.timeout(180_000)]),
  });
  if (!upstream.ok) {
    const safeCodes = [
      "unauthorized",
      "invalid_request",
      "rate_limited",
      "model_unavailable_or_output_rejected",
      "provider_unavailable",
      "review_rejected",
    ];
    const errorBody = await boundedText(upstream, 4096);
    let code = upstream.status === 401 ? "unauthorized" : "request_failed";
    try {
      const candidate = JSON.parse(errorBody).error;
      if (safeCodes.includes(candidate)) code = candidate;
    } catch {
      code = "request_failed";
    }
    throw new ApiError(upstream.status, code);
  }
  return jsonObject(
    JSON.parse(await boundedText(upstream, settings.maxResponseBytes)),
  );
}
