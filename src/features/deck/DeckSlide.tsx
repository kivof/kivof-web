import type { Locale } from "@/lib/i18n";
import { type Slide, slideMedia } from "./content";
import { DeckMedia } from "./DeckMedia";
import { DeckVisual } from "./DeckVisuals";
import styles from "./PitchDeckStyles.module.css";
import type { DeckLabels } from "./types";

type Props = {
  slide: Slide;
  index: number;
  total: number;
  locale: Locale;
  labels: DeckLabels;
  active: boolean;
  sessionStarted?: boolean;
  startWorkspace?: () => Promise<void>;
};
export function DeckSlide({
  slide,
  index,
  total,
  locale,
  labels,
  active,
  sessionStarted,
  startWorkspace,
}: Props) {
  const mediaId = slideMedia[slide.id];
  const showPoints = [
    "hero",
    "clearance",
    "operator",
    "workspace",
    "native",
    "exporterIntro",
    "viewer",
    "replayInvite",
  ].includes(slide.id);
  return (
    <article
      className={styles.slide}
      data-slide={slide.id}
      data-media-slide={Boolean(mediaId)}
      lang={locale}
      aria-label={`${index + 1} / ${total}`}
    >
      <div className={styles.slideTop}>
        <span>{slide.label}</span>
        <span className={styles.wordmark}>
          kivof<span>·</span>
        </span>
      </div>
      <div className={styles.slideMain}>
        <div className={styles.story}>
          <h1>{slide.title}</h1>
          <p>{slide.body}</p>
          {showPoints && (
            <ul>
              {slide.points.map((point, i) => (
                <li key={point}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  {point}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className={styles.visual}>
          {mediaId ? (
            <DeckMedia
              key={mediaId}
              mediaId={mediaId}
              title={`${slide.label} — ${slide.title.replaceAll("\n", " ")}`}
              active={active}
              labels={labels}
              sessionStarted={sessionStarted}
              startWorkspace={startWorkspace}
            />
          ) : (
            <DeckVisual slide={slide} labels={labels} locale={locale} />
          )}
        </div>
      </div>
      <footer>
        <p>{slide.note}</p>
        <span>
          {String(index + 1).padStart(2, "0")}{" "}
          <b>/ {String(total).padStart(2, "0")}</b>
        </span>
      </footer>
    </article>
  );
}
