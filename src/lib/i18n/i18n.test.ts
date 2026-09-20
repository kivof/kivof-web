import assert from "node:assert/strict";
import { test } from "node:test";
import { dictionaries } from "./index";

test("every language has complete nonempty copy", () => {
  const keys = Object.keys(dictionaries.en);
  for (const [locale, copy] of Object.entries(dictionaries)) {
    assert.deepEqual(Object.keys(copy), keys, locale);
    for (const key of keys) assert.ok(copy[key]?.trim(), `${locale}:${key}`);
  }
});
