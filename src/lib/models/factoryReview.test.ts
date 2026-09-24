import assert from "node:assert/strict";
import { test } from "node:test";
import { factoryReviewInput, parseFactoryReview } from "./factoryReview";

function review() {
  return {
    id: "review-1",
    label: "soft_cheese",
    note: "Confirmed from source image",
    reviewed_at: "2026-09-24T00:00:00Z",
    source_group: "batch:item",
    data_origin: "recorded",
    origin_verified: false,
    previous_label: "hard_cheese",
    revision: 2,
    reviewer: { id: "operator-1", role: "demo-operator" },
    status: "human_reviewed",
    motor_authority: false,
    training_eligible: false,
    training_scope: "separate_dataset_approval_required",
  };
}
test("review input carries the reviewed revision and never client authority or identity", () => {
  assert.deepEqual(
    factoryReviewInput("soft_cheese", " Check source image ", 3),
    { label: "soft_cheese", note: "Check source image", expected_revision: 3 },
  );
  for (const label of ["", "unlisted", "<script>"])
    assert.throws(() => factoryReviewInput(label, "review", 1));
  for (const note of [" ", "é".repeat(1001), "unsafe\0note"])
    assert.throws(() => factoryReviewInput("hard_cheese", note, 1));
  for (const revision of [0, 1.5, 51, NaN])
    assert.throws(() => factoryReviewInput("hard_cheese", "review", revision));
});
test("review retains submitted provenance, original label and server reviewer identity", () => {
  const value = parseFactoryReview(review());
  assert.equal(value.previous_label, "hard_cheese");
  assert.equal(value.label, "soft_cheese");
  assert.equal(value.source_group, "batch:item");
  assert.equal(value.origin_verified, false);
  assert.equal(value.reviewer.id, "operator-1");
  assert.equal(value.revision, 2);
});
test("review cannot confer motor or training authority", () => {
  for (const field of ["motor_authority", "training_eligible"])
    assert.throws(
      () => parseFactoryReview({ ...review(), [field]: true }),
      /authority/,
    );
  assert.throws(
    () => parseFactoryReview({ ...review(), training_scope: "approved" }),
    /authority/,
  );
});
