import assert from "node:assert/strict";
import { test } from "node:test";
import { ApiError, boundedText, jsonObject, safeError } from "./boundary";
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

test("authenticated history and model routes are precisely allowlisted", () => {
  assert.equal(allowedRoute("chat", "DELETE"), true);
  assert.equal(allowedRoute("chat/record-1/image", "GET"), true);
  assert.equal(allowedRoute("chat/record-1/image", "POST"), false);
  assert.equal(allowedRoute("learning/policy", "POST"), true);
  assert.equal(allowedRoute("learning/policy/shell", "POST"), false);
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
