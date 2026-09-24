export const deckAssets = {
  factory: "/deck/geneva/factory-scene.png",
  cutouts: "/deck/geneva/training-cutouts.png",
  replicator: "/deck/geneva/replicator-grid.jpg",
  clearance: "/deck/geneva/arm-clearance.png",
  operator: "/deck/geneva/operator-dashboard.png",
  replay: "/deck/geneva/factory-replay.png",
  replayControls: "/deck/geneva/replay-controls.png",
  objectControls: "/deck/geneva/object-controls.png",
  exporter: "/deck/geneva/exporter-panel.png",
  native: "/deck/geneva/native-inspection.png",
} as const;
export const deckMedia = {
  video1: {
    kind: "video",
    id: "1229790397",
    href: "https://vimeo.com/1229790397",
    poster: deckAssets.factory,
  },
  video2: {
    kind: "video",
    id: "1229790738",
    href: "https://vimeo.com/1229790738",
    poster: deckAssets.replay,
  },
  video3: {
    kind: "video",
    id: "1229793098",
    href: "https://vimeo.com/1229793098",
    poster: deckAssets.native,
  },
  replay: {
    kind: "demo",
    href: "https://adiy.ch/cheese/",
    poster: deckAssets.replay,
  },
  workspace: { kind: "demo", href: "/workspace", poster: deckAssets.native },
} as const;
export type DeckMediaId = keyof typeof deckMedia;
export function mediaDefinition(id: DeckMediaId) {
  if (!Object.hasOwn(deckMedia, id)) throw new Error("Unknown deck media");
  const media = deckMedia[id];
  return {
    ...media,
    src:
      media.kind === "video"
        ? `https://player.vimeo.com/video/${media.id}?autoplay=0&dnt=1&title=0&byline=0&portrait=0`
        : media.href,
  };
}
