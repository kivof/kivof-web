import assert from "node:assert/strict";
import { test } from "node:test";
import { deckContent } from "./content";

test("deck has translated complete slides", () => {
  for (const slides of Object.values(deckContent)) {
    assert.equal(slides.length, 8);
    for (const slide of slides) {
      assert.ok(slide.title && slide.body && slide.note);
      assert.ok(slide.points.length > 1);
    }
  }
});
