import type { Locale } from "@/lib/i18n";
import { de, deLabels } from "./de";
import { en, enLabels } from "./en";
import { es, esLabels } from "./es";
import { fr, frLabels } from "./fr";
import type { DeckMediaId } from "./media";
import {
  type DeckLabels,
  type SlideCopy,
  type SlideId,
  slideIds,
} from "./types";
export type Slide = SlideCopy & { id: SlideId };
const copies = { en, es, de, fr };
export const deckContent = Object.fromEntries(
  Object.entries(copies).map(([locale, copy]) => [
    locale,
    slideIds.map((id) => ({ id, ...copy[id] })),
  ]),
) as Record<Locale, Slide[]>;
export const deckLabels: Record<Locale, DeckLabels> = {
  en: enLabels,
  es: esLabels,
  de: deLabels,
  fr: frLabels,
};
export const slideMedia: Partial<Record<SlideId, DeckMediaId>> = {
  video1: "video1",
  replay: "replay",
  video2: "video2",
  demo: "workspace",
  video3: "video3",
};
