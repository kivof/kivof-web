export const factoryScenarios = [
  "nominal",
  "occlusion",
  "force_spike",
  "stale_sensor",
  "foreign_object",
  "empty_belt",
  "sensor_conflict",
  "misroute",
] as const;
export type FactoryScenario = (typeof factoryScenarios)[number];
export type FactoryRecord = {
  id: string;
  created_at: string;
  scenario?: string;
  source: string;
  data_origin: string;
  status: string;
  origin_verified: boolean;
  decision: {
    action: string;
    class: string;
    bin: string | null;
    confidence: number;
  };
  quality: {
    passed: boolean;
    issues: string[];
    age_ms: number;
    max_skew_ms: number;
  };
  verification: {
    passed: boolean;
    expected_bin: string | null;
    observed_bin: string | null;
    error_code: string | null;
  };
  sensors: {
    id: string;
    kind: string;
    value: number;
    unit: string;
    timestamp_ms: number;
  }[];
  nodes: { id: string; type: string }[];
  edges: { from: string; to: string; relation: string }[];
  labels: { label: string; status: string; training_eligible: boolean }[];
  raw: Record<string, unknown>;
};
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("invalid_factory_record");
  return value as Record<string, unknown>;
}
function text(value: unknown, max = 256) {
  if (typeof value !== "string" || !value.trim() || value.length > max)
    throw new Error("invalid_factory_record");
  return value;
}
function number(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value))
    throw new Error("invalid_factory_record");
  return value;
}
function boolean(value: unknown) {
  if (typeof value !== "boolean") throw new Error("invalid_factory_record");
  return value;
}
function array(value: unknown, max: number) {
  if (!Array.isArray(value) || value.length > max)
    throw new Error("invalid_factory_record");
  return value as unknown[];
}
function nullable(value: unknown) {
  return value == null ? null : text(value);
}
export function parseFactoryRecord(raw: unknown): FactoryRecord {
  const value = object(raw),
    decision = object(value.decision),
    quality = object(value.quality),
    verification = object(value.verification),
    ontology = object(value.ontology);
  if (
    value.task !== "cheese_factory" ||
    value.physical_execution !== false ||
    decision.motor_authority !== false ||
    decision.placement_authorized !== false
  )
    throw new Error("invalid_factory_authority");
  const confidence = number(decision.confidence);
  if (
    confidence < 0 ||
    confidence > 1 ||
    !["sort_candidate", "review", "hold", "reject", "skip"].includes(
      text(decision.action),
    )
  )
    throw new Error("invalid_factory_decision");
  if (!["simulated", "recorded", "physical"].includes(text(value.data_origin)))
    throw new Error("invalid_factory_origin");
  const observations =
    value.observations == null ? null : object(value.observations);
  const nodes = array(ontology.nodes, 64).map((n) => {
    const node = object(n);
    return { id: text(node.id), type: text(node.type) };
  });
  const ids = new Set(nodes.map((n) => n.id));
  if (ids.size !== nodes.length) throw new Error("invalid_factory_graph");
  const edges = array(ontology.edges, 128).map((e) => {
    const edge = object(e);
    const from = text(edge.from),
      to = text(edge.to);
    if (!ids.has(from) || !ids.has(to))
      throw new Error("invalid_factory_graph");
    return { from, to, relation: text(edge.relation) };
  });
  return {
    id: text(value.id, 128),
    created_at: text(value.created_at),
    source: text(value.source),
    data_origin: text(value.data_origin),
    status: text(value.status),
    scenario: value.scenario == null ? undefined : text(value.scenario),
    origin_verified: value.origin_verified === true,
    decision: {
      action: text(decision.action),
      class: text(decision.class),
      bin: nullable(decision.bin),
      confidence,
    },
    quality: {
      passed: boolean(quality.passed),
      issues: array(quality.issues, 32).map((v) => text(v)),
      age_ms: number(quality.age_ms),
      max_skew_ms: number(quality.max_skew_ms),
    },
    verification: {
      passed: boolean(verification.passed),
      expected_bin: nullable(verification.expected_bin),
      observed_bin: nullable(verification.observed_bin),
      error_code: nullable(verification.error_code),
    },
    sensors: observations
      ? array(observations.sensors, 32).map((s) => {
          const v = object(s);
          return {
            id: text(v.id),
            kind: text(v.kind),
            value: number(v.value),
            unit: text(v.unit),
            timestamp_ms: number(v.timestamp_ms),
          };
        })
      : [],
    nodes,
    edges,
    labels: array(value.labels, 64).map((l) => {
      const v = object(l);
      return {
        label: text(v.label),
        status: text(v.status),
        training_eligible: boolean(v.training_eligible),
      };
    }),
    raw: value,
  };
}
export function parseFactoryList(raw: unknown) {
  const value = object(raw);
  if (value.task !== "cheese_factory" || value.physical_execution !== false)
    throw new Error("invalid_factory_list");
  const scenarios = array(value.scenarios, 16).map((s) => text(s));
  if (
    !scenarios.length ||
    scenarios.some((s) => !factoryScenarios.includes(s as FactoryScenario))
  )
    throw new Error("invalid_factory_scenario");
  return { items: array(value.items, 50).map(parseFactoryRecord), scenarios };
}
export function parseObservationInput(value: string) {
  if (value.length > 500_000) throw new Error("observation_too_large");
  const result = object(JSON.parse(value));
  const fields = [
    "batch_id",
    "item_id",
    "data_origin",
    "calibration_version",
    "camera",
    "sensors",
  ];
  if (
    Object.keys(result).some((k) => !fields.includes(k)) ||
    fields.some((k) => !(k in result))
  )
    throw new Error("invalid_factory_observation");
  if (!["simulated", "recorded", "physical"].includes(text(result.data_origin)))
    throw new Error("invalid_factory_origin");
  for (const key of ["batch_id", "item_id", "calibration_version"])
    text(result[key], 96);
  const camera = object(result.camera);
  if (!Number.isFinite(Date.parse(text(camera.observed_at))))
    throw new Error("invalid_factory_timestamp");
  const probabilities = Object.values(object(camera.probabilities)).map(number);
  if (
    !probabilities.length ||
    probabilities.length > 13 ||
    probabilities.some((p) => p < 0 || p > 1) ||
    Math.abs(probabilities.reduce((a, b) => a + b, 0) - 1) > 0.00001
  )
    throw new Error("invalid_factory_probabilities");
  const sensors = array(result.sensors, 32);
  if (sensors.length < 4) throw new Error("invalid_factory_observation");
  return result;
}
