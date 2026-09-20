import type { Locale } from "@/lib/i18n";

export function translated(value: unknown, copy: Record<string, string>) {
  if (value == null) return "—";
  const key = String(value);
  return typeof copy[key] === "string" ? copy[key] : key;
}

export function recordNumber(value: unknown, locale: Locale, unit = "") {
  if (typeof value !== "number" || !Number.isFinite(value)) return "—";
  return `${new Intl.NumberFormat(locale, { maximumSignificantDigits: 5 }).format(value)}${unit ? ` ${unit}` : ""}`;
}

export function fieldValue(
  key: string,
  value: unknown,
  locale: Locale,
  copy: Record<string, string>,
): string {
  if (value == null) return "—";
  if (typeof value === "boolean") return value ? copy.yes : copy.no;
  if (key === "guide_occupancy" && Array.isArray(value)) {
    if (!value.every((entry) => typeof entry === "boolean")) return "—";
    return `${recordNumber(value.filter(Boolean).length, locale)} / ${recordNumber(value.length, locale)}`;
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return "—";
    if (key.endsWith("_ratio"))
      return new Intl.NumberFormat(locale, {
        style: "percent",
        maximumSignificantDigits: 4,
      }).format(value);
    if (key.endsWith("_ms")) return recordNumber(value, locale, "ms");
    if (key.endsWith("_s") || key.endsWith("_seconds"))
      return recordNumber(value, locale, "s");
    if (key === "position_error_m" || key === "positionTolerance")
      return recordNumber(value * 1000, locale, "mm");
    if (key === "yaw_error_rad" || key === "orientationTolerance")
      return recordNumber((value * 180) / Math.PI, locale, "°");
    if (key === "retentionRequirement") return recordNumber(value, locale, "s");
    if (key.endsWith("_m")) return recordNumber(value, locale, "m");
    return recordNumber(value, locale);
  }
  if (typeof value === "string" && key.endsWith("_at")) {
    const date = new Date(value);
    if (Number.isFinite(date.getTime())) return date.toLocaleString(locale);
  }
  return translated(value, copy);
}

export function stepLabel(
  step: Record<string, unknown>,
  copy: Record<string, string>,
  locale: Locale,
) {
  const phase = step.phase ?? step.stage ?? step.name;
  const name =
    typeof phase === "string" ? translated(phase, copy) : copy.recordedStep;
  const time = step.simulation_time_s;
  return typeof time === "number" && Number.isFinite(time)
    ? `${name} · ${recordNumber(time, locale, "s")}`
    : name;
}

export function recordObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function geometryPoints(value: unknown): number[][] {
  if (!Array.isArray(value)) return [];
  return value
    .slice(0, 4096)
    .filter(
      (point): point is number[] =>
        Array.isArray(point) &&
        point.length === 3 &&
        point.every(
          (axis) =>
            typeof axis === "number" &&
            Number.isFinite(axis) &&
            Math.abs(axis) <= 10000,
        ),
    );
}
