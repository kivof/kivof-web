import assert from "node:assert/strict";
import { test } from "node:test";
import type { Run } from "./domain";
import {
  isaacFrames,
  nativeSceneTaskUnqualified,
  robotState,
  robotStates,
} from "./robotScene";

test("native scene rejects untrusted media and requires actual Isaac provenance", () => {
  const frame = {
    source: "isaac-sim",
    media_type: "image/png",
    simulation_time_s: 1,
    sha256: "a".repeat(64),
    data_url: "data:image/png;base64,iVBORw0KGgoAAA==",
  };
  const run = {
    source: "isaac-sim",
    evidence: { frames: [frame] },
  } as unknown as Run;
  assert.equal(isaacFrames(run).length, 1);
  assert.equal(isaacFrames({ ...run, source: "cpu-simulation" }).length, 0);
  for (const data_url of [
    "https://untrusted.invalid/frame.png",
    "data:image/svg+xml;base64,iVBORw0KGgoAAA==",
    "data:image/png;base64,<script>",
  ])
    assert.equal(
      isaacFrames({ ...run, evidence: { frames: [{ ...frame, data_url }] } })
        .length,
      0,
    );
  assert.equal(
    isaacFrames({
      ...run,
      evidence: { frames: [{ ...frame, sha256: "unverified" }] },
    }).length,
    0,
  );
});

test("native inspector retains each recorded arm and rejects malformed or duplicate identities", () => {
  const primary = {
    model: "Franka Panda",
    joint_names: ["panda_joint1", "panda_joint2"],
  };
  const robots = Array.from({ length: 8 }, (_, i) => ({
    id: `franka-${i}`,
    model: "Franka Panda",
    joint_positions_rad: [i, 0],
    joint_velocities_rad_s: [0.000001, 0],
  }));
  const run = {
    source: "isaac-sim",
    evidence: { robot: primary, robots },
  } as unknown as Run;
  const states = robotStates(run);
  assert.equal(states.length, 8);
  assert.equal(states[7].id, "franka-7");
  assert.equal(states[7].positions[0], 7);
  assert.equal(states[7].velocities[0], 0.000001);
  assert.equal(
    robotStates({
      ...run,
      evidence: {
        robot: primary,
        robots: [
          robots[0],
          robots[0],
          { ...robots[1], joint_positions_rad: [Number.NaN, 0] },
          { ...robots[2], model: "Unmapped model" },
        ],
      },
    }).length,
    1,
  );
  assert.equal(robotStates({ ...run, source: "cpu-simulation" }).length, 0);
});
test("robot inspector accepts only aligned finite joint samples", () => {
  const run = {
    source: "isaac-sim",
    evidence: {
      robot: {
        model: "Franka Panda",
        joint_names: ["joint1"],
        joint_positions_rad: [1],
        joint_velocities_rad_s: [0],
      },
    },
  } as unknown as Run;
  assert.deepEqual(robotState(run)?.positions, [1]);
  assert.equal(
    robotState({
      ...run,
      evidence: {
        robot: {
          model: "Franka",
          joint_names: ["joint1"],
          joint_positions_rad: [Number.NaN],
        },
      },
    }),
    null,
  );
});

test("scene readiness never upgrades an unqualified autonomous task or masks another fault", () => {
  const run = {
    source: "isaac-sim",
    status: "failed",
    evidence: {
      native_scene_passed: true,
      frames: [
        {
          source: "isaac-sim",
          media_type: "image/png",
          simulation_time_s: 1,
          sha256: "a".repeat(64),
          data_url: "data:image/png;base64,iVBORw0KGgoAAA==",
        },
      ],
    },
    verification: {
      passed: false,
      independent: true,
      error_code: "AUTONOMOUS_TASK_NOT_QUALIFIED",
    },
  } as unknown as Run;
  assert.equal(nativeSceneTaskUnqualified(run), true);
  assert.equal(
    nativeSceneTaskUnqualified({ ...run, source: "cpu-simulation" }),
    false,
  );
  assert.equal(
    nativeSceneTaskUnqualified({
      ...run,
      evidence: { ...run.evidence, frames: [] },
    }),
    false,
  );
  assert.equal(
    nativeSceneTaskUnqualified({
      ...run,
      verification: { ...run.verification, passed: true },
    }),
    false,
  );
  assert.equal(
    nativeSceneTaskUnqualified({
      ...run,
      verification: { ...run.verification, error_code: "FORCE_LIMIT" },
    }),
    false,
  );
});
