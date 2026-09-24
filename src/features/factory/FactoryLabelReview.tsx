"use client";
import { useState } from "react";
import { api } from "@/lib/api/client";
import type { Locale } from "@/lib/i18n";
import { type FactoryRecord, parseFactoryRecord } from "@/lib/models/factory";
import {
  factoryLabelClasses,
  factoryReviewInput,
} from "@/lib/models/factoryReview";
import styles from "./FactoryStyles.module.css";

export function FactoryLabelReview({
  record,
  copy: t,
  locale,
  onReviewed,
}: {
  record: FactoryRecord;
  copy: Record<string, string>;
  locale: Locale;
  onReviewed: (record: FactoryRecord) => void;
}) {
  const [label, setLabel] = useState(
    record.review?.label ?? record.labels[0]?.label ?? "hard_cheese",
  );
  const [note, setNote] = useState("");
  const [revision, setRevision] = useState(record.revision);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  async function submit() {
    if (busy) return;
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      const input = factoryReviewInput(label, note, revision);
      const updated = parseFactoryRecord(
        await api(`factory/${encodeURIComponent(record.id)}/labels`, input),
      );
      onReviewed(updated);
      setRevision(updated.revision);
      setNote("");
      setSaved(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : "request_failed");
    } finally {
      setBusy(false);
    }
  }
  async function reload() {
    setBusy(true);
    setSaved(false);
    try {
      const updated = parseFactoryRecord(
        await api(`factory/${encodeURIComponent(record.id)}`),
      );
      onReviewed(updated);
      setRevision(updated.revision);
      setError("");
    } catch {
      setError("request_failed");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className={styles.card} aria-label={t.humanReview}>
      <h3>{t.humanReview}</h3>
      <p>{t.reviewBoundary}</p>
      {record.review && (
        <div className={styles.reviewSummary}>
          <strong>{t[record.review.label] ?? record.review.label}</strong>
          <p>{record.review.note}</p>
          <p>
            {t.reviewedBy}: {record.review.reviewer.id} ·{" "}
            {new Date(record.review.reviewed_at).toLocaleString(locale)}
          </p>
          <p>
            {t.sourceGroup}: <code>{record.review.source_group}</code> ·{" "}
            {t[record.review.data_origin] ?? record.review.data_origin}
          </p>
          <p>{t.trainingBlocked}</p>
        </div>
      )}
      <form
        className={styles.reviewForm}
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <label>
          {t.reviewedClass}
          <select
            value={label}
            disabled={busy}
            onChange={(event) => {
              setLabel(event.target.value);
              setSaved(false);
            }}
          >
            {factoryLabelClasses.map((value) => (
              <option key={value} value={value}>
                {t[value] ?? value}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t.reviewNote}
          <textarea
            required
            rows={3}
            maxLength={2000}
            value={note}
            disabled={busy}
            onChange={(event) => {
              setNote(event.target.value);
              setSaved(false);
            }}
          />
        </label>
        <button
          type="submit"
          disabled={busy || !note.trim() || revision > 50}
          title={t.saveReview}
        >
          {busy ? t.running : t.saveReview}
        </button>
        {saved && <output>{t.reviewSaved}</output>}
        {error && (
          <div role="alert" className={styles.error}>
            <p>
              {error === "revision_conflict"
                ? t.reviewConflict
                : error === "label_review_capacity_exceeded"
                  ? t.reviewCapacity
                  : t.reviewError}
            </p>
            {error === "revision_conflict" && (
              <button
                type="button"
                onClick={() => void reload()}
                disabled={busy}
              >
                {t.reloadReview}
              </button>
            )}
          </div>
        )}
      </form>
      {record.reviews.length > 0 && (
        <details className={styles.reviewHistory}>
          <summary>
            {t.reviewHistory} · {record.reviews.length}
          </summary>
          <ol>
            {record.reviews.map((review) => (
              <li key={review.id}>
                <strong>{t[review.label] ?? review.label}</strong> ·{" "}
                {new Date(review.reviewed_at).toLocaleString(locale)}
                <p>{review.note}</p>
              </li>
            ))}
          </ol>
        </details>
      )}
    </section>
  );
}
