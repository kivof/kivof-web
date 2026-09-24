export const factoryLabelClasses = [
  "hard_cheese",
  "emmental_cheese",
  "semi_hard_cheese",
  "raclette_cheese",
  "soft_cheese",
  "goat_cheese_soft",
  "processed_cheese",
  "fresh_cheese",
  "cottage_cheese",
  "cream_cheese",
  "blue_mould_cheese",
  "not_cheese",
  "empty",
] as const;
export type FactoryLabelReview = {
  id: string;
  label: string;
  note: string;
  reviewed_at: string;
  source_group: string;
  data_origin: string;
  origin_verified: boolean;
  previous_label: string | null;
  revision: number;
  reviewer: { id: string; role: string };
};
function text(value: unknown, max = 2000): string {
  if (
    typeof value !== "string" ||
    !value.trim() ||
    value.length > max ||
    value.includes("\0")
  )
    throw new Error("invalid_factory_review");
  return value;
}
export function factoryRevision(value: unknown): number {
  if (
    typeof value !== "number" ||
    !Number.isSafeInteger(value) ||
    value < 1 ||
    value > 51
  )
    throw new Error("invalid_factory_revision");
  return value;
}
export function factoryReviewInput(
  label: string,
  note: string,
  revision: number,
) {
  if (
    !factoryLabelClasses.includes(
      label as (typeof factoryLabelClasses)[number],
    ) ||
    new TextEncoder().encode(note.trim()).byteLength > 2000 ||
    revision > 50
  )
    throw new Error("invalid_factory_review");
  return {
    label,
    note: text(note.trim()),
    expected_revision: factoryRevision(revision),
  };
}
export function parseFactoryReview(raw: unknown): FactoryLabelReview {
  if (!raw || typeof raw !== "object" || Array.isArray(raw))
    throw new Error("invalid_factory_review");
  const value = raw as Record<string, unknown>;
  if (
    value.motor_authority !== false ||
    value.training_eligible !== false ||
    value.training_scope !== "separate_dataset_approval_required" ||
    value.status !== "human_reviewed"
  )
    throw new Error("invalid_factory_review_authority");
  const reviewer = value.reviewer;
  if (!reviewer || typeof reviewer !== "object" || Array.isArray(reviewer))
    throw new Error("invalid_factory_reviewer");
  const person = reviewer as Record<string, unknown>;
  const label = text(value.label, 96);
  if (
    !factoryLabelClasses.includes(label as (typeof factoryLabelClasses)[number])
  )
    throw new Error("invalid_factory_review_label");
  if (
    !["simulated", "recorded", "physical"].includes(
      text(value.data_origin, 32),
    ) ||
    typeof value.origin_verified !== "boolean"
  )
    throw new Error("invalid_factory_review_origin");
  return {
    id: text(value.id, 128),
    label,
    note: text(value.note),
    reviewed_at: text(value.reviewed_at, 128),
    source_group: text(value.source_group, 256),
    data_origin: text(value.data_origin, 32),
    origin_verified: value.origin_verified,
    previous_label:
      value.previous_label == null ? null : text(value.previous_label, 96),
    revision: factoryRevision(value.revision),
    reviewer: { id: text(person.id, 128), role: text(person.role, 128) },
  };
}
