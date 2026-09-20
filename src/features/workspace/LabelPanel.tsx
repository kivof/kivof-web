// biome-ignore-all lint/suspicious/noArrayIndexKey: Immutable result snapshots preserve ordered items without source row IDs.
"use client";
import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/ui/data-display/Icon/Icon";
import { Badge } from "@/components/ui/feedback/Badge/Badge";
import { usePreferences } from "@/features/preferences/Preferences";
import { api } from "@/lib/api/client";
import type { Label, Run } from "@/lib/models/domain";
import styles from "./PanelsStyles.module.css";
export function LabelPanel({
  runs,
  labels,
  refresh,
}: {
  runs: Run[];
  labels: Label[];
  refresh: () => Promise<void>;
}) {
  const { t } = usePreferences();
  const [runId, setRun] = useState("");
  const [label, setLabel] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api("labels", { run_id: runId, label, note });
      setLabel("");
      setNote("");
      setMessage(t.saved);
      await refresh();
    } catch {
      setMessage(t.error);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <p className={styles.intro}>{t.labelBody}</p>
      <form className={styles.form} onSubmit={submit}>
        <label>
          {t.selectRun}
          <select
            required
            value={runId}
            onChange={(e) => setRun(e.target.value)}
          >
            <option value="">{t.selectRun}</option>
            {runs.map((run) => (
              <option key={run.id} value={run.id}>
                {run.id} · {t[run.scenario]}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t.label}
          <input
            required
            maxLength={120}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />
        </label>
        <label>
          {t.note}
          <textarea
            required
            maxLength={2000}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </label>
        <button type="submit" disabled={busy || !runs.length}>
          {t.save}
          <Icon name="check" size={17} />
        </button>
        <output>{message}</output>
      </form>
      <section className={styles.card}>
        {labels.length ? (
          labels.map((item) => (
            <div className={styles.annotation} key={item.id}>
              <Badge>{item.label}</Badge>
              <p>{item.note}</p>
              <Link href={`/workspace/runs/${item.run_id}`}>{item.run_id}</Link>
            </div>
          ))
        ) : (
          <p className={styles.empty}>{t.emptyLabels}</p>
        )}
      </section>
    </>
  );
}
