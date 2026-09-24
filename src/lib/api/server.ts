import type { NextRequest } from "next/server";
import { config } from "@/lib/config";
import {
  ApiError,
  boundedText,
  jsonObject,
  upstreamErrorCode,
} from "./boundary";

const routes: Record<string, string[]> = {
  "auth/login": ["POST"],
  "auth/demo": ["POST"],
  "auth/me": ["GET"],
  "auth/logout": ["POST"],
  overview: ["GET"],
  factory: ["GET"],
  "factory/simulate": ["POST"],
  "factory/analyze": ["POST"],
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
  "assistant/context": ["GET"],
  "assistant/tools": ["POST"],
  "simulation/live": ["POST"],
};
export function allowedRoute(path: string, method: string) {
  return (
    routes[path]?.includes(method) ||
    (method === "POST" &&
      /^factory\/[a-zA-Z0-9_-]{1,128}\/labels$/.test(path)) ||
    ((method === "GET" || method === "DELETE") &&
      /^simulation\/live\/[a-zA-Z0-9_-]{1,128}$/.test(path)) ||
    (method === "POST" &&
      /^simulation\/live\/[a-zA-Z0-9_-]{1,128}\/camera$/.test(path)) ||
    ((method === "GET" || method === "DELETE") &&
      /^learning\/training\/[a-zA-Z0-9_-]{1,128}$/.test(path)) ||
    (method === "GET" && /^chat\/[a-zA-Z0-9_-]{1,128}\/image$/.test(path)) ||
    (method === "DELETE" && /^labels\/[a-zA-Z0-9_-]{1,128}$/.test(path)) ||
    (method === "GET" && /^factory\/[a-zA-Z0-9_-]{1,128}$/.test(path)) ||
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
  if (path === "auth/demo" && !settings.demoLoginEnabled)
    throw new ApiError(403, "demo_login_disabled");
  if (!settings.backend) throw new ApiError(503, "configuration_missing");
  const token = request.cookies.get(settings.cookieName)?.value;
  if (path !== "auth/login" && path !== "auth/demo" && !token)
    throw new ApiError(401, "unauthorized");
  const body =
    request.method === "GET"
      ? undefined
      : await boundedText(request, settings.maxBodyBytes);
  if (path === "auth/demo") {
    let input: Record<string, unknown>;
    try {
      input = jsonObject(JSON.parse(body ?? ""));
    } catch {
      throw new ApiError(400, "invalid_request");
    }
    if (Object.keys(input).length) throw new ApiError(400, "invalid_request");
  } else if (body) jsonObject(JSON.parse(body));
  const headers = upstreamHeaders(request.headers, token);
  const upstream = await fetch(`${settings.backend}/v1/${path}`, {
    method: request.method,
    headers,
    body,
    cache: "no-store",
    signal: AbortSignal.any([request.signal, AbortSignal.timeout(180_000)]),
  });
  if (!upstream.ok) {
    const errorBody = await boundedText(upstream, 4096);
    let code = upstream.status === 401 ? "unauthorized" : "request_failed";
    try {
      code = upstreamErrorCode(JSON.parse(errorBody)) ?? code;
    } catch {
      code = "request_failed";
    }
    throw new ApiError(upstream.status, code);
  }
  return jsonObject(
    JSON.parse(await boundedText(upstream, settings.maxResponseBytes)),
  );
}
