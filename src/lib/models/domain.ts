export type User = {
  id: string;
  email: string;
  name: string;
  role: string;
  tenant_id: string;
};
export type Run = {
  id: string;
  scenario: string;
  status: string;
  source: string;
  started_at: string;
  finished_at?: string;
  observations: Record<string, unknown>[];
  steps: Record<string, unknown>[];
  metrics: Record<string, unknown>;
  evidence: Record<string, unknown>;
  verification: { passed?: boolean; [key: string]: unknown };
  data_origin: string;
  view_mode: string;
  physical_execution?: boolean;
};
export type Overview = {
  product: string;
  mode: string;
  factory: { id: string; name: string; status: string };
  metrics: {
    total_runs: number;
    successful_runs: number;
    failed_runs: number;
    success_rate: number;
  };
  latest_run: Run | null;
  capabilities: Record<string, unknown>;
};
export type Sensor = {
  id: string;
  name: string;
  kind: string;
  unit: string;
  value: number | null;
  quality: string;
  source: string;
  last_seen: string | null;
  age_ms?: number | null;
};
export type Ontology = {
  nodes: { id: string; label: string; type: string }[];
  edges: { source: string; target: string; label: string }[];
};
export type Label = {
  status?: string;
  id: string;
  run_id: string;
  label: string;
  note: string;
  created_at?: string;
};
export const sections = [
  "overview",
  "runs",
  "sensors",
  "ontology",
  "labels",
  "simulation",
  "learning",
  "chat",
] as const;
export type Section = (typeof sections)[number];
export function printable(value: unknown) {
  return value == null
    ? "—"
    : typeof value === "object"
      ? JSON.stringify(value)
      : String(value);
}
