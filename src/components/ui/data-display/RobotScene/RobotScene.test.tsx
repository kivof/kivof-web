import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { RobotScene } from "./RobotScene";

test("conceptual diagram has a text alternative and provenance caption", () => {
  const html = renderToStaticMarkup(
    <RobotScene title="Assembly cell" caption="Conceptual view" />,
  );
  assert.match(html, /Assembly cell/);
  assert.match(html, /Conceptual view/);
  assert.match(html, /aria-labelledby/);
});
