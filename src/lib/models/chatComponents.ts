export type Evidence = { id: string; label: string; locator: string };
export type Point = { label: string; value: number };
type Grounded = { sourceIds: string[] };
export type ChatComponent =
  | (Grounded & {
      type: "metric";
      label: string;
      value: string;
      detail?: string;
    })
  | (Grounded & {
      type: "table";
      title: string;
      columns: string[];
      rows: string[][];
    })
  | (Grounded & {
      type: "chart";
      title: string;
      unit?: string;
      points: Point[];
    })
  | (Grounded & {
      type: "evidence";
      title: string;
      items: { label: string; detail: string; source?: string }[];
    })
  | (Grounded & {
      type: "diagram";
      title: string;
      nodes: { id: string; label: string }[];
      edges: { from: string; to: string; label?: string }[];
    })
  | (Grounded & {
      type: "projection";
      title: string;
      unit?: string;
      assumptions: string[];
      points: Point[];
    });

export function object(
  value: unknown,
  fields: string[],
): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Invalid chat object");
  if (Object.keys(value).some((key) => !fields.includes(key)))
    throw new Error("Unknown chat field");
  return value as Record<string, unknown>;
}
export function text(value: unknown, max = 2000, allowEmpty = false): string {
  if (
    typeof value !== "string" ||
    (!allowEmpty && !value.trim()) ||
    value.length > max ||
    value.includes("\0")
  )
    throw new Error("Invalid chat text");
  return value;
}
export function array(value: unknown, max: number, min = 1): unknown[] {
  if (!Array.isArray(value) || value.length < min || value.length > max)
    throw new Error("Invalid chat array");
  return value;
}
function optionalText(value: unknown, max = 2000) {
  return value == null ? undefined : text(value, max, true);
}
function points(value: unknown): Point[] {
  return array(value, 32).map((item) => {
    const v = object(item, ["label", "value"]);
    if (typeof v.value !== "number" || !Number.isFinite(v.value))
      throw new Error("Invalid chart number");
    return { label: text(v.label, 160), value: v.value };
  });
}
function sources(
  value: unknown,
  evidence: Evidence[],
  conceptual = false,
): Grounded {
  const sourceIds = array(value, 80, conceptual ? 0 : 1).map((id) =>
    text(id, 16),
  );
  if (sourceIds.some((id) => !evidence.some((item) => item.id === id)))
    throw new Error("Unresolved component evidence");
  return { sourceIds };
}
export function parseEvidence(value: unknown): Evidence[] {
  const items = array(value ?? [], 80, 0).map((item) => {
    const v = object(item, ["id", "label", "locator"]);
    return {
      id: text(v.id, 120),
      label: text(v.label, 300),
      locator: text(v.locator, 2000),
    };
  });
  if (new Set(items.map((item) => item.id)).size !== items.length)
    throw new Error("Duplicate evidence identifier");
  return items;
}
export function parseComponent(
  value: unknown,
  evidence: Evidence[],
): ChatComponent {
  const v = object(value, [
    "type",
    "label",
    "value",
    "detail",
    "sourceIds",
    "title",
    "columns",
    "rows",
    "unit",
    "points",
    "items",
    "nodes",
    "edges",
    "assumptions",
  ]);
  switch (v.type) {
    case "metric":
      object(v, ["type", "label", "value", "detail", "sourceIds"]);
      return {
        type: v.type,
        label: text(v.label, 160),
        value: text(v.value, 160, true),
        detail: optionalText(v.detail, 500),
        ...sources(v.sourceIds, evidence),
      };
    case "table": {
      object(v, ["type", "title", "columns", "rows", "sourceIds"]);
      const columns = array(v.columns, 8).map((item) => text(item, 160));
      const rows = array(v.rows, 12).map((row) =>
        array(row, columns.length, columns.length).map((cell) =>
          text(cell, 500, true),
        ),
      );
      return {
        type: v.type,
        title: text(v.title, 240),
        columns,
        rows,
        ...sources(v.sourceIds, evidence),
      };
    }
    case "chart":
      object(v, ["type", "title", "unit", "points", "sourceIds"]);
      return {
        type: v.type,
        title: text(v.title, 240),
        unit: optionalText(v.unit, 80),
        points: points(v.points),
        ...sources(v.sourceIds, evidence),
      };
    case "evidence":
      object(v, ["type", "title", "items", "sourceIds"]);
      return {
        type: v.type,
        title: text(v.title, 240),
        items: array(v.items, 12).map((item) => {
          const row = object(item, ["label", "detail", "source"]);
          return {
            label: text(row.label, 240),
            detail: text(row.detail, 1200, true),
            source: optionalText(row.source),
          };
        }),
        ...sources(v.sourceIds, evidence),
      };
    case "diagram": {
      object(v, ["type", "title", "nodes", "edges", "sourceIds"]);
      const nodes = array(v.nodes, 12).map((item) => {
        const node = object(item, ["id", "label"]);
        return { id: text(node.id, 80), label: text(node.label, 160) };
      });
      if (new Set(nodes.map((node) => node.id)).size !== nodes.length)
        throw new Error("Duplicate diagram node");
      const edges = array(v.edges, 20, 0).map((item) => {
        const edge = object(item, ["from", "to", "label"]);
        const from = text(edge.from, 80);
        const to = text(edge.to, 80);
        if (![from, to].every((id) => nodes.some((node) => node.id === id)))
          throw new Error("Unknown diagram node");
        return { from, to, label: optionalText(edge.label, 160) };
      });
      return {
        type: v.type,
        title: text(v.title, 240),
        nodes,
        edges,
        ...sources(v.sourceIds, evidence, true),
      };
    }
    case "projection":
      object(v, [
        "type",
        "title",
        "unit",
        "assumptions",
        "points",
        "sourceIds",
      ]);
      return {
        type: v.type,
        title: text(v.title, 240),
        unit: optionalText(v.unit, 80),
        assumptions: array(v.assumptions, 8).map((item) => text(item)),
        points: points(v.points),
        ...sources(v.sourceIds, evidence, true),
      };
    default:
      throw new Error("Unsupported chat component");
  }
}
