import type { Locale } from "@/lib/i18n";
import type { Slide } from "./content";
import styles from "./DeckVisualsStyles.module.css";
import { deckAssets } from "./media";
import type { DeckLabels } from "./types";
export function DeckImage({
  asset,
  caption,
  device = false,
}: {
  asset: keyof typeof deckAssets;
  caption: string;
  device?: boolean;
}) {
  return (
    <figure className={`${styles.picture} ${device ? styles.device : ""}`}>
      {device && (
        <div className={styles.window} aria-hidden="true">
          <i />
          <i />
          <i />
        </div>
      )}
      <div className={styles.imageFrame}>
        {/* biome-ignore lint/performance/noImgElement: Supplied project captures keep their original source and framing. */}
        <img src={deckAssets[asset]} alt={caption} loading="lazy" />
      </div>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
export function DeckVisual({
  slide,
  labels,
  locale,
}: {
  slide: Slide;
  labels: DeckLabels;
  locale: Locale;
}) {
  switch (slide.id) {
    case "hero":
    case "closing":
      return <DeckImage asset="factory" caption={slide.note} device />;
    case "task":
      return <Bins slide={slide} labels={labels} />;
    case "capture":
    case "workflow":
    case "boundary":
      return <Steps points={slide.points} />;
    case "training":
      return (
        <div className={styles.training}>
          <DeckImage asset="cutouts" caption={slide.points[0]} />
          <DeckImage asset="replicator" caption={slide.points[1]} />
        </div>
      );
    case "clearance":
      return <DeckImage asset="clearance" caption={slide.points.join(" · ")} />;
    case "scores":
      return <Scores labels={labels} locale={locale} />;
    case "outcomes":
      return <Outcomes slide={slide} />;
    case "exporterIntro":
    case "replayInvite":
      return <DeckImage asset="replay" caption={slide.note} device />;
    case "viewer":
      return (
        <div className={styles.inspector}>
          <DeckImage asset="replay" caption={slide.note} />
          <div>
            <DeckImage asset="replayControls" caption={slide.points[0]} />
            <DeckImage
              asset="objectControls"
              caption={slide.points.slice(1).join(" · ")}
            />
          </div>
        </div>
      );
    case "formats":
      return <Formats points={slide.points} />;
    case "operator":
      return <DeckImage asset="operator" caption={slide.body} />;
    case "export":
      return (
        <div className={styles.export}>
          <DeckImage asset="exporter" caption="Isaac Web Exporter" />
          <Steps points={slide.points} />
        </div>
      );
    case "workspace":
      return <DeckImage asset="native" caption={slide.note} device />;
    case "native":
      return <DeckImage asset="native" caption={slide.body} />;
    default:
      return null;
  }
}
function Bins({ slide, labels }: { slide: Slide; labels: DeckLabels }) {
  return (
    <div className={styles.bins}>
      <div className={styles.bigNumber}>
        <strong>11</strong>
        <span>→</span>
        <strong>5</strong>
      </div>
      {slide.points.map((point, i) => (
        <div className={styles.bin} key={point}>
          <span>{point}</span>
          <b>{labels.bins[i]}</b>
        </div>
      ))}
    </div>
  );
}
function Steps({ points }: { points: string[] }) {
  return (
    <ol className={styles.steps}>
      {points.map((point, i) => {
        const [title, detail] = point.split("\n");
        return (
          <li key={point}>
            <span>{String(i + 1).padStart(2, "0")}</span>
            <div>
              <strong>{title}</strong>
              {detail && <p>{detail}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
function Scores({ labels, locale }: { labels: DeckLabels; locale: Locale }) {
  const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 4 });
  return (
    <div className={styles.scores}>
      <table>
        <thead>
          <tr>
            {[
              labels.modelTask,
              labels.correctImages,
              labels.accuracy,
              labels.macroF1,
            ].map((label) => (
              <th key={label}>{label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>{labels.cheeseType}</th>
            <td>429 / 545</td>
            <td>{number.format(78.7)}%</td>
            <td>{number.format(0.4365)}</td>
          </tr>
          <tr>
            <th>{labels.destination}</th>
            <td>656 / 845</td>
            <td>{number.format(77.6)}%</td>
            <td>{number.format(0.5509)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
function Outcomes({ slide }: { slide: Slide }) {
  return (
    <div className={styles.outcomes}>
      {slide.points.map((point, i) => {
        const [title, detail] = point.split("\n");
        return (
          <section key={point}>
            <span>{title}</span>
            <strong>
              {i === 0 ? "4" : "11"}
              <small> / 11</small>
            </strong>
            <p>{detail}</p>
          </section>
        );
      })}
    </div>
  );
}

function Formats({ points }: { points: string[] }) {
  return (
    <div className={styles.formats}>
      {points.map((point) => {
        const [title, ...details] = point.split("\n");
        return (
          <section key={title}>
            <h2>{title}</h2>
            {details.map((detail) => (
              <p key={detail}>{detail}</p>
            ))}
          </section>
        );
      })}
    </div>
  );
}
