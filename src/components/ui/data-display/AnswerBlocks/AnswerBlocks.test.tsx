import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { AnswerBlocks } from "./AnswerBlocks";

test("provider text remains escaped and sources stay visible", () => {
  const html = renderToStaticMarkup(
    <AnswerBlocks
      components={[
        {
          type: "metric",
          label: "<script>alert(1)</script>",
          value: "10 N",
          sourceIds: ["E1"],
        },
      ]}
      evidence={[{ id: "E1", label: "Run evidence", locator: "run-1" }]}
      copy={{ sources: "Sources" }}
    />,
  );
  assert.ok(!html.includes("<script>"));
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /Run evidence/);
  assert.match(html, /data-component-type="metric"/);
});
