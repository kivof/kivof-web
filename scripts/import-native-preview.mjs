import { createHash } from "node:crypto";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const input = process.argv[2];
const fullPreviewPath = process.argv[3];
if (!input)
  throw new Error("Pass a verified local native-scene result JSON file");
const raw = await readFile(input);
const body = JSON.parse(raw.toString("utf8"));
const run = body.run ?? body.result ?? body;
if (
  run.source !== "isaac-sim" ||
  run.data_origin !== "simulated" ||
  run.physical_execution !== false ||
  run.evidence?.native_scene_passed !== true ||
  !Array.isArray(run.evidence.frames)
)
  throw new Error(
    "A verified native scene with no physical execution is required",
  );

const candidates = [];
for (const frame of run.evidence.frames) {
  if (
    frame.source !== "isaac-sim" ||
    frame.media_type !== "image/png" ||
    !Number.isFinite(frame.simulation_time_s) ||
    frame.simulation_time_s < 0 ||
    typeof frame.data_url !== "string" ||
    frame.data_url.length > 2_000_000 ||
    !/^data:image\/png;base64,iVBORw0KGgo[A-Za-z0-9+/]*={0,2}$/.test(
      frame.data_url,
    )
  )
    continue;
  const bytes = Buffer.from(frame.data_url.split(",")[1], "base64");
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  if (sha256 !== frame.sha256 || bytes.length < 33) continue;
  if (
    !bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  )
    continue;
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  if (width < 1 || height < 1 || width > 4096 || height > 4096) continue;
  candidates.push({ frame, bytes, sha256, width, height });
}
if (fullPreviewPath) {
  const frame = run.evidence.native_preview;
  if (
    frame?.source !== "isaac-sim" ||
    frame.media_type !== "image/png" ||
    typeof frame.sha256 !== "string" ||
    !/^[a-f0-9]{64}$/.test(frame.sha256) ||
    !Number.isFinite(frame.simulation_time_s) ||
    frame.simulation_time_s < 0
  )
    throw new Error(
      "A native preview receipt is required for the explicit local PNG",
    );
  const info = await stat(fullPreviewPath);
  if (!info.isFile() || info.size < 33 || info.size > 8 * 1024 * 1024)
    throw new Error("Local native PNG exceeds the import bound");
  const bytes = await readFile(fullPreviewPath);
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  if (
    sha256 !== frame.sha256 ||
    !bytes
      .subarray(0, 8)
      .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ||
    width !== frame.width ||
    height !== frame.height ||
    width < 1 ||
    height < 1 ||
    width > 4096 ||
    height > 4096
  )
    throw new Error(
      "Local native PNG does not match its recorded checksum and dimensions",
    );
  candidates.push({ frame, bytes, sha256, width, height });
}
candidates.sort(
  (a, b) =>
    b.width * b.height - a.width * a.height ||
    b.frame.simulation_time_s - a.frame.simulation_time_s,
);
const chosen = candidates[0];
if (!chosen)
  throw new Error("No bounded PNG with a matching checksum was found");
const asset = `factory-${chosen.sha256.slice(0, 16)}.png`;
const metadata = {
  source: "isaac-sim",
  dataOrigin: "simulated",
  preview: true,
  physicalOutcomeVerified: false,
  url: `/native/${asset}`,
  sha256: chosen.sha256,
  sourceReceiptSha256: createHash("sha256").update(raw).digest("hex"),
  width: chosen.width,
  height: chosen.height,
  simulationTime: chosen.frame.simulation_time_s,
  recordedAt:
    typeof run.finished_at === "string" ? run.finished_at : run.started_at,
};
await mkdir("public/native", { recursive: true });
await writeFile(path.join("public/native", asset), chosen.bytes);
await writeFile(
  "public/native/preview.json",
  `${JSON.stringify(metadata, null, 2)}\n`,
);
await writeFile(
  "src/lib/models/nativePreview.ts",
  `// Generated from a verified recorded scene by scripts/import-native-preview.mjs.\nexport const nativePreview = ${JSON.stringify(metadata, null, 2)} as const;\n`,
);
console.log(
  JSON.stringify({
    asset,
    width: chosen.width,
    height: chosen.height,
    sha256: chosen.sha256,
    bytes: chosen.bytes.length,
  }),
);
