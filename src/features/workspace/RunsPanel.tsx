// biome-ignore-all lint/suspicious/noArrayIndexKey: Immutable result snapshots preserve ordered items without source row IDs.
"use client";
import Link from "next/link";
import { Icon } from "@/components/ui/data-display/Icon/Icon";
import { Badge } from "@/components/ui/feedback/Badge/Badge";
import { usePreferences } from "@/features/preferences/Preferences";
import type { Run } from "@/lib/models/domain";
import { Fields, RunBadge } from "./Fields";
import styles from "./PanelsStyles.module.css";
import { RawRecord } from "./RawRecord";
import {
  CableEvidence,
  ObservationSummary,
  StepSummary,
  VerificationSummary,
} from "./RecordEvidence";
import { recordNumber, stepLabel } from "./recordPresentation";
export function RunsPanel({ runs, runId }: { runs: Run[]; runId?: string }) {
  const { t, locale } = usePreferences();
  const run = runs.find((item) => item.id === runId);
  if (run)
    return (
      <div className={styles.stack}>
        <Link href="/workspace/runs">← {t.runs}</Link>
        <div className={styles.cardHeader}>
          <h2>{t[run.scenario] ?? run.scenario}</h2>
          <RunBadge run={run} />
        </div>
        <div className={styles.provenance}>
          <Badge>{t[run.data_origin] ?? run.data_origin}</Badge>
          <Badge>{t[run.view_mode] ?? run.view_mode}</Badge>
          <Badge>{t[run.source] ?? run.source}</Badge>
          <code>{run.id}</code>
        </div>
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>{t.verification}</h2>
          </div>
          <VerificationSummary value={run.verification} />
        </section>
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>{t.metrics}</h2>
          </div>
          <Fields values={run.metrics} />
        </section>
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <h2>{t.cableGeometry}</h2>
          </div>
          <CableEvidence evidence={run.evidence} />
        </section>
        {(["steps", "observations"] as const).map((key) => (
          <section key={key} className={styles.card}>
            <div className={styles.cardHeader}>
              <h2>{t[key]}</h2>
            </div>
            {run[key]?.map((item, i) => (
              <details key={JSON.stringify(item) + i} className={styles.detail}>
                <summary>
                  {key === "steps"
                    ? stepLabel(item, t, locale)
                    : `${t.observations} ${recordNumber(Number(item.sequence ?? i) + 1, locale)} · ${recordNumber(item.sensor_time_s, locale, "s")} · ${t[String(item.quality)] ?? t.unknown}`}
                </summary>
                {key === "steps" ? (
                  <>
                    <StepSummary value={item} />
                    <RawRecord value={item} />
                  </>
                ) : (
                  <ObservationSummary value={item} />
                )}
              </details>
            ))}
          </section>
        ))}
        <RawRecord value={run} />
      </div>
    );
  return (
    <section className={styles.card}>
      {!runs.length ? (
        <p className={styles.empty}>{t.noRuns}</p>
      ) : (
        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th>{t.runId}</th>
                <th>{t.scenario}</th>
                <th>{t.status}</th>
                <th>{t.time}</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((item) => (
                <tr key={item.id}>
                  <td>
                    <Link href={`/workspace/runs/${item.id}`}>
                      {item.id.slice(0, 12)} <Icon name="chevron" size={12} />
                    </Link>
                  </td>
                  <td>{t[item.scenario] ?? item.scenario}</td>
                  <td>
                    <RunBadge run={item} />
                  </td>
                  <td>{new Date(item.started_at).toLocaleString(locale)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
