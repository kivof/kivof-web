// biome-ignore-all lint/suspicious/noArrayIndexKey: Immutable result snapshots preserve ordered items without source row IDs.
"use client";
import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/ui/data-display/Icon/Icon";
import { RecordedScene } from "@/components/ui/data-display/RecordedScene/RecordedScene";
import { usePreferences } from "@/features/preferences/Preferences";
import { api } from "@/lib/api/client";
import type { Run } from "@/lib/models/domain";
import { robotState } from "@/lib/models/robotScene";
import { Fields, RunBadge } from "./Fields";
import forms from "./PanelFormsStyles.module.css";
import styles from "./PanelsStyles.module.css";
import stageStyles from "./SimulationStageStyles.module.css";
export function SimulationPanel({
  capabilities,
  refresh,
  latestRun,
}: {
  capabilities: Record<string, unknown>;
  latestRun?: Run | null;
  refresh: () => Promise<void>;
}) {
  const { t } = usePreferences();
  const [scenario, setScenario] = useState("nominal");
  const [engine, setEngine] = useState("cpu");
  const [busy, setBusy] = useState(false);
  const [run, setRun] = useState<Run | null>(null);
  const [error, setError] = useState(false);
  const currentRun = run ?? latestRun;
  const robot = robotState(currentRun);
  async function start() {
    setBusy(true);
    setError(false);
    try {
      const result = await api<Run | { run: Run }>("runs", {
        scenario,
        engine,
      });
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
      <section className={stageStyles.workbench}>
        <div className={stageStyles.stage}>
          <RecordedScene
            run={currentRun}
            title={t.sceneTitle}
            caption={t.sceneCaption}
          />
        </div>
        <div className={stageStyles.controls}>
          <h2>{t.simulation}</h2>
          <div className={forms.simControls}>
            <label>
              {t.engine}
              <select
                value={engine}
                onChange={(event) => setEngine(event.target.value)}
                disabled={busy}
              >
                <option value="cpu">{t.cpuEngine}</option>
                <option value="isaac">{t.isaacEngine}</option>
              </select>
            </label>
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
              {engine === "isaac" ? t.isaacUnavailable : t.error}
            </p>
          )}
          {currentRun && (
            <div className={forms.result}>
              <RunBadge run={currentRun} />
              <Link href={`/workspace/runs/${currentRun.id}`}>
                {t.inspect} →
              </Link>
            </div>
          )}
        </div>
        <aside className={stageStyles.inspector}>
          <h2>{t.robotState}</h2>
          {robot ? (
            <>
              <strong>{robot.model}</strong>
              <table>
                <thead>
                  <tr>
                    <th>{t.joint}</th>
                    <th>{t.position} / rad</th>
                    <th>{t.velocity} / rad/s</th>
                  </tr>
                </thead>
                <tbody>
                  {robot.names.map((name, i) => (
                    <tr key={name}>
                      <td>{name}</td>
                      <td>{robot.positions[i]?.toFixed(4)}</td>
                      <td>{robot.velocities[i]?.toFixed(4) ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <p>{t.noData}</p>
          )}
        </aside>
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
