import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";
import { parseFactoryRecord } from "./factory";
import {
  factorySimulationInput,
  parseFactoryNative,
  verifyFactoryFrame,
} from "./factoryNative";

const png =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4//8/AAX+Av4N70a4AAAAAElFTkSuQmCC";
function native() {
  return {
    id: "record-native",
    created_at: "2026-09-24T00:00:00Z",
    task: "cheese_factory",
    source: "isaac-sim",
    data_origin: "simulated",
    physical_execution: false,
    origin_verified: true,
    status: "succeeded",
    decision: {
      action: "sort_candidate",
      class: "hard_cheese",
      bin: "bin_hard",
      confidence: 1,
      motor_authority: false,
      placement_authorized: false,
    },
    quality: { passed: true, issues: [] },
    verification: {
      passed: true,
      expected_bin: "bin_hard",
      distance_to_bin_m: 0.02,
      linear_speed_m_s: 0.01,
      released: true,
      lift_observed: true,
    },
    labels: [
      { label: "hard_cheese", status: "unreviewed", training_eligible: false },
    ],
    ontology: { nodes: [{ id: "item", type: "ConveyorItem" }], edges: [] },
    observations: [
      {
        data_origin: "simulated",
        simulation_time_s: 9,
        joint_positions_rad: [0, 1, 2, 3, 4, 5, 6],
        joint_velocities_rad_s: [0, 0, 0, 0, 0, 0, 0],
        item_position_m: [0.45, -0.2, 0.04],
      },
    ],
    evidence: {
      simulation: {
        physics: true,
        isaac_sim: true,
        trained_model: false,
        task_qualified: false,
      },
      frames: [
        {
          media_type: "image/png",
          base64: png,
          sha256: createHash("sha256")
            .update(Buffer.from(png, "base64"))
            .digest("hex"),
          width: 1,
          height: 1,
          simulation_time_s: 1.4,
          source: "isaac-sim",
        },
      ],
    },
  };
}
test("native record preserves measured samples and leaves missing sensor freshness unknown", () => {
  const result = parseFactoryRecord(native());
  assert.ok(result.native);
  assert.equal(result.quality.age_ms, null);
  assert.equal(result.quality.max_skew_ms, null);
  assert.equal(result.sensors.length, 0);
  assert.equal(result.native.samples[0].positions[3], 3);
  assert.equal(result.native.distance, 0.02);
  assert.equal(result.verification.observed_bin, null);
});
test("only native simulated evidence with bounded PNGs can be rendered", () => {
  const record = native();
  record.physical_execution = true;
  assert.throws(() => parseFactoryNative(record));
  const bad = native();
  bad.evidence.frames[0].base64 = "https://evil.invalid/image.png";
  assert.throws(() => parseFactoryNative(bad));
  const dims = native();
  dims.evidence.frames[0].width = 2;
  assert.throws(() => parseFactoryNative(dims), /dimensions/);
  const oversized = native();
  oversized.evidence.frames[0].base64 = "a".repeat(500001);
  assert.throws(() => parseFactoryNative(oversized));
  const authority = native();
  authority.evidence.simulation.trained_model = true;
  assert.throws(() => parseFactoryNative(authority));
});
test("image is accepted only when its bytes match the recorded SHA-256", async () => {
  const frame = parseFactoryNative(native())?.frames[0];
  assert.ok(frame);
  assert.equal(await verifyFactoryFrame(frame), true);
  assert.equal(
    await verifyFactoryFrame({ ...frame, sha256: "0".repeat(64) }),
    false,
  );
});
test("simulation selection sends explicit bounded engine and scenario", () => {
  assert.deepEqual(factorySimulationInput("nominal", "cpu"), {
    scenario: "nominal",
    engine: "cpu",
  });
  assert.deepEqual(factorySimulationInput("misroute", "isaac"), {
    scenario: "misroute",
    engine: "isaac",
  });
  assert.throws(() => factorySimulationInput("nominal", "shell"));
  assert.throws(() => factorySimulationInput("arbitrary", "isaac"));
});
