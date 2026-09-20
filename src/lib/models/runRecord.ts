import type { Run } from "./domain";

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("invalid_run_record");
  return value as Record<string, unknown>;
}

function text(value: unknown, optional = false): string {
  if (value == null && optional) return "unknown";
  if (typeof value !== "string" || !value.trim() || value.length > 128)
    throw new Error("invalid_run_record");
  return value;
}

function records(value: unknown): Record<string, unknown>[] {
  if (value == null) return [];
  if (!Array.isArray(value) || value.length > 10000)
    throw new Error("invalid_run_record");
  return value.map(record);
}

export function normalizeRun(value: unknown): Run {
  const source = record(value);
  const id = text(source.id);
  const startedAt = text(source.started_at);
  if (!/^[a-zA-Z0-9_-]+$/.test(id) || !Number.isFinite(Date.parse(startedAt)))
    throw new Error("invalid_run_record");
  return {
    ...source,
    id,
    started_at: startedAt,
    scenario: text(source.scenario),
    status: text(source.status),
    source: text(source.source, true),
    data_origin: text(source.data_origin, true),
    view_mode: text(source.view_mode, true),
    steps: records(source.steps),
    observations: records(source.observations),
    metrics: source.metrics == null ? {} : record(source.metrics),
    evidence: source.evidence == null ? {} : record(source.evidence),
    verification:
      source.verification == null ? {} : record(source.verification),
  };
}

export function normalizeRunResponse(path: string, value: unknown): unknown {
  if (path === "overview") {
    const overview = record(value);
    return {
      ...overview,
      latest_run:
        overview.latest_run == null ? null : normalizeRun(overview.latest_run),
    };
  }
  if (path === "runs") {
    const response = record(value);
    if ("items" in response) {
      if (!Array.isArray(response.items)) throw new Error("invalid_run_record");
      return { ...response, items: records(response.items).map(normalizeRun) };
    }
    if ("run" in response)
      return { ...response, run: normalizeRun(response.run) };
    return normalizeRun(response);
  }
  if (/^runs\/[a-zA-Z0-9_-]{1,128}$/.test(path)) return normalizeRun(value);
  return value;
}
