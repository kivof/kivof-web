import assert from "node:assert/strict";
import { test } from "node:test";
import { actionSequence, vector } from "./learningInput";

test("policy state and world actions reject malformed or nonfinite inputs", () => {
  assert.throws(() => vector(""));
  assert.throws(() => vector("1,NaN"));
  assert.throws(() => actionSequence("[[true]]"));
  assert.throws(() => actionSequence("[[1e400]]"));
  assert.deepEqual(vector("1, 2, 3"), [1, 2, 3]);
  assert.deepEqual(actionSequence("[[1,2]]"), [[1, 2]]);
});
