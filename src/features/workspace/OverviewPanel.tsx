// biome-ignore-all lint/suspicious/noArrayIndexKey: Immutable result snapshots preserve ordered items without source row IDs.
"use client";
import Link from "next/link";
import { Icon } from "@/components/ui/data-display/Icon/Icon";
import { RobotScene } from "@/components/ui/data-display/RobotScene/RobotScene";
import { Badge } from "@/components/ui/feedback/Badge/Badge";
import { usePreferences } from "@/features/preferences/Preferences";
import type { Overview } from "@/lib/models/domain";
import { RunBadge } from "./Fields";
import styles from "./PanelsStyles.module.css";
export function OverviewPanel({ overview }: { overview: Overview }) {
  const { t, locale } = usePreferences();
  const keys = ["totalRuns", "successRuns", "failedRuns", "successRate"];
  const values = [
    overview.metrics.total_runs,
    overview.metrics.successful_runs,
    overview.metrics.failed_runs,
    new Intl.NumberFormat(locale, {
      style: "percent",
      maximumFractionDigits: 0,
    }).format(
      overview.metrics.success_rate > 1
        ? overview.metrics.success_rate / 100
        : overview.metrics.success_rate,
    ),
  ];
  return (
    <>
      <p className={styles.intro}>{t.overviewBody}</p>
      <div className={styles.metrics}>
        {keys.map((key, i) => (
          <article key={key}>
            <span>{t[key]}</span>
            <strong>{values[i]}</strong>
            <small>{t.simulated}</small>
          </article>
        ))}
      </div>
      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <h2>{t.sceneTitle}</h2>
          <Badge tone="good">
            {t.simulated} · {t.replay}
          </Badge>
        </div>
        <RobotScene title={t.sceneTitle} caption={t.sceneCaption} />
      </section>
      <div className={styles.twoCol}>
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>{t.latestRun}</h2>
            <Icon name="activity" size={17} />
          </div>
          {overview.latest_run ? (
            <div className={styles.latest}>
              <RunBadge run={overview.latest_run} />
              <strong>
                {t[overview.latest_run.scenario] ??
                  overview.latest_run.scenario}
              </strong>
              <code>{overview.latest_run.id}</code>
              <Link href={`/workspace/runs/${overview.latest_run.id}`}>
                {t.inspect}
                <Icon name="arrow" size={16} />
              </Link>
            </div>
          ) : (
            <p className={styles.empty}>{t.noRuns}</p>
          )}
        </section>
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>{t.verification}</h2>
            <Icon name="shield" size={17} />
          </div>
          <div className={styles.loop}>
            {["flow1", "flow2", "flow3", "flow4"].map((key, i) => (
              <div key={key}>
                <span>0{i + 1}</span>
                {t[key]}
                <Icon name="chevron" size={13} />
              </div>
            ))}
          </div>
          <p className={styles.footnote}>{t.localAuthority}</p>
        </section>
      </div>
    </>
  );
}
