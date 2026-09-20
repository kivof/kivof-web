"use client";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/feedback/Badge/Badge";
import { usePreferences } from "@/features/preferences/Preferences";
import { api } from "@/lib/api/client";
import { Fields } from "./Fields";
import styles from "./LearningStyles.module.css";

type Job = {
  id: string;
  status: string;
  output?: Record<string, unknown>;
  data_origin: string;
  motor_authority: false;
  verified_physical_outcome: false;
  request?: Record<string, unknown>;
};
const active = new Set(["queued", "running", "cancelling"]);
const statuses = new Set([
  ...active,
  "completed",
  "failed",
  "cancelled",
  "unavailable",
]);
export function trainingJob(value: unknown): Job | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const job = value as Record<string, unknown>;
  if (
    typeof job.id !== "string" ||
    !/^[a-zA-Z0-9_-]{1,128}$/.test(job.id) ||
    !statuses.has(String(job.status)) ||
    job.motor_authority !== false ||
    job.verified_physical_outcome !== false ||
    job.data_origin !== "synthetic"
  )
    return null;
  if (job.output != null) {
    if (typeof job.output !== "object" || Array.isArray(job.output))
      return null;
    const output = job.output as Record<string, unknown>;
    if (
      output.motor_authority !== false ||
      output.verified_physical_outcome !== false ||
      output.data_origin !== "synthetic"
    )
      return null;
  }
  return job as Job;
}
export function TrainingPanel() {
  const { t } = usePreferences();
  const [steps, setSteps] = useState(4);
  const [seed, setSeed] = useState(42);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const pending = jobs
    .filter((job) => active.has(job.status))
    .map((job) => job.id)
    .join(",");
  useEffect(() => {
    const controller = new AbortController();
    void api<{ items: unknown[] }>(
      "learning/training",
      undefined,
      controller.signal,
    )
      .then((result) =>
        setJobs(
          (Array.isArray(result.items) ? result.items : [])
            .map(trainingJob)
            .filter((job): job is Job => job !== null)
            .slice(0, 20),
        ),
      )
      .catch((e) => {
        if (!controller.signal.aborted)
          setError(e instanceof Error ? e.message : "request_failed");
      });
    return () => controller.abort();
  }, []);
  useEffect(() => {
    if (!pending) return;
    const controller = new AbortController();
    let polling = false;
    const timer = setInterval(async () => {
      if (polling) return;
      polling = true;
      try {
        const updated = await Promise.all(
          pending
            .split(",")
            .slice(0, 8)
            .map(async (id) =>
              trainingJob(
                await api(
                  `learning/training/${id}`,
                  undefined,
                  controller.signal,
                ),
              ),
            ),
        );
        if (!controller.signal.aborted)
          setJobs((previous) =>
            previous.map(
              (job) => updated.find((item) => item?.id === job.id) ?? job,
            ),
          );
      } catch (e) {
        if (!controller.signal.aborted)
          setError(e instanceof Error ? e.message : "request_failed");
      } finally {
        polling = false;
      }
    }, 2000);
    return () => {
      clearInterval(timer);
      controller.abort();
    };
  }, [pending]);
  async function start(event: React.FormEvent) {
    event.preventDefault();
    if (
      !Number.isInteger(steps) ||
      steps < 1 ||
      steps > 20 ||
      !Number.isInteger(seed) ||
      seed < 0 ||
      seed > 4294967295
    )
      return;
    setBusy(true);
    setError("");
    try {
      const job = trainingJob(
        await api("learning/training", {
          algorithm: "smolvla-adapter",
          dataset: "synthetic-harness-v1",
          steps,
          seed,
        }),
      );
      if (!job) throw new Error("invalid_response");
      setJobs((previous) =>
        [job, ...previous.filter((item) => item.id !== job.id)].slice(0, 20),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "request_failed");
    } finally {
      setBusy(false);
    }
  }
  async function cancel(id: string) {
    try {
      const job = trainingJob(
        await api(`learning/training/${id}`, undefined, undefined, "DELETE"),
      );
      if (job)
        setJobs((previous) =>
          previous.map((item) => (item.id === id ? job : item)),
        );
    } catch (e) {
      setError(e instanceof Error ? e.message : "request_failed");
    }
  }
  return (
    <section className={styles.training}>
      <p className={styles.intro}>{t.trainingBody}</p>
      <form className={styles.form} onSubmit={start}>
        <label>
          {t.dataset}
          <select value="synthetic-harness-v1" disabled>
            <option value="synthetic-harness-v1">synthetic-harness-v1</option>
          </select>
          <small>{t.syntheticTraining}</small>
        </label>
        <div className={styles.row}>
          <label>
            {t.trainingSteps}
            <input
              type="number"
              required
              min={1}
              max={20}
              value={steps}
              onChange={(e) => setSteps(Number(e.target.value))}
            />
          </label>
          <label>
            {t.seed}
            <input
              type="number"
              required
              min={0}
              max={4294967295}
              value={seed}
              onChange={(e) => setSeed(Number(e.target.value))}
            />
          </label>
        </div>
        <button
          className={styles.submit}
          type="submit"
          disabled={busy || Boolean(pending)}
        >
          {busy ? t.running : t.startTraining}
        </button>
      </form>
      {error && (
        <p className={styles.error} role="alert">
          {error === "provider_unavailable" ||
          error === "model_unavailable_or_output_rejected"
            ? t.trainingUnavailable
            : t.error}
        </p>
      )}
      <h2 className={styles.historyTitle}>{t.trainingJobs}</h2>
      {!jobs.length && <p className={styles.intro}>{t.noData}</p>}
      {jobs.map((job) => {
        const output = job.output ?? {};
        const metrics =
          output.metrics && typeof output.metrics === "object"
            ? (output.metrics as Record<string, unknown>)
            : {};
        const loss = Array.isArray(metrics.loss)
          ? metrics.loss
              .filter(
                (x): x is number => typeof x === "number" && Number.isFinite(x),
              )
              .slice(0, 20)
          : [];
        const checkpoint =
          output.checkpoint && typeof output.checkpoint === "object"
            ? (output.checkpoint as Record<string, unknown>)
            : {};
        const maximum = Math.max(...loss, 0.000001);
        const minimum = Math.min(...loss, 0);
        return (
          <article className={styles.trainingJob} key={job.id}>
            <header>
              <strong>SmolVLA · {t.training}</strong>
              <Badge
                tone={
                  job.status === "completed"
                    ? "good"
                    : job.status === "failed" || job.status === "unavailable"
                      ? "warning"
                      : "neutral"
                }
              >
                {t[job.status] ?? job.status}
              </Badge>
              {active.has(job.status) && (
                <button
                  type="button"
                  disabled={job.status === "cancelling"}
                  onClick={() => void cancel(job.id)}
                >
                  {t.cancelTraining}
                </button>
              )}
            </header>
            <p className={styles.jobOrigin}>
              {t.syntheticTraining} · {t.noMotor}
            </p>
            {loss.length > 0 && (
              <figure className={styles.loss}>
                <figcaption>
                  {t.loss} · {loss.length} {t.trainingSteps}
                </figcaption>
                <svg viewBox="0 0 640 170" role="img" aria-label={t.loss}>
                  <path d="M20 15v135h600" fill="none" stroke="var(--line)" />
                  <polyline
                    points={loss
                      .map(
                        (value, i) =>
                          `${20 + (i * 600) / Math.max(1, loss.length - 1)},${145 - ((value - minimum) / Math.max(maximum - minimum, 0.000001)) * 125}`,
                      )
                      .join(" ")}
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="2"
                  />
                </svg>
                <div>
                  <span>{loss[0]?.toPrecision(5)}</span>
                  <span>{loss.at(-1)?.toPrecision(5)}</span>
                </div>
              </figure>
            )}
            <Fields
              values={{
                [t.jobId]: job.id,
                [t.model]: output.model ?? "—",
                [t.modelRevision]: output.model_revision ?? "—",
                [t.trainingSteps]: output.steps_completed ?? 0,
                [t.checkpoint]: checkpoint.sha256 ?? "—",
                [t.parametersChanged]:
                  typeof checkpoint.parameters_changed === "boolean"
                    ? checkpoint.parameters_changed
                      ? t.yes
                      : t.no
                    : "—",
                [t.source]: job.data_origin,
              }}
            />
          </article>
        );
      })}
    </section>
  );
}
