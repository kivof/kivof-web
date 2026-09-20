import Link from "next/link";
import { RecordedScene } from "@/components/ui/data-display/RecordedScene/RecordedScene";
import type { Locale } from "@/lib/i18n";
import type { Run } from "@/lib/models/domain";
import styles from "./LearningStyles.module.css";
import { recordNumber, recordObject } from "./recordPresentation";
import { trainingLabels } from "./trainingLabels";

type JobProgress = {
  status: string;
  request?: Record<string, unknown>;
  output?: Record<string, unknown>;
};

export function trainingProgress(job?: JobProgress) {
  if (!job) return null;
  const output = recordObject(job.output);
  const requested = job.request?.steps;
  const completed = output.steps_completed;
  const steps =
    Number.isSafeInteger(requested) &&
    Number(requested) > 0 &&
    Number(requested) <= 20
      ? Number(requested)
      : null;
  const done =
    Number.isSafeInteger(completed) &&
    Number(completed) >= 0 &&
    steps !== null &&
    Number(completed) <= steps
      ? Number(completed)
      : null;
  const loss = recordObject(output.metrics).loss;
  const latestLoss = Array.isArray(loss) ? loss.at(-1) : undefined;
  return {
    steps,
    done,
    loss:
      typeof latestLoss === "number" && Number.isFinite(latestLoss)
        ? latestLoss
        : null,
  };
}

export function TrainingActivity({
  native,
  source,
  job,
  locale,
  status,
  lossLabel,
}: {
  native: boolean;
  source?: Run;
  job?: JobProgress;
  locale: Locale;
  status?: string;
  lossLabel: string;
}) {
  const labels = trainingLabels(locale);
  const progress = trainingProgress(job);
  const waiting =
    job && ["queued", "running", "cancelling"].includes(job.status);
  const number = new Intl.NumberFormat(locale);
  return (
    <section className={styles.activity} aria-label={labels.monitor}>
      <div className={styles.activitySummary}>
        <h2>{labels.monitor}</h2>
        <p>{native ? labels.native : labels.synthetic}</p>
        <output aria-live="polite" data-training-status={job?.status ?? "idle"}>
          <strong>
            {job ? status : native && !source ? labels.noSource : labels.ready}
          </strong>
          {progress && (
            <>
              <span>
                {labels.progress}:{" "}
                {progress.done === null ? "—" : number.format(progress.done)} /{" "}
                {progress.steps === null ? "—" : number.format(progress.steps)}
              </span>
              {(progress.done !== null || waiting) && (
                <progress
                  aria-label={labels.progress}
                  max={progress.steps ?? 1}
                  value={progress.done ?? undefined}
                />
              )}
              {progress.done === null && waiting && (
                <span>{labels.waiting}</span>
              )}
              <span>
                {lossLabel}: {recordNumber(progress.loss, locale)}
              </span>
            </>
          )}
        </output>
        <Link href="/workspace/simulation">{labels.simulation} →</Link>
        {native && source && (
          <Link href={`/workspace/runs/${source.id}`}>
            {labels.inspection} →
          </Link>
        )}
      </div>
      {native && source && <RecordedScene run={source} title={labels.source} />}
    </section>
  );
}
