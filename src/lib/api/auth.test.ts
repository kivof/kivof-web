import assert from "node:assert/strict";
import { test } from "node:test";
import { NextRequest } from "next/server";
import { GET, POST } from "@/app/api/[...path]/route";
import { startDemoSession } from "./auth";

const origin = "https://workspace.example.test";
const token = "t".repeat(64);
const user = {
  id: "demo-operator",
  role: "demo-operator",
  tenant_id: "demo-test",
};
const keys = [
  "APP_ORIGIN",
  "BACKEND_URL",
  "DEMO_LOGIN_ENABLED",
  "SESSION_COOKIE_SECURE",
];

async function configured(run: () => Promise<void>) {
  const saved = keys.map((key) => process.env[key]);
  const fetch = globalThis.fetch;
  process.env.APP_ORIGIN = origin;
  process.env.BACKEND_URL = "https://backend.example.test";
  process.env.DEMO_LOGIN_ENABLED = "true";
  process.env.SESSION_COOKIE_SECURE = "true";
  try {
    await run();
  } finally {
    globalThis.fetch = fetch;
    keys.forEach((key, index) => {
      if (saved[index] === undefined) delete process.env[key];
      else process.env[key] = saved[index];
    });
  }
}

function post(
  path = "auth/demo",
  body = "{}",
  requestOrigin: string | null = origin,
) {
  const headers = new Headers({ "Content-Type": "application/json" });
  if (requestOrigin !== null) headers.set("Origin", requestOrigin);
  const request = new NextRequest(`${origin}/api/${path}`, {
    method: "POST",
    headers,
    body,
  });
  return POST(request, { params: Promise.resolve({ path: path.split("/") }) });
}

test("demo BFF creates a strict HttpOnly session without returning credentials", () =>
  configured(async () => {
    let calls = 0;
    globalThis.fetch = async (url, init) => {
      calls += 1;
      assert.equal(url, "https://backend.example.test/v1/auth/demo");
      assert.equal(init?.method, "POST");
      assert.equal(init?.body, "{}");
      assert.equal(new Headers(init?.headers).get("authorization"), null);
      return Response.json({ token, user, expires_at: 2_000_000_000 });
    };
    const response = await post();
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), {
      user,
      expires_at: 2_000_000_000,
    });
    assert.equal(response.headers.get("cache-control"), "no-store");
    const cookie = response.headers.get("set-cookie") ?? "";
    for (const attribute of [
      "kivof_session=",
      "HttpOnly",
      "Secure",
      "SameSite=strict",
      "Path=/",
      "Max-Age=28800",
    ])
      assert.ok(cookie.includes(attribute), attribute);
    assert.equal(calls, 1);
  }));

test("demo requires opt-in, the exact origin and an empty JSON object", () =>
  configured(async () => {
    globalThis.fetch = async () => {
      throw new Error("rejected request reached upstream");
    };
    for (const flag of [undefined, "false", "TRUE"]) {
      if (flag === undefined) delete process.env.DEMO_LOGIN_ENABLED;
      else process.env.DEMO_LOGIN_ENABLED = flag;
      const response = await post();
      assert.equal(response.status, 403);
      assert.deepEqual(await response.json(), { error: "demo_login_disabled" });
      assert.equal(response.headers.get("set-cookie"), null);
    }
    process.env.DEMO_LOGIN_ENABLED = "true";
    for (const requestOrigin of [
      null,
      "https://attacker.example.test",
      `${origin}.attacker.test`,
    ])
      assert.equal((await post("auth/demo", "{}", requestOrigin)).status, 403);
    for (const body of [
      "",
      "[]",
      "null",
      "malformed",
      '{"role":"admin"}',
      '{"tenant":"other"}',
      '{"password":"ignored"}',
    ])
      assert.equal((await post("auth/demo", body)).status, 400);
    assert.equal(
      (
        await post(
          "auth/demo",
          JSON.stringify({ note: "a".repeat(512 * 1024) }),
        )
      ).status,
      413,
    );
    const get = new NextRequest(`${origin}/api/auth/demo`);
    assert.equal(
      (await GET(get, { params: Promise.resolve({ path: ["auth", "demo"] }) }))
        .status,
      404,
    );
  }));

test("demo failures never create a cookie and preserve bounded failure codes", () =>
  configured(async () => {
    for (const [status, code] of [
      [403, "demo_login_disabled"],
      [429, "request_budget_exhausted"],
    ] as const) {
      globalThis.fetch = async () =>
        Response.json(
          { error: { code, message: "private diagnostic" } },
          { status },
        );
      const response = await post();
      assert.equal(response.status, status);
      assert.deepEqual(await response.json(), { error: code });
      assert.equal(response.headers.get("set-cookie"), null);
    }
    for (const invalid of [undefined, "", 123, "t".repeat(4096)]) {
      globalThis.fetch = async () => Response.json({ token: invalid, user });
      const response = await post();
      assert.equal(response.status, 502);
      assert.equal(response.headers.get("set-cookie"), null);
    }
  }));

test("password login stays available when demo is disabled", () =>
  configured(async () => {
    process.env.DEMO_LOGIN_ENABLED = "false";
    globalThis.fetch = async (url, init) => {
      assert.equal(url, "https://backend.example.test/v1/auth/login");
      assert.deepEqual(JSON.parse(String(init?.body)), {
        email: "operator@example.test",
        password: "test-only",
      });
      return Response.json({ token, user });
    };
    const response = await post(
      "auth/login",
      JSON.stringify({ email: "operator@example.test", password: "test-only" }),
    );
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { user });
    assert.ok(response.headers.get("set-cookie")?.includes("HttpOnly"));
  }));

test("demo client uses one empty same-origin request without a password", () =>
  configured(async () => {
    globalThis.fetch = async (url, init) => {
      assert.equal(url, "/api/auth/demo");
      assert.equal(init?.method, "POST");
      assert.equal(init?.credentials, "same-origin");
      assert.equal(init?.body, "{}");
      return Response.json({ user });
    };
    assert.deepEqual(await startDemoSession(), { user });
  }));
