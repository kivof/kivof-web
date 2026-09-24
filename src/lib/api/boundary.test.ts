import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ApiError,
  boundedText,
  jsonObject,
  safeError,
  upstreamErrorCode,
} from "./boundary";
import { allowedRoute, upstreamHeaders } from "./server";

test("bounded response rejects overflow", async () => {
  await assert.rejects(boundedText(new Response("too large"), 3), ApiError);
});
test("objects and upstream paths reject untrusted shapes", () => {
  assert.throws(() => jsonObject([]));
  assert.equal(allowedRoute("../../secrets", "GET"), false);
  assert.equal(allowedRoute("runs/a?token=secret", "GET"), false);
  assert.equal(allowedRoute("runs/run-1", "GET"), true);
  assert.equal(allowedRoute("auth/login", "GET"), false);
});
test("unknown errors never expose provider text", () => {
  assert.deepEqual(safeError(new Error("private upstream payload")), {
    status: 502,
    code: "service_unavailable",
  });
});

test("safe failure codes support the backend error envelope without exposing its message", () => {
  assert.equal(
    upstreamErrorCode({
      error: { code: "live_worker_busy", message: "private diagnostic" },
    }),
    "live_worker_busy",
  );
  assert.equal(
    upstreamErrorCode({ error: "provider_unavailable" }),
    "provider_unavailable",
  );
  assert.equal(
    upstreamErrorCode({
      error: { code: "private_secret", message: "private diagnostic" },
    }),
    undefined,
  );
  assert.equal(
    upstreamErrorCode({ error: "<script>unsafe</script>" }),
    undefined,
  );
});

test("live simulation routes constrain methods and session paths", () => {
  assert.equal(allowedRoute("simulation/live", "POST"), true);
  assert.equal(allowedRoute("simulation/live", "GET"), false);
  assert.equal(allowedRoute("simulation/live/scene-1", "GET"), true);
  assert.equal(allowedRoute("simulation/live/scene-1", "DELETE"), true);
  assert.equal(allowedRoute("simulation/live/scene-1/camera", "POST"), true);
  for (const path of [
    "simulation/live/../camera",
    "simulation/live/x/execute",
    "simulation/live/x?secret=y",
  ])
    assert.equal(allowedRoute(path, "POST"), false);
});

test("authenticated history and model routes are precisely allowlisted", () => {
  assert.equal(allowedRoute("chat", "DELETE"), true);
  assert.equal(allowedRoute("chat/record-1/image", "GET"), true);
  assert.equal(allowedRoute("chat/record-1/image", "POST"), false);
  assert.equal(allowedRoute("learning/policy", "POST"), true);
  assert.equal(allowedRoute("learning/policy/shell", "POST"), false);
});

test("assistant context and tool routes allow only the intended methods", () => {
  assert.equal(allowedRoute("assistant/context", "GET"), true);
  assert.equal(allowedRoute("assistant/context", "POST"), false);
  assert.equal(allowedRoute("assistant/tools", "POST"), true);
  assert.equal(allowedRoute("assistant/tools", "GET"), false);
  assert.equal(allowedRoute("assistant/tools/execute", "POST"), false);
});

test("BFF preserves bounded idempotency keys without trusting caller authorization", () => {
  const incoming = new Headers({
    "idempotency-key": "native-run-123",
    Authorization: "Bearer untrusted",
    "x-private-header": "never forwarded",
  });
  const forwarded = upstreamHeaders(incoming, "session-token");
  assert.equal(forwarded.get("idempotency-key"), "native-run-123");
  assert.equal(forwarded.get("authorization"), "Bearer session-token");
  assert.equal(forwarded.get("x-private-header"), null);
  assert.equal(upstreamHeaders(new Headers()).get("idempotency-key"), null);
  for (const value of ["", "a".repeat(129), "ambiguous key", "é"])
    assert.throws(
      () => upstreamHeaders(new Headers({ "idempotency-key": value })),
      ApiError,
    );
});

test("factory routes isolate analysis from simulation and reject arbitrary actions", () => {
  assert.equal(allowedRoute("factory", "GET"), true);
  assert.equal(allowedRoute("factory/simulate", "POST"), true);
  assert.equal(allowedRoute("factory/analyze", "POST"), true);
  assert.equal(allowedRoute("factory/record-1", "GET"), true);
  assert.equal(allowedRoute("factory/execute", "POST"), false);
  assert.equal(allowedRoute("factory/../secrets", "GET"), false);
  assert.equal(allowedRoute("factory", "DELETE"), false);
});

test("human factory review is a constrained POST route", () => {
  assert.equal(allowedRoute("factory/record-1/labels", "POST"), true);
  assert.equal(allowedRoute("factory/record-1/labels", "DELETE"), false);
  assert.equal(allowedRoute("factory/record-1/labels", "GET"), false);
  assert.equal(allowedRoute("factory/../labels", "POST"), false);
});
