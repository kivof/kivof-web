// biome-ignore-all lint/suspicious/noArrayIndexKey: Immutable result snapshots preserve ordered items without source row IDs.
"use client";
import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/ui/data-display/Icon/Icon";
import { RobotScene } from "@/components/ui/data-display/RobotScene/RobotScene";
import { usePreferences } from "@/features/preferences/Preferences";
import { api } from "@/lib/api/client";
import type { Run } from "@/lib/models/domain";
import { Fields, RunBadge } from "./Fields";
import styles from "./PanelsStyles.module.css";
export function SimulationPanel({
  capabilities,
  refresh,
}: {
  capabilities: Record<string, unknown>;
  refresh: () => Promise<void>;
}) {
  const { t } = usePreferences();
  const [scenario, setScenario] = useState("nominal");
  const [busy, setBusy] = useState(false);
  const [run, setRun] = useState<Run | null>(null);
  const [error, setError] = useState(false);
  async function start() {
    setBusy(true);
    setError(false);
    try {
      const result = await api<Run | { run: Run }>("runs", { scenario });
      setRun("run" in result ? result.run : result);
      await refresh();
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <p className={styles.intro}>{t.simBody}</p>
      <section className={styles.card}>
        <RobotScene title={t.sceneTitle} caption={t.sceneCaption} />
        <div className={styles.simControls}>
          <label>
            {t.scenario}
            <select
              value={scenario}
              onChange={(e) => setScenario(e.target.value)}
              disabled={busy}
            >
              {["nominal", "occlusion", "force_spike"].map((key) => (
                <option key={key} value={key}>
                  {t[key]}
                </option>
              ))}
            </select>
          </label>
          <button type="button" onClick={() => void start()} disabled={busy}>
            <Icon name="cube" size={18} />
            {busy ? t.running : t.simulate}
          </button>
        </div>
        <p className={styles.footnote}>{t.simNote}</p>
        {error && (
          <p role="alert" className={styles.empty}>
            {t.error}
          </p>
        )}
        {run && (
          <div className={styles.result}>
            <RunBadge run={run} />
            <Link href={`/workspace/runs/${run.id}`}>{t.inspect} →</Link>
          </div>
        )}
      </section>
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>{t.capabilities}</h2>
        </div>
        <Fields values={capabilities} />
      </section>
    </>
  );
}
