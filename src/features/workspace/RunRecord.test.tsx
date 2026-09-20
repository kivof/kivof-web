import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import type { Overview, Run } from "@/lib/models/domain";
import { normalizeRun, normalizeRunResponse } from "@/lib/models/runRecord";
import { FactoryWorkbench } from "./FactoryWorkbench";
import { RunsPanel } from "./RunsPanel";

const pending = {
  id: "pending-run",
  scenario: "nominal",
  status: "running",
  started_at: "2026-09-20T12:00:00Z",
  data_origin: "simulated",
  view_mode: "live",
  operating_environment: "simulation",
};

test("pending and unavailable executor records render without claiming completed verification", () => {
  for (const input of [
    pending,
    { ...pending, status: "unknown", verification: { passed: false } },
  ]) {
    const run = normalizeRun(input);
    const overview: Overview = {
      product: "Kivof",
      mode: "simulation",
      factory: { id: "fixture", name: "Fixture", status: "simulation" },
      metrics: {
        total_runs: 1,
        successful_runs: 0,
        failed_runs: 0,
        success_rate: 0,
      },
      latest_run: run,
      capabilities: {},
    };
    const details = renderToStaticMarkup(
      <RunsPanel runs={[run]} runId={run.id} />,
    );
    const workbench = renderToStaticMarkup(
      <FactoryWorkbench overview={overview} />,
    );
    assert.match(details, /Independent verification|Checks passed/);
    assert.match(workbench, /No evidence available/);
    assert.equal(
      run.verification.passed,
      input.status === "unknown" ? false : undefined,
    );
    assert.deepEqual(run.steps, []);
    assert.deepEqual(run.evidence, {});
  }
});

test("all run API shapes normalize absent evidence and retain diagnostic source fields", () => {
  const expected = normalizeRun(pending);
  assert.deepEqual(normalizeRunResponse("runs", pending), expected);
  assert.deepEqual(normalizeRunResponse("runs", { run: pending }), {
    run: expected,
  });
  assert.deepEqual(normalizeRunResponse("runs", { items: [pending] }), {
    items: [expected],
  });
  assert.deepEqual(normalizeRunResponse("runs/pending-run", pending), expected);
  assert.deepEqual(normalizeRunResponse("overview", { latest_run: pending }), {
    latest_run: expected,
  });
  assert.equal(
    (expected as Run & typeof pending).operating_environment,
    "simulation",
  );
  const unrelated = { items: [{ arbitrary: true }] };
  assert.equal(normalizeRunResponse("chat", unrelated), unrelated);
});

test("malformed run collections and unsafe identifiers fail at the data boundary", () => {
  assert.throws(() => normalizeRunResponse("runs", { items: null }));
  for (const input of [
    { ...pending, steps: [{}, null] },
    { ...pending, observations: "bad" },
    { ...pending, evidence: [] },
    { ...pending, metrics: 3 },
    { ...pending, verification: "passed" },
    { ...pending, id: "../chat" },
    { ...pending, started_at: "invalid" },
  ])
    assert.throws(() => normalizeRun(input), /invalid_run_record/);
});
