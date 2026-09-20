import assert from "node:assert/strict";
import { test } from "node:test";
import { DEFAULT_CAMERA } from "@/lib/models/liveScene";
import { readLiveStream, streamLiveFeed } from "./liveStream";

const frame = (sequence: number, status = "starting") => ({
  id: "owned",
  sequence,
  status,
  camera: DEFAULT_CAMERA,
  source: "isaac-sim",
  physical_execution: false,
  task_qualified: false,
  controller: "scripted-joint-diagnostic",
});
const encoder = new TextEncoder();
const body = (chunks: Uint8Array[]) =>
  new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(chunk);
      controller.close();
    },
  });

test("NDJSON delivers separate frames across arbitrary transport chunk boundaries", async () => {
  const bytes = encoder.encode(
    `${JSON.stringify(frame(1))}\n${JSON.stringify(frame(2))}\n`,
  );
  const received: number[] = [];
  await readLiveStream(
    body([bytes.slice(0, 9), bytes.slice(9, 105), bytes.slice(105)]),
    "owned",
    new AbortController().signal,
    (scene) => received.push(scene.sequence),
  );
  assert.deepEqual(received, [1, 2]);
});

test("malformed, truncated, oversized or foreign frames fail without delivery", async () => {
  for (const bytes of [
    encoder.encode("invalid\n"),
    encoder.encode(JSON.stringify(frame(1))),
    encoder.encode(`${JSON.stringify({ ...frame(1), id: "other" })}\n`),
    encoder.encode(
      `${JSON.stringify({ ...frame(1), physical_execution: true })}\n`,
    ),
    new Uint8Array(2_000_001).fill(65),
    new Uint8Array([0xff, 10]),
  ]) {
    let received = 0;
    await assert.rejects(
      readLiveStream(
        body([bytes]),
        "owned",
        new AbortController().signal,
        () => {
          received += 1;
        },
      ),
    );
    assert.equal(received, 0);
  }
});

test("aborting a blocked read cancels transport and terminal frames close the reader", async () => {
  const controller = new AbortController();
  let cancelled = false;
  const blocked = new ReadableStream<Uint8Array>({
    cancel() {
      cancelled = true;
    },
  });
  const reading = readLiveStream(blocked, "owned", controller.signal, () =>
    assert.fail("unexpected frame"),
  );
  controller.abort();
  await reading;
  assert.equal(cancelled, true);
  cancelled = false;
  const terminal = new ReadableStream<Uint8Array>({
    start(stream) {
      stream.enqueue(
        encoder.encode(`${JSON.stringify(frame(3, "stopped"))}\n`),
      );
    },
    cancel() {
      cancelled = true;
    },
  });
  await readLiveStream(
    terminal,
    "owned",
    new AbortController().signal,
    (scene) => assert.equal(scene.status, "stopped"),
  );
  assert.equal(cancelled, true);
});

test("stream fallback is limited to explicit unavailability and preserves cookie authentication", async () => {
  const signal = new AbortController().signal;
  const unavailable = await streamLiveFeed(
    "owned",
    signal,
    () => {},
    async (url, options) => {
      assert.equal(url, "/api/simulation/live/owned/stream");
      assert.equal(options?.credentials, "same-origin");
      assert.equal(options?.cache, "no-store");
      return new Response(null, { status: 503 });
    },
  );
  assert.equal(unavailable, "unavailable");
  for (const response of [
    new Response(null, { status: 401 }),
    new Response("{}", { headers: { "Content-Type": "application/json" } }),
    new Response("broken\n", {
      headers: { "Content-Type": "application/x-ndjson" },
    }),
  ])
    await assert.rejects(
      streamLiveFeed(
        "owned",
        signal,
        () => {},
        async () => response,
      ),
    );
});
