"use client";
import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/ui/data-display/Icon/Icon";
import { RecordedScene } from "@/components/ui/data-display/RecordedScene/RecordedScene";
import { Badge } from "@/components/ui/feedback/Badge/Badge";
import { usePreferences } from "@/features/preferences/Preferences";
import type { Overview, Run } from "@/lib/models/domain";
import styles from "./FactoryWorkbenchStyles.module.css";
import { Fields, RunBadge } from "./Fields";

export function FactoryWorkbench({ overview }: { overview: Overview }) {
  const { t, locale } = usePreferences();
  const run = overview.latest_run;
  const [selected, setSelected] = useState(0);
  const metrics = overview.metrics;
  const ratio = Math.max(
    0,
    Math.min(
      1,
      metrics.success_rate > 1
        ? metrics.success_rate / 100
        : metrics.success_rate,
    ),
  );
  return (
    <section className={styles.workbench} aria-label={t.sceneTitle}>
      <div className={styles.timeline}>
        <div className={styles.zone}>
          <Icon name="cube" size={18} />
          <span>
            <small>{t.workspace}</small>
            <strong>Harness Forge / 01</strong>
          </span>
        </div>
        <nav className={styles.ticks} aria-label={t.latestRun}>
          {(run?.steps.length
            ? run.steps.slice(0, 6)
            : [null, null, null, null]
          ).map((step, i) => (
            <button
              type="button"
              key={step ? String(step.stage ?? step.name ?? i) : `empty-${i}`}
              disabled={!step}
              data-active={selected === i && Boolean(step)}
              onClick={() => setSelected(i)}
              title={
                step ? String(step.stage ?? step.name ?? t.inspect) : t.noRuns
              }
            >
              <i />
              <span>
                {step
                  ? String(step.stage ?? step.name ?? `${t.runs} ${i + 1}`)
                  : "—"}
              </span>
            </button>
          ))}
        </nav>
        <Badge>{run ? (t[run.source] ?? run.source) : t.noRuns}</Badge>
      </div>
      <aside className={styles.leftDock}>
        <section className={styles.panel}>
          <h2>
            <Icon name="grid" size={16} />
            {t.overview}
          </h2>
          {[
            ["totalRuns", metrics.total_runs],
            ["successRuns", metrics.successful_runs],
            ["failedRuns", metrics.failed_runs],
          ].map(([key, value]) => (
            <div className={styles.stat} key={key}>
              <Icon
                name={
                  key === "totalRuns"
                    ? "activity"
                    : key === "successRuns"
                      ? "shield"
                      : "bolt"
                }
                size={20}
              />
              <span>
                <small>{t[key]}</small>
                <strong>
                  {new Intl.NumberFormat(locale).format(Number(value))}
                </strong>
              </span>
              <span className={styles.indicator} />
            </div>
          ))}
        </section>
        <section className={styles.panel}>
          <h2>
            <Icon name="graph" size={16} />
            {t.sceneTitle}
          </h2>
          <div className={styles.minimap} aria-hidden="true">
            <div />
            <span>HF / 01</span>
          </div>
          <small className={styles.caption}>{t.sceneCaption}</small>
        </section>
        <section className={styles.panel}>
          <h2>{t.successRate}</h2>
          <div className={styles.dial}>
            <svg viewBox="0 0 180 112" aria-hidden="true">
              <path d="M20 92a70 70 0 0 1 140 0" className={styles.arcTrack} />
              <path
                d="M20 92a70 70 0 0 1 140 0"
                pathLength="100"
                strokeDasharray={`${ratio * 100} 100`}
                className={styles.arc}
              />
              <path d="M14 96h9m134 0h9M90 15v9" className={styles.ticksLine} />
            </svg>
            <strong>
              {metrics.total_runs
                ? new Intl.NumberFormat(locale, {
                    style: "percent",
                    maximumFractionDigits: 0,
                  }).format(ratio)
                : "—"}
            </strong>
            <small>
              {metrics.successful_runs} / {metrics.total_runs} · {t.simulated}
            </small>
          </div>
        </section>
      </aside>
      <div className={styles.stage}>
        <div className={styles.stageMeta}>
          <Badge>
            {t.simulated} · {t.replay}
          </Badge>
          <span>HARNESS FORGE</span>
        </div>
        <RecordedScene
          run={run}
          title={t.sceneTitle}
          caption={t.sceneCaption}
        />
        <div className={styles.stageBottom}>
          <span>
            <i />
            {t.localAuthority}
          </span>
          <Link href="/workspace/simulation">
            <Icon name="cube" size={15} />
            {t.simulate}
            <Icon name="arrow" size={14} />
          </Link>
        </div>
      </div>
      <aside className={styles.rightDock}>
        <section className={styles.panel}>
          <h2>
            <Icon name="robot" size={16} />
            {t.latestRun}
          </h2>
          {run ? (
            <>
              <div className={styles.runStatus}>
                <RunBadge run={run} />
                <strong>{t[run.scenario] ?? run.scenario}</strong>
                <code>{run.id}</code>
              </div>
              <Fields
                values={{
                  source: run.source,
                  data_origin: run.data_origin,
                  view_mode: run.view_mode,
                  started_at: run.started_at,
                }}
              />
              <Link
                className={styles.inspect}
                href={`/workspace/runs/${run.id}`}
              >
                {t.inspect}
                <Icon name="arrow" size={14} />
              </Link>
            </>
          ) : (
            <p className={styles.empty}>{t.noRuns}</p>
          )}
        </section>
        <section className={styles.panel}>
          <h2>
            <Icon name="shield" size={16} />
            {t.verification}
          </h2>
          {run ? (
            <Fields values={selectedStep(run, selected)} />
          ) : (
            <p className={styles.empty}>{t.noData}</p>
          )}
        </section>
      </aside>
    </section>
  );
}

function selectedStep(run: Run, selected: number) {
  return run.steps[selected] ?? run.verification;
}
