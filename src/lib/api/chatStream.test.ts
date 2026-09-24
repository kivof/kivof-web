import assert from "node:assert/strict";
import { test } from "node:test";
import { type AssistantStage, readChatStream } from "./chatStream";

const reply = {
  id: "reply-1",
  answer: "Qualité contrôlée",
  model: "configured-model",
  evidence: [],
  components: [],
  summary: [],
};
function response(lines: unknown[], split = false) {
  const bytes = new TextEncoder().encode(
    lines.map((value) => JSON.stringify(value)).join("\n") + "\n",
  );
  return new Response(
    new ReadableStream({
      start(controller) {
        if (split)
          for (const byte of bytes) controller.enqueue(Uint8Array.of(byte));
        else controller.enqueue(bytes);
        controller.close();
      },
    }),
    { headers: { "Content-Type": "application/x-ndjson" } },
  );
}
test("stream reconstructs split UTF-8 frames and reports observed stage changes", async () => {
  const seen: AssistantStage[] = [];
  const result = await readChatStream(
    response(
      [
        { type: "assistant.stage", stage: "manager", status: "running" },
        { type: "assistant.stage", stage: "manager", status: "completed" },
        { type: "assistant.completed", result: reply },
      ],
      true,
    ),
    (event) => seen.push(event),
  );
  assert.equal(result.answer, "Qualité contrôlée");
  assert.deepEqual(seen, [
    { stage: "manager", status: "running" },
    { stage: "manager", status: "completed" },
  ]);
});
test("stream cannot present partial output as a completed answer", async () => {
  await assert.rejects(
    readChatStream(
      response([
        { type: "assistant.stage", stage: "manager", status: "completed" },
      ]),
      () => {},
    ),
    /incomplete_stream/,
  );
  await assert.rejects(
    readChatStream(
      response([
        { type: "assistant.completed", result: { answer: "unsupported" } },
      ]),
      () => {},
    ),
  );
});
test("unknown stages and unsafe errors fail closed without exposing provider text", async () => {
  const seen: AssistantStage[] = [];
  await assert.rejects(
    readChatStream(
      response([
        {
          type: "assistant.stage",
          stage: "private thoughts",
          status: "running",
        },
      ]),
      (event) => seen.push(event),
    ),
    /invalid_stream/,
  );
  assert.equal(seen.length, 0);
  await assert.rejects(
    readChatStream(
      response([
        { type: "assistant.failed", error: "secret provider details" },
      ]),
      () => {},
    ),
    /^Error: request_failed$/,
  );
  await assert.rejects(
    readChatStream(
      response([{ type: "assistant.failed", error: "review_rejected" }]),
      () => {},
    ),
    /review_rejected/,
  );
});
test("only NDJSON is accepted and terminal reader is cancelled", async () => {
  await assert.rejects(
    readChatStream(new Response("{}"), () => {}),
    /invalid_stream/,
  );
  let cancelled = false;
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(
        new TextEncoder().encode(
          JSON.stringify({ type: "assistant.completed", result: reply }) + "\n",
        ),
      );
    },
    cancel() {
      cancelled = true;
    },
  });
  await readChatStream(
    new Response(stream, {
      headers: { "content-type": "application/x-ndjson" },
    }),
    () => {},
  );
  assert.equal(cancelled, true);
});
