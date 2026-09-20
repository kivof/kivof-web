import assert from "node:assert/strict";
import { test } from "node:test";
import { parseModels, parseReply } from "./chat";

const reply = {
  id: "reply-1",
  answer: "Observed only",
  model: "configured-model",
  evidence: [{ id: "E1", label: "Run 1", locator: "run-1" }],
  summary: ["Inspected run"],
  components: [],
};
test("unsupported executable generative content fails closed", () => {
  assert.throws(() =>
    parseReply({ ...reply, components: [{ type: "html", html: "<script>" }] }),
  );
});
test("components must resolve source evidence", () => {
  assert.throws(() =>
    parseReply({
      ...reply,
      components: [
        {
          type: "metric",
          label: "Force",
          value: "10 N",
          sourceIds: ["missing"],
        },
      ],
    }),
  );
  assert.equal(
    parseReply({
      ...reply,
      components: [
        { type: "metric", label: "Force", value: "10 N", sourceIds: ["E1"] },
      ],
    }).components.length,
    1,
  );
});
test("malformed diagrams and non-image payloads are rejected", () => {
  assert.throws(() =>
    parseReply({
      ...reply,
      components: [
        {
          type: "diagram",
          title: "Path",
          nodes: [{ id: "a", label: "A" }],
          edges: [{ from: "a", to: "missing" }],
          sourceIds: [],
        },
      ],
    }),
  );
  assert.throws(() =>
    parseReply({ ...reply, image: { data: "abcd", mime_type: "text/html" } }),
  );
});
test("model default must be in available catalogue", () => {
  assert.throws(() =>
    parseModels({ defaultModel: "missing", models: [{ id: "a", label: "A" }] }),
  );
});
