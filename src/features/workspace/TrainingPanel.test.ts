import assert from "node:assert/strict";
import { test } from "node:test";
import { allowedRoute } from "@/lib/api/server";
import type { Run } from "@/lib/models/domain";
import { trainingJob, trainingSource } from "./TrainingPanel";

test("training lifecycle rejects executable routes and invalid authority claims", () => {
  assert.equal(allowedRoute("learning/training", "POST"), true);
  assert.equal(allowedRoute("learning/training/job-1", "DELETE"), true);
  assert.equal(allowedRoute("learning/training/job-1", "POST"), false);
  assert.equal(allowedRoute("learning/training/../../shell", "DELETE"), false);
  const record = {
    id: "job-1",
    status: "queued",
    data_origin: "synthetic",
    motor_authority: false,
    verified_physical_outcome: false,
  };
  assert.equal(trainingJob(record)?.status, "queued");
  assert.equal(trainingJob({ ...record, motor_authority: true }), null);
  assert.equal(
    trainingJob({ ...record, verified_physical_outcome: true }),
    null,
  );
  assert.equal(
    trainingJob({ ...record, verified_physical_outcome: undefined }),
    null,
  );
  const output = {
    motor_authority: false,
    verified_physical_outcome: false,
    data_origin: "synthetic",
  };
  assert.equal(trainingJob({ ...record, output })?.status, "queued");
  assert.equal(
    trainingJob({ ...record, output: { ...output, motor_authority: true } }),
    null,
  );
  assert.equal(
    trainingJob({
      ...record,
      output: { ...output, verified_physical_outcome: true },
    }),
    null,
  );
  assert.equal(
    trainingJob({ ...record, output: { ...output, data_origin: "physical" } }),
    null,
  );
  assert.equal(trainingJob({ ...record, output: {} }), null);
  assert.equal(trainingJob({ ...record, output: [] }), null);
  assert.equal(trainingJob({ ...record, status: "deployed" }), null);
  assert.equal(trainingJob({ ...record, id: "../secrets" }), null);
});

test("native transition training preserves simulated provenance without weakening physical guards", () => {
  const sourceId =
    "c6f54dfa41e1ab4f796e44f8819d9bfb681f6bcb36838ff737ff1f1dec46a7fc";
  const rolloutId = "81292f07-1111-4222-a333-123456789abc";
  const request = {
    algorithm: "franka-transition-head",
    dataset: "isaac-franka-rollout-v1",
    source_run_id: sourceId,
  };
  const output = {
    data_origin: "simulated",
    prediction_only: true,
    motor_authority: false,
    verified_physical_outcome: false,
  };
  const job = {
    id: "training-1",
    status: "running",
    data_origin: "simulated",
    motor_authority: false,
    verified_physical_outcome: false,
    request,
    output,
  };
  assert.equal(trainingJob(job)?.data_origin, "simulated");
  for (const source_run_id of [
    rolloutId,
    sourceId.slice(1),
    `${sourceId}0`,
    `g${sourceId.slice(1)}`,
  ])
    assert.equal(
      trainingJob({ ...job, request: { ...request, source_run_id } }),
      null,
    );
  assert.equal(trainingJob({ ...job, data_origin: "synthetic" }), null);
  assert.equal(
    trainingJob({ ...job, request: { ...request, source_run_id: "../other" } }),
    null,
  );
  assert.equal(
    trainingJob({
      ...job,
      request: { ...request, algorithm: "smolvla-adapter" },
    }),
    null,
  );
  assert.equal(
    trainingJob({ ...job, output: { ...output, prediction_only: false } }),
    null,
  );
  assert.equal(
    trainingJob({ ...job, output: { ...output, motor_authority: true } }),
    null,
  );
  const run = {
    source: "isaac-sim",
    data_origin: "simulated",
    physical_execution: false,
    evidence: {
      native_scene_passed: true,
      rollout: { source: "isaac-sim", id: rolloutId, sha256: "a".repeat(64) },
    },
  } as unknown as Run;
  assert.equal(trainingSource(run), true);
  assert.equal(trainingSource({ ...run, physical_execution: true }), false);
  assert.equal(trainingSource({ ...run, source: "cpu-simulation" }), false);
  assert.equal(
    trainingSource({
      ...run,
      evidence: { ...run.evidence, rollout: { id: rolloutId } },
    }),
    false,
  );
  assert.equal(
    trainingSource({
      ...run,
      evidence: {
        ...run.evidence,
        rollout: { source: "isaac-sim", id: sourceId, sha256: "a".repeat(64) },
      },
    }),
    false,
  );
});
