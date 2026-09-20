import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";

test("full local preview import requires matching receipt hash and dimensions", async () => {
  const source = process.cwd();
  const metadata = JSON.parse(
    await readFile("public/native/preview.json", "utf8"),
  );
  const png = path.join(source, "public", metadata.url);
  const temp = await mkdtemp(path.join(os.tmpdir(), "kivof-preview-import-"));
  try {
    await mkdir(path.join(temp, "src/lib/models"), { recursive: true });
    const receipt = {
      source: "isaac-sim",
      data_origin: "simulated",
      physical_execution: false,
      evidence: {
        native_scene_passed: true,
        frames: [],
        native_preview: {
          source: "isaac-sim",
          media_type: "image/png",
          simulation_time_s: 1,
          path: "never-follow-this-receipt-path",
          sha256: metadata.sha256,
          width: metadata.width,
          height: metadata.height,
        },
      },
    };
    const input = path.join(temp, "receipt.json");
    await writeFile(input, JSON.stringify(receipt));
    const invoke = () =>
      spawnSync(
        process.execPath,
        [path.join(source, "scripts/import-native-preview.mjs"), input, png],
        { cwd: temp, encoding: "utf8" },
      );
    const valid = invoke();
    assert.equal(valid.status, 0, valid.stderr);
    const imported = JSON.parse(
      await readFile(path.join(temp, "public/native/preview.json"), "utf8"),
    );
    assert.equal(imported.sha256, metadata.sha256);
    assert.equal(imported.width, metadata.width);
    receipt.evidence.native_preview.sha256 = "0".repeat(64);
    await writeFile(input, JSON.stringify(receipt));
    assert.notEqual(invoke().status, 0);
    receipt.evidence.native_preview.sha256 = metadata.sha256;
    receipt.evidence.native_preview.width += 1;
    await writeFile(input, JSON.stringify(receipt));
    assert.notEqual(invoke().status, 0);
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
});
