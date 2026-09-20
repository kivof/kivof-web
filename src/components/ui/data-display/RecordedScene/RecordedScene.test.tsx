import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import type { Run } from "@/lib/models/domain";
import { nativePreview } from "@/lib/models/nativePreview";
import { RecordedScene } from "./RecordedScene";

test("bundled native preview preserves the recorded PNG checksum and provenance", () => {
  assert.match(nativePreview.url, /^\/native\/factory-[a-f0-9]{16}\.png$/);
  const png = readFileSync(`public${nativePreview.url}`);
  assert.equal(
    createHash("sha256").update(png).digest("hex"),
    nativePreview.sha256,
  );
  assert.equal(png.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
  assert.equal(png.readUInt32BE(16), nativePreview.width);
  assert.equal(png.readUInt32BE(20), nativePreview.height);
  assert.equal(nativePreview.source, "isaac-sim");
  assert.equal(nativePreview.physicalOutcomeVerified, false);
  assert.deepEqual(
    JSON.parse(readFileSync("public/native/preview.json", "utf8")),
    nativePreview,
  );
});

test("shared preview stays distinct from a selected run and recorded frames take precedence", () => {
  const run = { source: "cpu-simulation", evidence: {} } as unknown as Run;
  const preview = renderToStaticMarkup(
    <RecordedScene title="Factory" run={run} />,
  );
  assert.match(preview, /data-native-source="preview"/);
  assert.match(preview, /separate from the selected run/);
  assert.match(preview, /Recorded factory preview/);
  assert.doesNotMatch(preview, /<svg/);
  const recorded = renderToStaticMarkup(
    <RecordedScene
      title="Factory"
      run={{
        ...run,
        source: "isaac-sim",
        evidence: {
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
      }}
    />,
  );
  assert.match(recorded, /data-native-source="run"/);
  assert.match(recorded, /Recorded renderer output from this run/);
  assert.doesNotMatch(recorded, /Recorded factory preview|\/native\/factory-/);
});
