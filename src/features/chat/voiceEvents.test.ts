import assert from "node:assert/strict";
import { test } from "node:test";
import { releaseVoice, transcriptEvent } from "./voiceEvents";

test("realtime transcripts preserve speaker roles", () => {
  assert.deepEqual(
    transcriptEvent({
      type: "conversation.item.input_audio_transcription.completed",
      transcript: "question",
    }),
    { role: "user", text: "question" },
  );
  assert.deepEqual(
    transcriptEvent({
      type: "response.output_audio_transcript.done",
      transcript: "answer",
    }),
    { role: "assistant", text: "answer" },
  );
  assert.equal(
    transcriptEvent({
      type: "response.output_audio_transcript.delta",
      transcript: "partial",
    }),
    null,
  );
});
test("voice teardown stops every track and releases playback", () => {
  let stops = 0,
    closed = 0,
    paused = 0;
  const media = {
    getTracks: () =>
      [
        {
          stop: () => {
            stops++;
          },
        },
        {
          stop: () => {
            stops++;
          },
        },
      ] as MediaStreamTrack[],
  };
  const player = {
    pause: () => {
      paused++;
    },
    srcObject: {} as MediaStream,
  };
  releaseVoice(
    media,
    {
      close: () => {
        closed++;
      },
    },
    player,
  );
  assert.equal(stops, 2);
  assert.equal(closed, 1);
  assert.equal(paused, 1);
  assert.equal(player.srcObject, null);
});
