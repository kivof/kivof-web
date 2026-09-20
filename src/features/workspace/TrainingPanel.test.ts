import assert from "node:assert/strict";
import { test } from "node:test";
import { allowedRoute } from "@/lib/api/server";
import { trainingJob } from "./TrainingPanel";

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
