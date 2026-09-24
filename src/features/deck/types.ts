export const slideIds = [
  "hero",
  "task",
  "capture",
  "training",
  "clearance",
  "scores",
  "outcomes",
  "video1",
  "operator",
  "exporterIntro",
  "viewer",
  "formats",
  "export",
  "replayInvite",
  "replay",
  "video2",
  "workspace",
  "workflow",
  "demo",
  "boundary",
  "native",
  "video3",
  "closing",
] as const;
export type SlideId = (typeof slideIds)[number];
export type SlideCopy = {
  label: string;
  title: string;
  body: string;
  points: string[];
  note: string;
};
export type DeckCopy = Record<SlideId, SlideCopy>;
export type DeckLabels = {
  open: string;
  reload: string;
  startDemo: string;
  loadDemo: string;
  loadReplay: string;
  loading: string;
  demoError: string;
  mediaNote: string;
  inactiveMedia: string;
  recording: string;
  interactive: string;
  jump: string;
  keyboard: string;
  modelTask: string;
  correctImages: string;
  accuracy: string;
  macroF1: string;
  cheeseType: string;
  destination: string;
  bins: string[];
  source: string;
};
