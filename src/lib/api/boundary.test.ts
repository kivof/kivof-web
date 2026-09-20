import assert from "node:assert/strict";
import { test } from "node:test";
import { ApiError, boundedText, jsonObject, safeError } from "./boundary";
import { allowedRoute } from "./server";

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
