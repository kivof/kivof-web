"use client";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/feedback/Badge/Badge";
import { usePreferences } from "@/features/preferences/Preferences";
import { api } from "@/lib/api/client";
import type { Run } from "@/lib/models/domain";
import { Fields } from "./Fields";
import styles from "./LearningStyles.module.css";
import { liveLabels } from "./live/liveLabels";
import { prepareNativeTask } from "./live/prepareNativeTask";
import { RawRecord } from "./RawRecord";
import { recordNumber, recordObject } from "./recordPresentation";
import { TrainingActivity } from "./TrainingActivity";

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
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
export function trainingSource(run: Run) {
  const rollout = recordObject(run.evidence.rollout);
  return (
    run.source === "isaac-sim" &&
    run.data_origin === "simulated" &&
    run.physical_execution === false &&
    run.evidence.native_scene_passed === true &&
    rollout.source === "isaac-sim" &&
    typeof rollout.id === "string" &&
    uuid.test(rollout.id) &&
    typeof rollout.sha256 === "string" &&
    /^[a-f0-9]{64}$/i.test(rollout.sha256)
  );
}
export function trainingJob(value: unknown): Job | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const job = value as Record<string, unknown>;
  if (
    typeof job.id !== "string" ||
    !/^[a-zA-Z0-9_-]{1,128}$/.test(job.id) ||
    !statuses.has(String(job.status)) ||
    job.motor_authority !== false ||
    job.verified_physical_outcome !== false ||
    !["synthetic", "simulated"].includes(String(job.data_origin))
  )
    return null;
  const request = recordObject(job.request);
  const native = request.algorithm === "franka-transition-head";
  if (
    native &&
    (request.dataset !== "isaac-franka-rollout-v1" ||
      typeof request.source_run_id !== "string" ||
      !/^[a-f0-9]{64}$/i.test(request.source_run_id))
  )
    return null;
  if (job.data_origin !== (native ? "simulated" : "synthetic")) return null;
  if (
    !native &&
    request.algorithm != null &&
    request.algorithm !== "smolvla-adapter"
  )
    return null;
  if (job.output != null) {
    if (typeof job.output !== "object" || Array.isArray(job.output))
      return null;
    const output = job.output as Record<string, unknown>;
    if (
      output.motor_authority !== false ||
      output.verified_physical_outcome !== false ||
      output.data_origin !== job.data_origin ||
      (native && output.prediction_only !== true)
    )
      return null;
  }
  return job as Job;
}
export function TrainingPanel({ runs = [] }: { runs?: Run[] }) {
  const { t, locale } = usePreferences();
  const [recipe, setRecipe] = useState("franka-transition-head");
  const [sourceRunId, setSourceRunId] = useState("");
  const native = recipe === "franka-transition-head";
  const sourceRuns = runs
    .filter(trainingSource)
    .sort(
      (left, right) =>
        Date.parse(right.started_at) - Date.parse(left.started_at),
    );
  const selectedSource = sourceRunId || sourceRuns[0]?.id || "";
  const [steps, setSteps] = useState(4);
  const [seed, setSeed] = useState(42);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const monitored = jobs.find(
    (job) =>
      job.request?.algorithm === recipe &&
      (!native || job.request.source_run_id === selectedSource),
  );
  const pending = jobs
    .filter((job) => active.has(job.status))
    .map((job) => job.id)
    .join(",");
  useEffect(() => {
    const controller = new AbortController();
    const refresh = () =>
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
    refresh();
    window.addEventListener("kivof:workspace-changed", refresh);
    return () => {
      controller.abort();
      window.removeEventListener("kivof:workspace-changed", refresh);
    };
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
    if (native && !sourceRuns.some((run) => run.id === selectedSource)) return;
    setBusy(true);
    setError("");
    try {
      await prepareNativeTask();
      const job = trainingJob(
        await api("learning/training", {
          algorithm: recipe,
          dataset: native ? "isaac-franka-rollout-v1" : "synthetic-harness-v1",
          steps,
          seed,
          ...(native ? { source_run_id: selectedSource } : {}),
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
      <p className={styles.intro}>
        {native ? t.nativeTrainingBody : t.trainingBody}
      </p>
      <TrainingActivity
        native={native}
        source={sourceRuns.find((run) => run.id === selectedSource)}
        job={monitored}
        locale={locale}
        status={monitored ? t[monitored.status] : undefined}
        lossLabel={t.loss}
      />
      <form className={styles.form} onSubmit={start}>
        <p className={styles.intro}>{liveLabels(locale).handoff}</p>
        <label>
          {t.trainingRecipe}
          <select
            value={recipe}
            onChange={(event) => setRecipe(event.target.value)}
            disabled={busy || Boolean(pending)}
          >
            <option value="smolvla-adapter">{t.smolTrainingRecipe}</option>
            <option value="franka-transition-head">
              {t.nativeTrainingRecipe}
            </option>
          </select>
        </label>
        <label>
          {t.dataset}
          <select
            value={native ? "isaac-franka-rollout-v1" : "synthetic-harness-v1"}
            disabled
          >
            <option value="synthetic-harness-v1">synthetic-harness-v1</option>
            <option value="isaac-franka-rollout-v1">
              isaac-franka-rollout-v1
            </option>
          </select>
          <small>{native ? t.nativeTrainingOrigin : t.syntheticTraining}</small>
        </label>
        {native && (
          <label>
            {t.sourceRun}
            <select
              value={selectedSource}
              required
              onChange={(event) => setSourceRunId(event.target.value)}
            >
              <option value="">{t.selectRun}</option>
              {sourceRuns.map((run) => (
                <option key={run.id} value={run.id}>
                  {new Date(run.started_at).toLocaleString(locale)} ·{" "}
                  {run.id.slice(0, 8)}
                </option>
              ))}
            </select>
            {!sourceRuns.length && <small>{t.noTrainingRollouts}</small>}
          </label>
        )}
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
          disabled={
            busy ||
            Boolean(pending) ||
            (native && !sourceRuns.some((run) => run.id === selectedSource))
          }
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
        const isNative = job.request?.algorithm === "franka-transition-head";
        const provenance = recordObject(output.provenance);
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
        const validationValues = metrics.validation_loss ?? metrics.val_loss;
        const validationLoss = (
          Array.isArray(validationValues)
            ? validationValues
            : typeof validationValues === "number"
              ? [validationValues]
              : []
        )
          .filter(
            (value): value is number =>
              typeof value === "number" && Number.isFinite(value),
          )
          .slice(0, 20);
        const maximum = Math.max(...loss, ...validationLoss, 0.000001);
        const minimum = Math.min(...loss, ...validationLoss, 0);
        return (
          <article className={styles.trainingJob} key={job.id}>
            <header>
              <strong>
                {isNative ? t.nativeTrainingRecipe : t.smolTrainingRecipe}
              </strong>
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
              {isNative ? t.nativeTrainingOrigin : t.syntheticTraining} ·{" "}
              {t.noMotor}
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
                  {!!validationLoss.length && (
                    <polyline
                      points={validationLoss
                        .map(
                          (value, i) =>
                            `${20 + (i * 600) / Math.max(1, validationLoss.length - 1)},${145 - ((value - minimum) / Math.max(maximum - minimum, 0.000001)) * 125}`,
                        )
                        .join(" ")}
                      fill="none"
                      stroke="var(--warning)"
                      strokeWidth="2"
                      strokeDasharray="5 4"
                    />
                  )}
                </svg>
                <div>
                  <span>{recordNumber(loss[0], locale)}</span>
                  <span>{recordNumber(loss.at(-1), locale)}</span>
                </div>
                {!!validationLoss.length && (
                  <figcaption>
                    {t.validation_loss} ·{" "}
                    {recordNumber(validationLoss.at(-1), locale)}
                  </figcaption>
                )}
              </figure>
            )}
            <Fields
              values={{
                [t.jobId]: job.id,
                [t.model]: output.model ?? "—",
                [t.modelRevision]: output.model_revision ?? "—",
                [t.trainingSteps]: output.steps_completed ?? 0,
                trainable_parameters: output.trainable_parameters ?? "—",
                [t.checkpoint]: checkpoint.sha256 ?? "—",
                [t.parametersChanged]:
                  typeof checkpoint.parameters_changed === "boolean"
                    ? checkpoint.parameters_changed
                      ? t.yes
                      : t.no
                    : "—",
                [t.source]: job.data_origin,
                ...(isNative
                  ? {
                      [t.sourceRun]: job.request?.source_run_id,
                      training_scope: output.training_scope,
                      rollout_id: provenance.rollout_id,
                      rollout_sha256: provenance.rollout_sha256,
                      robot_model: provenance.robot_model,
                      joint_dimensions: provenance.joint_dimensions,
                      robot_count: provenance.robot_count,
                      samples: provenance.sample_count,
                      transitions: provenance.transition_count,
                      training_transitions: provenance.training_transitions,
                      validation_transitions: provenance.validation_transitions,
                      validation_loss: validationLoss.at(-1),
                    }
                  : {}),
              }}
            />
            <RawRecord value={job} />
          </article>
        );
      })}
    </section>
  );
}
