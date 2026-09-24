"use client";
import { useState } from "react";
import styles from "./DeckMediaStyles.module.css";
import { type DeckMediaId, mediaDefinition } from "./media";
import type { DeckLabels } from "./types";

type Props = {
  mediaId: DeckMediaId;
  title: string;
  active: boolean;
  labels: DeckLabels;
  sessionStarted?: boolean;
  startWorkspace?: () => Promise<void>;
};
export function DeckMedia({
  mediaId,
  title,
  active,
  labels,
  sessionStarted,
  startWorkspace,
}: Props) {
  const media = mediaDefinition(mediaId);
  const [requested, setRequested] = useState(false);
  const [version, setVersion] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const mounted = active && (media.kind === "video" || requested);
  async function load() {
    setBusy(true);
    setError(false);
    try {
      if (mediaId === "workspace") {
        if (!startWorkspace) throw new Error("Demo session unavailable");
        await startWorkspace();
      }
      setRequested(true);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }
  return (
    <figure className={styles.media} data-media={mediaId}>
      <div className={styles.mediaScreen}>
        {mounted ? (
          <iframe
            key={`${mediaId}-${version}`}
            src={media.src}
            title={title}
            allow={
              mediaId === "workspace"
                ? "microphone 'self'; fullscreen 'self'"
                : "fullscreen; picture-in-picture"
            }
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            sandbox={
              mediaId === "workspace"
                ? undefined
                : "allow-scripts allow-same-origin allow-presentation allow-pointer-lock"
            }
          />
        ) : (
          <MediaPoster src={media.poster} title={title} />
        )}
        {active && media.kind === "demo" && !requested && (
          <div className={styles.launch}>
            <button type="button" disabled={busy} onClick={() => void load()}>
              {busy
                ? labels.loading
                : mediaId === "workspace"
                  ? sessionStarted
                    ? labels.loadDemo
                    : labels.startDemo
                  : labels.loadReplay}
              <span aria-hidden="true">↗</span>
            </button>
            {error && <p role="alert">{labels.demoError}</p>}
          </div>
        )}
      </div>
      <figcaption>
        <span>{active ? labels.mediaNote : labels.inactiveMedia}</span>
        <div>
          {mounted && media.kind === "demo" && (
            <button
              type="button"
              onClick={() => setVersion((value) => value + 1)}
            >
              {labels.reload}
            </button>
          )}
          <a href={media.href} target="_blank" rel="noopener noreferrer">
            {labels.open} ↗
          </a>
        </div>
      </figcaption>
    </figure>
  );
}
function MediaPoster({ src, title }: { src: string; title: string }) {
  return (
    <>
      {/* biome-ignore lint/performance/noImgElement: Local supplied presentation imagery is shown without altering its source. */}
      <img src={src} alt={title} loading="lazy" />
    </>
  );
}
