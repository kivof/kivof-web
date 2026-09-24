import assert from "node:assert/strict";
import { test } from "node:test";
import { checkedFrameOrigins } from "./config";

test("deck frame origins default closed and normalize HTTPS origins", () => {
  assert.deepEqual(checkedFrameOrigins(undefined), []);
  assert.deepEqual(
    checkedFrameOrigins(
      "https://player.vimeo.com, https://adiy.ch/ ,https://adiy.ch",
    ),
    ["https://player.vimeo.com", "https://adiy.ch"],
  );
  assert.deepEqual(checkedFrameOrigins("HTTPS://PLAYER.VIMEO.COM:443"), [
    "https://player.vimeo.com",
  ]);
});

test("deck frame origins reject credentials, paths, queries and insecure sources", () => {
  for (const value of [
    "http://adiy.ch",
    "https://user:pass@adiy.ch",
    "https://adiy.ch/cheese",
    "https://adiy.ch?token=secret",
    "https://adiy.ch#frame",
    "javascript:alert(1)",
    "https://adiy.ch; script-src *",
    "https://adiy.ch;frame-src",
    "https://*.adiy.ch",
    "https://%2A.adiy.ch",
    "https://adiy.ch/..",
    "https://adiy.ch?",
    "https://adiy.ch#",
    "https:\\\\adiy.ch",
    "https://adiy.\nch",
    "https://adiy.ch,",
  ])
    assert.throws(() => checkedFrameOrigins(value), value);
});
