import assert from "node:assert/strict";
import { test } from "node:test";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { renderToStaticMarkup } from "react-dom/server";
import { SignIn } from "./SignIn";

const router = {
  back() {},
  forward() {},
  refresh() {},
  push() {},
  replace() {},
  prefetch() {},
  bfcacheId: "sign-in-test",
};

function render(demoEnabled: boolean) {
  return renderToStaticMarkup(
    <AppRouterContext.Provider value={router}>
      <SignIn demoEnabled={demoEnabled} />
    </AppRouterContext.Provider>,
  );
}

test("demo button is opt-in and never autofills login credentials", () => {
  const enabled = render(true);
  const disabled = render(false);
  assert.ok(enabled.includes("Try the demo"));
  assert.ok(enabled.indexOf("Try the demo") < enabled.indexOf("<form"));
  assert.ok(enabled.includes("A new session starts fresh."));
  assert.ok(!disabled.includes("Try the demo"));
  for (const html of [enabled, disabled]) {
    assert.match(html, /type="email"[^>]*required=""[^>]*value=""/);
    assert.match(html, /type="password"[^>]*required=""[^>]*value=""/);
    assert.ok(html.includes('autoComplete="current-password"'));
    assert.ok(html.includes('type="submit"'));
  }
});
