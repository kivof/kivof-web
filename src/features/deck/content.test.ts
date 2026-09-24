import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { test } from "node:test";
import { deckContent, deckLabels, slideMedia } from "./content";
import {
  type DeckMediaId,
  deckAssets,
  deckMedia,
  mediaDefinition,
} from "./media";
import { slideIds } from "./types";

test("all 23 slides preserve language, content and order parity", () => {
  for (const [locale, slides] of Object.entries(deckContent)) {
    assert.equal(slides.length, 23);
    assert.deepEqual(
      slides.map((slide) => slide.id),
      [...slideIds],
    );
    slides.forEach((slide, index) => {
      assert.ok(slide.title && slide.body && slide.note && slide.label);
      assert.equal(slide.points.length, deckContent.en[index].points.length);
    });
    assert.deepEqual(
      Object.keys(deckLabels[locale as keyof typeof deckLabels]),
      Object.keys(deckLabels.en),
    );
    assert.equal(deckLabels[locale as keyof typeof deckLabels].bins.length, 5);
  }
});
test("exactly three distinct supplied videos and two separate demo slides are allowlisted", () => {
  const ordered = slideIds.flatMap((id) => {
    const media = slideMedia[id];
    return media ? [media] : [];
  });
  const videos = ordered
    .map((id) => deckMedia[id])
    .filter((media) => media.kind === "video");
  assert.deepEqual(
    videos.map((video) => video.id),
    ["1229790397", "1229790738", "1229793098"],
  );
  assert.deepEqual(
    ordered.filter((id) => deckMedia[id].kind === "demo"),
    ["replay", "workspace"],
  );
  for (const id of ordered) {
    const definition = mediaDefinition(id);
    if (definition.kind === "video") {
      const url = new URL(definition.src);
      assert.equal(url.origin, "https://player.vimeo.com");
      assert.equal(url.pathname, `/video/${definition.id}`);
      assert.deepEqual(Object.fromEntries(url.searchParams), {
        badge: "0",
        autopause: "0",
        player_id: "0",
        app_id: "58479",
        autoplay: "1",
        muted: "1",
        dnt: "1",
      });
    }
  }
  assert.throws(() => mediaDefinition("https://evil.invalid" as DeckMediaId));
});
test("all authored deck images exist as local presentation assets", () => {
  for (const path of Object.values(deckAssets))
    assert.ok(existsSync(`public${path}`), path);
});
