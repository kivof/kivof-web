import assert from "node:assert/strict";
import { test } from "node:test";
import { factoryCopy } from "@/features/factory/copy";
import {
  parseFactoryList,
  parseFactoryRecord,
  parseObservationInput,
} from "./factory";

function record() {
  return {
    id: "factory-1",
    created_at: "2026-09-24T00:00:00Z",
    task: "cheese_factory",
    physical_execution: false,
    source: "cpu-cheese-factory-simulation",
    data_origin: "simulated",
    origin_verified: true,
    status: "succeeded",
    scenario: "nominal",
    decision: {
      action: "sort_candidate",
      class: "hard_cheese",
      bin: "bin_hard",
      confidence: 1,
      motor_authority: false,
      placement_authorized: false,
    },
    quality: { passed: true, issues: [], age_ms: 10, max_skew_ms: 0 },
    verification: {
      passed: true,
      expected_bin: "bin_hard",
      observed_bin: "bin_hard",
      error_code: null,
    },
    ontology: {
      nodes: [
        { id: "item", type: "ConveyorItem" },
        { id: "batch", type: "ProductionBatch" },
      ],
      edges: [{ from: "item", to: "batch", relation: "member_of" }],
    },
    labels: [
      { label: "hard_cheese", status: "unreviewed", training_eligible: false },
    ],
    observations: {
      sensors: [
        {
          id: "mass",
          kind: "object_mass",
          value: 0.2,
          unit: "kg",
          timestamp_ms: 1,
        },
      ],
    },
  };
}
test("factory keeps origin, actual sensor values and independent wrong-bin results", () => {
  const input = record();
  input.status = "failed";
  input.verification = {
    passed: false,
    expected_bin: "bin_hard",
    observed_bin: "bin_soft",
    error_code: null,
  };
  const parsed = parseFactoryRecord(input);
  assert.equal(parsed.verification.passed, false);
  assert.equal(parsed.verification.observed_bin, "bin_soft");
  assert.equal(parsed.sensors[0].value, 0.2);
  assert.equal(parsed.labels[0].training_eligible, false);
  assert.equal(parsed.origin_verified, true);
});
test("factory rejects motor authority and unresolved graph evidence", () => {
  const input = record();
  input.decision.motor_authority = true;
  assert.throws(() => parseFactoryRecord(input), /authority/);
  const graph = record();
  graph.ontology.edges[0].to = "missing";
  assert.throws(() => parseFactoryRecord(graph), /graph/);
  const confidence = record();
  confidence.decision.confidence = NaN;
  assert.throws(() => parseFactoryRecord(confidence));
});
test("factory lists reject unknown scenarios and malformed response identities", () => {
  const list = {
    items: [record()],
    task: "cheese_factory",
    physical_execution: false,
    scenarios: ["nominal", "misroute"],
  };
  assert.equal(parseFactoryList(list).items.length, 1);
  assert.throws(() =>
    parseFactoryList({ ...list, scenarios: ["execute_shell"] }),
  );
  assert.throws(() => parseFactoryList({ ...list, task: "cable" }));
});
test("observation import rejects policy injection and invalid probabilities", () => {
  const input = {
    batch_id: "b",
    item_id: "i",
    data_origin: "recorded",
    calibration_version: "unverified",
    camera: {
      observed_at: "2026-09-24T00:00:00Z",
      probabilities: { hard_cheese: 1 },
    },
    sensors: [{}, {}, {}, {}],
  };
  assert.equal(
    parseObservationInput(JSON.stringify(input)).data_origin,
    "recorded",
  );
  assert.throws(() =>
    parseObservationInput(JSON.stringify({ ...input, motor_authority: true })),
  );
  input.camera.probabilities.hard_cheese = 0.1;
  assert.throws(
    () => parseObservationInput(JSON.stringify(input)),
    /probabilities/,
  );
});
test("all factory controls have complete four-language copy", () => {
  const keys = Object.keys(factoryCopy.en);
  for (const dictionary of Object.values(factoryCopy)) {
    assert.deepEqual(Object.keys(dictionary), keys);
    for (const text of Object.values(dictionary)) assert.ok(text?.trim());
  }
});
