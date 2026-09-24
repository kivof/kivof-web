import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";
import { pagePolicy } from "./pagePolicy";

describe("presentation framing boundaries", () => {
  const origins = ["https://player.vimeo.com", "https://adiy.ch"];
  test("only the current deck can load configured external frames", () => {
    assert.deepEqual(pagePolicy("/deck/JO202609240900", origins), {
      frameSources: "'self' https://player.vimeo.com https://adiy.ch",
      frameAncestors: "'none'",
      frameOptions: "DENY",
      embedderPolicy: "unsafe-none",
    });
  });
  test("the workspace permits same-origin presentation framing", () => {
    for (const path of ["/workspace", "/workspace/factory"])
      assert.deepEqual(pagePolicy(path, origins), {
        frameSources: "'none'",
        frameAncestors: "'self'",
        frameOptions: "SAMEORIGIN",
        embedderPolicy: "unsafe-none",
      });
  });
  test("authentication, APIs and lookalike paths stay unframeable", () => {
    for (const path of [
      "/login",
      "/login/",
      "/api",
      "/api/auth/demo",
      "/",
      "/workspace-other",
      "/deck/JO202609240900/other",
      "/deck/JO202609190900",
    ]) {
      assert.deepEqual(pagePolicy(path, origins), {
        frameSources: "'none'",
        frameAncestors: "'none'",
        frameOptions: "DENY",
        embedderPolicy: "require-corp",
      });
    }
  });
});

test("response headers apply the route policy without relaxing scripts or authentication", () => {
  const previous = process.env.DECK_FRAME_ORIGINS;
  const previousOrigin = process.env.APP_ORIGIN;
  process.env.DECK_FRAME_ORIGINS = "https://player.vimeo.com,https://adiy.ch";
  process.env.APP_ORIGIN = "https://workspace.example.test";
  try {
    for (const [path, ancestors, options, embedder] of [
      ["/deck/JO202609240900", "'none'", "DENY", "unsafe-none"],
      ["/workspace/factory", "'self'", "SAMEORIGIN", "unsafe-none"],
      ["/login", "'none'", "DENY", "require-corp"],
      ["/api/auth/demo", "'none'", "DENY", "require-corp"],
    ]) {
      const response = proxy(
        new NextRequest(`${process.env.APP_ORIGIN}${path}`),
      );
      const csp = response.headers.get("Content-Security-Policy") ?? "";
      assert.ok(csp.includes(`frame-ancestors ${ancestors};`));
      assert.equal(response.headers.get("X-Frame-Options"), options);
      assert.equal(
        response.headers.get("Cross-Origin-Embedder-Policy"),
        embedder,
      );
      assert.equal(response.headers.get("Cache-Control"), "no-store");
      assert.equal(
        response.headers.get("Cross-Origin-Resource-Policy"),
        "same-origin",
      );
      assert.ok(csp.includes("'strict-dynamic'"));
      assert.ok(
        !csp.includes("'unsafe-inline'") && !csp.includes("'unsafe-eval'"),
      );
      assert.equal(
        csp.includes("https://player.vimeo.com"),
        path.startsWith("/deck/"),
      );
      if (!path.startsWith("/deck/"))
        assert.ok(csp.includes("frame-src 'none';"));
    }
  } finally {
    if (previous === undefined) delete process.env.DECK_FRAME_ORIGINS;
    else process.env.DECK_FRAME_ORIGINS = previous;
    if (previousOrigin === undefined) delete process.env.APP_ORIGIN;
    else process.env.APP_ORIGIN = previousOrigin;
  }
});
