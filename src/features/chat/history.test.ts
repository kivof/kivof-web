import assert from "node:assert/strict";
import { test } from "node:test";
import { historyTurns } from "./history";

test("restored history creates distinct user and assistant turns without duplicating old context", () => {
  const record = {
    id: "r1",
    answer: "answer",
    model: "model",
    request: {
      messages: [
        { role: "user", content: "old" },
        { role: "assistant", content: "old answer" },
        { role: "user", content: "latest" },
      ],
    },
    image_id: "r1",
  };
  const turns = historyTurns({ items: [record] });
  assert.deepEqual(
    turns.map((turn) => [turn.role, turn.content]),
    [
      ["user", "latest"],
      ["assistant", "answer"],
    ],
  );
  assert.equal(turns[1].imageId, "r1");
});
