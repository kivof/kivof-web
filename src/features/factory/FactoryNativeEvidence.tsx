"use client";
import { useEffect, useState } from "react";
import type { Locale } from "@/lib/i18n";
import {
  type FactoryNative,
  verifyFactoryFrame,
} from "@/lib/models/factoryNative";
import styles from "./FactoryStyles.module.css";
export function FactoryNativeEvidence({
  native,
  copy: t,
  locale,
}: {
  native: FactoryNative;
  copy: Record<string, string>;
  locale: Locale;
}) {
  const [index, setIndex] = useState(0);
  const [verified, setVerified] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const frame = native.frames[Math.min(index, native.frames.length - 1)];
  const sample = native.samples.at(-1);
  const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 4 });
  useEffect(() => {
    let active = true;
    setVerified(null);
    setFailed(false);
    void verifyFactoryFrame(frame)
      .then((valid) => {
        if (active) {
          if (valid) setVerified(frame.sha256);
          else setFailed(true);
        }
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, [frame]);
  const boolean = (value: boolean | null) =>
    value == null ? t.unknown : value ? t.yes : t.no;
  return (
    <section className={styles.card} aria-label={t.nativeFactoryEvidence}>
      <h3>{t.nativeFactoryEvidence}</h3>
      <div className={styles.nativeGrid}>
        <figure className={styles.nativeFrame}>
          {verified === frame.sha256 ? (
            <>
              {/* biome-ignore lint/performance/noImgElement: This bounded inline PNG has passed a SHA-256 check against its recorded receipt. */}
              <img
                src={frame.dataUrl}
                alt={t.factoryCameraFrame}
                width={frame.width}
                height={frame.height}
              />
            </>
          ) : (
            <p role={failed ? "alert" : undefined}>
              {failed ? t.frameRejected : t.frameChecking}
            </p>
          )}
          <figcaption>
            {t.factoryCameraFrame} · {number.format(frame.time)} s
            <code>SHA-256 {frame.sha256}</code>
          </figcaption>
          {native.frames.length > 1 && (
            <label>
              {t.recordedFrames}
              <input
                type="range"
                min={0}
                max={native.frames.length - 1}
                value={index}
                onChange={(event) => setIndex(Number(event.target.value))}
              />
            </label>
          )}
        </figure>
        <div>
          <dl>
            <div>
              <dt>{t.distanceToBin}</dt>
              <dd>
                {native.distance == null
                  ? t.unknown
                  : `${number.format(native.distance)} m`}
              </dd>
            </div>
            <div>
              <dt>{t.itemSpeed}</dt>
              <dd>
                {native.speed == null
                  ? t.unknown
                  : `${number.format(native.speed)} m/s`}
              </dd>
            </div>
            <div>
              <dt>{t.liftObserved}</dt>
              <dd>{boolean(native.lifted)}</dd>
            </div>
            <div>
              <dt>{t.gripperReleased}</dt>
              <dd>{boolean(native.released)}</dd>
            </div>
          </dl>
          {sample && (
            <>
              <p>
                {t.lastJointSample} · {number.format(sample.time)} s
              </p>
              <div className={styles.scroll}>
                <table>
                  <thead>
                    <tr>
                      <th>{t.joint}</th>
                      <th>{t.position} / rad</th>
                      <th>{t.velocity} / rad/s</th>
                    </tr>
                  </thead>
                  <tbody>
                    {["1", "2", "3", "4", "5", "6", "7"].map((joint, i) => (
                      <tr key={joint}>
                        <td>{joint}</td>
                        <td>{number.format(sample.positions[i])}</td>
                        <td>{number.format(sample.velocities[i])}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
