import assert from "node:assert/strict";
import { test } from "node:test";
import { renderToStaticMarkup } from "react-dom/server";
import { deckContent, deckLabels, slideMedia } from "./content";
import { DeckMedia } from "./DeckMedia";
import { deckMedia } from "./media";
import { DeckPages } from "./PitchDeck";

test("only the active video mounts a frame; inactive print slides never mount media", () => {
  for (let index = 0; index < deckContent.en.length; index++) {
    const html = renderToStaticMarkup(
      <DeckPages
        slides={deckContent.en}
        index={index}
        locale="en"
        labels={deckLabels.en}
      />,
    );
    const id = slideMedia[deckContent.en[index].id];
    const video = id && deckMedia[id].kind === "video";
    assert.equal((html.match(/<iframe\b/g) ?? []).length, video ? 1 : 0);
    if (video && id) {
      assert.ok(html.includes("autoplay=0"));
      assert.ok(html.includes('title="'));
      assert.ok(html.includes('rel="noopener noreferrer"'));
    }
  }
});
test("workspace and recorded replay wait for explicit user gestures in all four languages", () => {
  for (const labels of Object.values(deckLabels)) {
    for (const mediaId of ["workspace", "replay"] as const) {
      const html = renderToStaticMarkup(
        <DeckMedia mediaId={mediaId} title="Demo" active labels={labels} />,
      );
      assert.equal(html.includes("<iframe"), false);
      assert.ok(
        html.includes(
          mediaId === "workspace" ? labels.startDemo : labels.loadReplay,
        ),
      );
      assert.ok(html.includes(labels.open));
    }
  }
});
test("inactive video has a safe fallback without loading the remote player", () => {
  const html = renderToStaticMarkup(
    <DeckMedia
      mediaId="video1"
      title="Film 01"
      active={false}
      labels={deckLabels.en}
    />,
  );
  assert.equal(html.includes("<iframe"), false);
  assert.equal(html.includes("player.vimeo.com"), false);
  assert.ok(html.includes("https://vimeo.com/1229790397"));
});
