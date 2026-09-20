"use client";
import { useMemo, useState } from "react";
import { usePreferences } from "@/features/preferences/Preferences";
import type { Run } from "@/lib/models/domain";
import { isaacFrames } from "@/lib/models/robotScene";
import { RobotScene } from "../RobotScene/RobotScene";
import styles from "./RecordedSceneStyles.module.css";
export function RecordedScene({
  run,
  title,
  caption,
}: {
  run?: Run | null;
  title: string;
  caption: string;
}) {
  const { t } = usePreferences();
  const frames = useMemo(() => isaacFrames(run), [run]);
  const [index, setIndex] = useState(0);
  const selected = Math.min(index, Math.max(0, frames.length - 1));
  const frame = frames[selected];
  if (!frame) return <RobotScene title={title} caption={caption} />;
  return (
    <figure className={styles.scene}>
      {/* biome-ignore lint/performance/noImgElement: Bounded authenticated native camera frame, never an arbitrary image URL. */}
      <img
        src={frame.data_url}
        alt={`${title} · Isaac Sim · ${frame.simulation_time_s.toFixed(2)} s`}
      />
      <figcaption>
        <strong>{t.nativeFrame} · Isaac Sim</strong>
        <span>
          {frame.simulation_time_s.toFixed(3)} s · {selected + 1}/
          {frames.length}
        </span>
        <code title={frame.sha256}>SHA-256 {frame.sha256.slice(0, 16)}…</code>
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
