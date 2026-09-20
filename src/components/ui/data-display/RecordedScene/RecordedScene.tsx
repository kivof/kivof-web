"use client";
import { useMemo, useState } from "react";
import { usePreferences } from "@/features/preferences/Preferences";
import type { Run } from "@/lib/models/domain";
import { nativePreview } from "@/lib/models/nativePreview";
import { isaacFrames } from "@/lib/models/robotScene";
import styles from "./RecordedSceneStyles.module.css";
export function RecordedScene({
  run,
  title,
}: {
  run?: Run | null;
  title: string;
}) {
  const { t, locale } = usePreferences();
  const frames = useMemo(() => isaacFrames(run), [run]);
  const [index, setIndex] = useState(0);
  const selected = Math.min(index, Math.max(0, frames.length - 1));
  const frame = frames[selected];
  const sha256 = frame?.sha256 ?? nativePreview.sha256;
  const time = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 3,
  }).format(frame?.simulation_time_s ?? nativePreview.simulationTime);
  return (
    <figure
      className={styles.scene}
      data-native-source={frame ? "run" : "preview"}
    >
      {/* biome-ignore lint/performance/noImgElement: Verified bundled preview or bounded authenticated native camera frame. */}
      <img
        src={frame?.data_url ?? nativePreview.url}
        alt={`${title} · Isaac Sim · ${time} s`}
        width={nativePreview.width}
        height={nativePreview.height}
      />
      <figcaption>
        <strong>{frame ? t.nativeFrame : t.recordedPreview} · Isaac Sim</strong>
        <span>
          {time} s{frame ? ` · ${selected + 1}/${frames.length}` : ""}
        </span>
        <code title={sha256}>SHA-256 {sha256.slice(0, 16)}…</code>
        <p>{frame ? t.recordedFrameBody : t.recordedPreviewBody}</p>
      </figcaption>
      {frames.length > 1 && (
        <label className={styles.scrubber}>
          {t.recordedFrames}
          <input
            type="range"
            min={0}
            max={frames.length - 1}
            value={selected}
            onChange={(event) => setIndex(Number(event.target.value))}
          />
        </label>
      )}
    </figure>
  );
}
