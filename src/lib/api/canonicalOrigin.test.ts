import assert from "node:assert/strict";
import { test } from "node:test";
import { canonicalPageUrl } from "./canonicalOrigin";

const origin = "https://app.example.test";
function request(path: string, method = "GET", headers = {}) {
  return new Request(`http://internal.example.test${path}`, {
    method,
    headers: { host: "previous.example.test", accept: "text/html", ...headers },
  });
}

test("old-origin document requests retain their path and language query", () => {
  for (const method of ["GET", "HEAD"])
    assert.equal(
      canonicalPageUrl(request("/workspace/robots?lang=de", method), origin)
        ?.href,
      `${origin}/workspace/robots?lang=de`,
    );
});

test("canonical ingress host avoids a redirect loop behind internal HTTP", () => {
  assert.equal(
    canonicalPageUrl(request("/", "GET", { host: "app.example.test" }), origin),
    undefined,
  );
  assert.equal(canonicalPageUrl(request("/"), undefined), undefined);
});

test("API traffic, writes, and static resources are not redirected", () => {
  for (const path of ["/api/health", "/api/auth/login", "/_next/static/app.js"])
    assert.equal(canonicalPageUrl(request(path), origin), undefined);
  assert.equal(canonicalPageUrl(request("/", "POST"), origin), undefined);
  assert.equal(
    canonicalPageUrl(request("/sw.js", "GET", { accept: "*/*" }), origin),
    undefined,
  );
});

test("untrusted host, forwarded host, and URL-like paths cannot choose the target", () => {
  const incoming = request("//attacker.test/path?lang=fr", "GET", {
    host: "attacker.test",
    "x-forwarded-host": "app.example.test",
  });
  const target = canonicalPageUrl(incoming, origin);
  assert.equal(target?.origin, origin);
  assert.equal(target?.pathname, "//attacker.test/path");
  assert.equal(target?.search, "?lang=fr");
});
