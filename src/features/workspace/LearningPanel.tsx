"use client";
import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/components/ui/data-display/Icon/Icon";
import { Badge } from "@/components/ui/feedback/Badge/Badge";
import { usePreferences } from "@/features/preferences/Preferences";
import { api } from "@/lib/api/client";
import { Fields } from "./Fields";
import styles from "./LearningStyles.module.css";
import { actionSequence, imageData, vector } from "./learningInput";

type ImageInput = { name: string; data: string };
export function LearningPanel() {
  const { t } = usePreferences();
  const [mode, setMode] = useState("policy");
  const [provider, setProvider] = useState("lerobot");
  const [instruction, setInstruction] = useState("");
  const [embodiment, setEmbodiment] = useState(
    "smolvla-so100-unqualified-fixture",
  );
  const [state, setState] = useState("");
  const [images, setImages] = useState<ImageInput[]>([]);
  const [frame, setFrame] = useState("model_native");
  const [units, setUnits] = useState("model-native");
  const [calibration, setCalibration] = useState("");
  const [age, setAge] = useState("");
  const [dimension, setDimension] = useState(6);
  const [seed, setSeed] = useState(42);
  const [domain, setDomain] = useState("harness_forge");
  const [actions, setActions] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<Record<string, unknown>[]>([]);
  const refresh = useCallback(async () => {
    try {
      const result = await api<{ items: Record<string, unknown>[] }>(
        "learning",
      );
      if (Array.isArray(result.items)) setHistory(result.items);
    } catch {
      setError("request_failed");
    }
  }, []);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  async function upload(files: FileList | null) {
    if (!files) return;
    if (files.length > 3) {
      setError("image_too_large");
      return;
    }
    try {
      const result = await Promise.all(
        Array.from(files).map(async (file, index) => ({
          name: ["front", "wrist", "side"][index],
          data: await imageData(file),
        })),
      );
      setImages(result);
      setError("");
    } catch {
      setError("image_too_large");
    }
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const body =
        mode === "policy"
          ? {
              provider,
              instruction,
              embodiment,
              action_dim: dimension,
              observation: {
                state: vector(state),
                images: Object.fromEntries(
                  images.map((image) => [image.name, image.data]),
                ),
                age_ms: Number(age),
                frame,
                units,
                calibration_version: calibration,
              },
            }
          : {
              prompt: instruction,
              seed,
              domain,
              ...(images[0] ? { observation: images[0].data } : {}),
              ...(actions.trim() ? { actions: actionSequence(actions) } : {}),
            };
      await api(
        `learning/${mode === "policy" ? "policy" : "world-model"}`,
        body,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "request_failed");
    } finally {
      setBusy(false);
      await refresh();
    }
  }
  return (
    <>
      <p className={styles.intro}>{t.learningBody}</p>
      <div className={styles.notice}>
        <Icon name="shield" />
        <div>
          <strong>{t.noMotor}</strong>
          <p>{t.recordedInput}</p>
        </div>
      </div>
      <form className={styles.form} onSubmit={submit}>
        <div className={styles.tabs}>
          <button
            type="button"
            data-active={mode === "policy"}
            onClick={() => setMode("policy")}
          >
            {t.policy}
          </button>
          <button
            type="button"
            data-active={mode === "world"}
            onClick={() => setMode("world")}
          >
            {t.world}
          </button>
        </div>
        {mode === "policy" && (
          <div className={styles.row}>
            <label>
              {t.provider}
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
              >
                <option value="lerobot">LeRobot · SmolVLA</option>
                <option value="groot">NVIDIA GR00T</option>
                <option value="pi">OpenPI · π</option>
              </select>
            </label>
            <label>
              {t.embodiment}
              <input
                required
                value={embodiment}
                onChange={(e) => setEmbodiment(e.target.value)}
                maxLength={120}
              />
            </label>
          </div>
        )}
        <label>
          {t.instruction}
          <textarea
            required
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            maxLength={mode === "policy" ? 2048 : 4000}
          />
        </label>
        {mode === "policy" && (
          <>
            <label>
              {t.state}
              <input
                required
                placeholder="0, 0, 0, 0, 0, 0"
                value={state}
                onChange={(e) => setState(e.target.value)}
              />
            </label>
            <div className={styles.row}>
              <label>
                {t.actions}
                <input
                  aria-label={t.actionDimensions}
                  type="number"
                  min={1}
                  max={32}
                  value={dimension}
                  onChange={(e) => setDimension(Number(e.target.value))}
                />
              </label>
              <label>
                {t.age}
                <input
                  required
                  type="number"
                  min={0}
                  max={200}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </label>
            </div>
            <div className={styles.row}>
              <label>
                {t.frame}
                <select
                  value={frame}
                  onChange={(e) => setFrame(e.target.value)}
                >
                  <option>model_native</option>
                  <option>fixture_base</option>
                </select>
              </label>
              <label>
                {t.units}
                <select
                  value={units}
                  onChange={(e) => setUnits(e.target.value)}
                >
                  <option>model-native</option>
                  <option>m-rad</option>
                </select>
              </label>
            </div>
            <label>
              {t.calibration}
              <input
                required
                maxLength={128}
                value={calibration}
                onChange={(e) => setCalibration(e.target.value)}
              />
            </label>
          </>
        )}
        <label>
          {t.cameraImages}
          <input
            type="file"
            accept="image/png,image/jpeg"
            multiple={mode === "policy"}
            required={mode === "policy" && !images.length}
            onChange={(e) => void upload(e.target.files)}
          />
          <small>{t.imageLimit}</small>
        </label>
        {images.map((image, index) => (
          <div key={image.data.slice(-32)} className={styles.imageRow}>
            {/* biome-ignore lint/performance/noImgElement: User-uploaded bounded local observation. */}
            <img src={image.data} alt={t.cameraImages} />
            <label>
              {t.name}
              <input
                value={image.name}
                maxLength={64}
                required
                onChange={(e) =>
                  setImages((previous) =>
                    previous.map((item, i) =>
                      i === index ? { ...item, name: e.target.value } : item,
                    ),
                  )
                }
              />
            </label>
          </div>
        ))}
        {mode === "world" && (
          <>
            <div className={styles.row}>
              <label>
                {t.seed}
                <input
                  type="number"
                  min={0}
                  max={4294967295}
                  value={seed}
                  onChange={(e) => setSeed(Number(e.target.value))}
                />
              </label>
              <label>
                {t.domain}
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                >
                  <option>harness_forge</option>
                  <option>bridge_orig_lerobot</option>
                  <option>camera_pose</option>
                </select>
              </label>
            </div>
            <label>
              {t.actions}
              <textarea
                value={actions}
                onChange={(e) => setActions(e.target.value)}
                maxLength={10000}
                placeholder="[[0, 0, 0, 0, 0, 0]]"
              />
            </label>
          </>
        )}
        <button
          className={styles.submit}
          type="submit"
          disabled={busy || (mode === "policy" && !images.length)}
        >
          <Icon name="cube" size={17} />
          {busy ? t.running : t.predict}
        </button>
        {error && (
          <p role="alert" className={styles.error}>
            {error === "image_too_large"
              ? t.imageLimit
              : error === "model_unavailable_or_output_rejected"
                ? t.modelUnavailable
                : t.error}
          </p>
        )}
      </form>
      <h2 className={styles.historyTitle}>{t.learningHistory}</h2>
      {history.length ? (
        history.map((record) => (
          <details className={styles.record} key={String(record.id)}>
            <summary>
              <span>{record.kind === "policy" ? t.policy : t.world}</span>
              <Badge
                tone={record.status === "unavailable" ? "warning" : "neutral"}
              >
                {t[String(record.status)] ?? String(record.status)}
              </Badge>
            </summary>
            <Fields values={record} />
          </details>
        ))
      ) : (
        <p className={styles.intro}>{t.noData}</p>
      )}
    </>
  );
}
