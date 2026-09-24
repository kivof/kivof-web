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
    const media = id ? deckMedia[id] : undefined;
    const video = media?.kind === "video";
    assert.equal((html.match(/<iframe\b/g) ?? []).length, video ? 1 : 0);
    if (media?.kind === "video") {
      assert.ok(html.includes("autoplay=1&amp;muted=1"));
      assert.ok(html.includes('data-media-kind="video"'));
      assert.ok(html.includes(`title="${media.title}"`));
      assert.ok(
        html.includes(
          'allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"',
        ),
      );
      assert.ok(
        html.includes('referrerPolicy="strict-origin-when-cross-origin"'),
      );
      assert.ok(html.includes('rel="noopener noreferrer"'));
      assert.equal(html.includes("api/player.js"), false);
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
