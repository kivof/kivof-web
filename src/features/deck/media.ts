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
    title:
      "Kivof ( CH ) HPE NVIDIA Cheese Factory Demo Video S01 ( EN ) Confidential",
    href: "https://vimeo.com/1229790397",
    poster: deckAssets.factory,
  },
  video2: {
    kind: "video",
    id: "1229790738",
    title:
      "Kivof ( CH ) HPE NVIDIA Cheese Factory Demo Video S02 ( EN ) Confidential",
    href: "https://vimeo.com/1229790738",
    poster: deckAssets.replay,
  },
  video3: {
    kind: "video",
    id: "1229793098",
    title:
      "Kivof ( CH ) HPE NVIDIA Cheese Factory Demo Video S03 ( EN ) Confidential",
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
        ? `https://player.vimeo.com/video/${media.id}?badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1&muted=1&dnt=1`
        : media.href,
  };
}
