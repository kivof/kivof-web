import assert from "node:assert/strict";
import { test } from "node:test";
import { DEFAULT_CAMERA } from "@/lib/models/liveScene";
import { validatedLiveFrames } from "./liveStream";

const encoder = new TextEncoder();
function source(chunks: string[]) {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
      controller.close();
    },
  });
}
const starting = {
  id: "session-1",
  status: "starting",
  source: "isaac-sim",
  controller: "scripted-joint-diagnostic",
  camera: DEFAULT_CAMERA,
  physical_execution: false,
  task_qualified: false,
  robots: [],
  sequence: 0,
};

test("frame proxy incrementally validates and forwards complete owned records", async () => {
  const line = `${JSON.stringify(starting)}\n`;
  const response = new Response(
    source([line.slice(0, 9), line.slice(9), line]).pipeThrough(
      validatedLiveFrames("session-1"),
    ),
  );
  assert.equal(await response.text(), `${line}${line}`);
});

test("frame proxy rejects foreign sessions, physical claims and incomplete records", async () => {
  for (const value of [
    `${JSON.stringify({ ...starting, id: "another-tenant" })}\n`,
    `${JSON.stringify({ ...starting, physical_execution: true })}\n`,
    JSON.stringify(starting),
    '{"instructions":"execute motors"}\n',
  ])
    await assert.rejects(
      new Response(
        source([value]).pipeThrough(validatedLiveFrames("session-1")),
      ).text(),
    );
});

test("frame proxy bounds unterminated and complete frame bodies", async () => {
  for (const suffix of ["", "\n"])
    await assert.rejects(
      new Response(
        source([`{"extra":"${"x".repeat(2_000_001)}"}${suffix}`]).pipeThrough(
          validatedLiveFrames("session-1"),
        ),
      ).text(),
    );
});

test("downstream cancellation cancels the upstream frame reader", async () => {
  let finishCancellation: () => void = () => {};
  const cancelled = new Promise<void>((resolve) => {
    finishCancellation = resolve;
  });
  const upstream = new ReadableStream<Uint8Array>({
    cancel() {
      finishCancellation();
    },
  });
  const reader = upstream
    .pipeThrough(validatedLiveFrames("session-1"))
    .getReader();
  await reader.cancel();
  await cancelled;
});
