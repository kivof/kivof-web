import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { dictionaries, type Locale } from "@/lib/i18n";
import type { Overview, Run } from "@/lib/models/domain";
import { FactoryWorkbench } from "./FactoryWorkbench";
import { RunsPanel } from "./RunsPanel";
import { fieldValue, geometryPoints, stepLabel } from "./recordPresentation";
import { SensorPanel } from "./SensorPanel";
import { SimulationPanel } from "./SimulationPanel";

const run: Run = {
  id: "verified-fixture",
  scenario: "nominal",
  status: "succeeded",
  source: "cpu-simulation",
  started_at: "2026-09-20T03:00:00Z",
  data_origin: "simulated",
  view_mode: "replay",
  observations: [],
  steps: [
    {
      phase: "grasp",
      simulation_time_s: 1.5,
      guide_occupancy: [false, false, false],
      status: "controller_completed",
    },
  ],
  metrics: { simulation_duration_s: 11, peak_link_stretch_error_ratio: 0.04 },
  verification: {
    passed: true,
    independent: true,
    guide_occupancy: [true, true, true],
    position_error_m: 0.0002,
    released: true,
    retained_seconds: 2,
    thresholds: { position_m: 0.002, retention_s: 2 },
  },
  evidence: {
    cable_points_m: [
      [0, 0, 0],
      [0.3, 0, 0.02],
    ],
    guide_positions_m: [[0.15, 0, 0.015]],
    socket_position_m: [0.3, 0, 0.02],
  },
};

test("replay keeps the final independent result separate from the selected intermediate step", () => {
  const overview: Overview = {
    product: "Kivof",
    mode: "simulation",
    factory: { id: "fixture", name: "Fixture", status: "simulation" },
    metrics: {
      total_runs: 1,
      successful_runs: 1,
      failed_runs: 0,
      success_rate: 1,
    },
    latest_run: run,
    capabilities: {},
  };
  const html = renderToStaticMarkup(<FactoryWorkbench overview={overview} />);
  const verifier = html
    .split('aria-label="Independent verification"')[1]
    ?.split("</section>")[0];
  const step = html
    .split('aria-label="Recorded step"')[1]
    ?.split("</section>")[0];
  assert.ok(verifier);
  assert.ok(step);
  assert.match(verifier, /3 \/ 3/);
  assert.doesNotMatch(verifier, /Grasp|0 \/ 3|Controller step finished/);
  assert.match(step, /0 \/ 3/);
  assert.match(step, /Grasp/);
  assert.match(html, /Grasp · 1.5 s/);
});

test("run detail presents units and recorded geometry without dumping cable arrays", () => {
  const html = renderToStaticMarkup(<RunsPanel runs={[run]} runId={run.id} />);
  assert.match(html, /Position error/);
  assert.match(html, /0.2 mm/);
  assert.match(html, /11 s/);
  assert.match(html, /4%/);
  assert.match(html, /X\/Z projection of recorded simulation coordinates/);
  assert.match(html, /Full source record/);
  assert.doesNotMatch(html, /cable_points_m|\[\[0,0,0\]/);
});

test("all locales translate replay phases and preserve small measurements", () => {
  for (const locale of ["en", "es", "de", "fr"] as Locale[]) {
    const copy = dictionaries[locale];
    assert.ok(stepLabel(run.steps[0], copy, locale).startsWith(copy.grasp));
    assert.equal(fieldValue("passed", false, locale, copy), copy.no);
    assert.match(
      fieldValue("position_error_m", 0.0002, locale, copy),
      /0[.,]2 mm/,
    );
    assert.notEqual(
      fieldValue("peak_link_stretch_error_ratio", 1e-9, locale, copy),
      "0%",
    );
  }
  assert.equal(
    fieldValue("position_error_m", Number.NaN, "en", dictionaries.en),
    "—",
  );
  assert.deepEqual(
    geometryPoints([[0, 1, 2], [0, Number.NaN, 2], [0, 1], "<script>"]),
    [[0, 1, 2]],
  );
});

test("simulation exposes stale observations and distinguishes configured from verified Isaac", () => {
  const html = renderToStaticMarkup(
    <SimulationPanel
      capabilities={{
        cpu_simulation: true,
        isaac_sim: { configured: true, verified: false },
        physical_execution: false,
      }}
      refresh={async () => {}}
    />,
  );
  assert.match(html, /value="stale_sensor"/);
  assert.match(html, /Configured · not verified/);
  assert.match(html, /Physical execution/);
  assert.match(html, /Disabled/);
  assert.doesNotMatch(html, /&quot;configured&quot;/);
});

test("sensor density uses recorded values and ages without inventing additional devices", () => {
  const sensors = [0, 1, 2].map((index) => ({
    id: `sensor-${index}`,
    name: `Sensor ${index}`,
    kind: "synthetic-contact-proxy",
    unit: "N",
    value: index === 0 ? 0.8 : null,
    quality: index === 0 ? "valid" : "disconnected",
    source: "cpu-simulation",
    last_seen: null,
    age_ms: index === 0 ? 12 : null,
  }));
  const html = renderToStaticMarkup(<SensorPanel sensors={sensors} />);
  assert.equal((html.match(/<article/g) ?? []).length, 8);
  assert.match(html, /Reported sensor values/);
  assert.match(html, /Records with valid quality/);
  assert.match(html, /Derived from these records/);
  assert.match(html, /Recorded age/);
  assert.doesNotMatch(html, /Sensor 3|Live age/);
});

test("native telemetry keeps eight actual robot values without invented age panels", () => {
  const sensors = Array.from({ length: 8 }, (_, index) => ({
    id: `franka-${index}-joints`,
    name: "Worker label",
    kind: "isaac-joint-velocity",
    unit: "rad/s",
    value: 0.000001,
    quality: "valid",
    source: "isaac-sim",
    last_seen: null,
    age_ms: null,
  }));
  const html = renderToStaticMarkup(<SensorPanel sensors={sensors} />);
  assert.equal((html.match(/<article/g) ?? []).length, 8);
  assert.match(html, /Franka 8 · Joint speed/);
  assert.match(html, /Maximum recorded joint speed/);
  assert.match(html, /Observation age is unknown/);
  assert.match(html, /0.000001/);
  assert.doesNotMatch(
    html,
    /Recorded age|Derived from these records|Worker label/,
  );
});
