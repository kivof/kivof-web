"use client";
import { useCallback, useEffect, useState } from "react";
import { CheeseLine } from "@/components/ui/data-display/CheeseLine/CheeseLine";
import { Icon } from "@/components/ui/data-display/Icon/Icon";
import { usePreferences } from "@/features/preferences/Preferences";
import { api } from "@/lib/api/client";
import {
  factoryScenarios,
  parseFactoryList,
  parseFactoryRecord,
  parseObservationInput,
  type FactoryRecord as Record,
} from "@/lib/models/factory";
import { factoryCopy } from "./copy";
import { FactoryLabelReview } from "./FactoryLabelReview";
import { FactoryRecord } from "./FactoryRecord";
import styles from "./FactoryStyles.module.css";

export function FactoryPanel() {
  const { t: shared, locale } = usePreferences();
  const t = { ...shared, ...factoryCopy[locale] };
  const [scenario, setScenario] = useState("nominal");
  const [scenarios, setScenarios] = useState<string[]>([...factoryScenarios]);
  const [records, setRecords] = useState<Record[]>([]);
  const [selected, setSelected] = useState("");
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [observation, setObservation] = useState("");
  const [importError, setImportError] = useState(false);
  const current =
    records.find((record) => record.id === selected) ?? records[0];
  const refresh = useCallback(async () => {
    try {
      const result = parseFactoryList(await api("factory"));
      setRecords(result.items);
      setScenarios(result.scenarios);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoaded(true);
    }
  }, []);
  useEffect(() => {
    void refresh();
    const changed = () => void refresh();
    window.addEventListener("kivof:workspace-changed", changed);
    return () => window.removeEventListener("kivof:workspace-changed", changed);
  }, [refresh]);
  async function execute(importing = false) {
    if (busy) return;
    setBusy(true);
    setError(false);
    setImportError(false);
    try {
      const body = importing
        ? parseObservationInput(observation)
        : { scenario };
      const result = parseFactoryRecord(
        await api(importing ? "factory/analyze" : "factory/simulate", body),
      );
      setRecords((previous) => [
        result,
        ...previous.filter((record) => record.id !== result.id),
      ]);
      setSelected(result.id);
      window.dispatchEvent(new Event("kivof:workspace-changed"));
    } catch {
      if (importing) setImportError(true);
      else setError(true);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className={styles.factory}>
      <p className={styles.intro}>{t.intro}</p>
      <div className={styles.toolbar}>
        <label>
          {t.scenario}
          <select
            value={scenario}
            disabled={busy}
            onChange={(event) => setScenario(event.target.value)}
          >
            {scenarios.map((s) => (
              <option key={s} value={s}>
                {t[s] ?? s}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          disabled={busy}
          onClick={() => void execute()}
          title={t.run}
        >
          <Icon name="cube" size={18} />
          {busy ? t.running : t.run}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void refresh()}
          title={t.refresh}
          aria-label={t.refresh}
        >
          <Icon name="activity" size={18} />
        </button>
      </div>
      <p className={styles.notice}>{t.simulationNote}</p>
      {error && (
        <p role="alert" className={styles.error}>
          {t.error}{" "}
          <button type="button" onClick={() => void refresh()}>
            {t.retry}
          </button>
        </p>
      )}
      {!loaded ? (
        <p>{t.loading}</p>
      ) : current ? (
        <>
          <label className={styles.history}>
            {t.history}
            <select
              value={current.id}
              onChange={(event) => setSelected(event.target.value)}
            >
              {records.map((record) => (
                <option key={record.id} value={record.id}>
                  {t[record.scenario ?? ""] ?? t.analyze} ·{" "}
                  {t[record.status] ?? record.status} ·{" "}
                  {new Date(record.created_at).toLocaleString(locale)}
                </option>
              ))}
            </select>
          </label>
          <FactoryRecord record={current} copy={t} locale={locale} />
          <FactoryLabelReview
            key={current.id}
            record={current}
            copy={t}
            locale={locale}
            onReviewed={(updated) =>
              setRecords((previous) =>
                previous.map((record) =>
                  record.id === updated.id ? updated : record,
                ),
              )
            }
          />
        </>
      ) : (
        <div className={styles.empty}>
          <p>{t.noRecords}</p>
          <CheeseLine copy={t} />
        </div>
      )}
      <details className={styles.import}>
        <summary>{t.observationImport}</summary>
        <p>{t.observationBody}</p>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void execute(true);
          }}
        >
          <textarea
            aria-label={t.observationImport}
            value={observation}
            onChange={(event) => setObservation(event.target.value)}
            maxLength={500000}
            rows={10}
            spellCheck={false}
            required
          />
          <button type="submit" disabled={busy || !observation.trim()}>
            {busy ? t.running : t.analyze}
          </button>
          {importError && (
            <p role="alert" className={styles.error}>
              {t.observationError}
            </p>
          )}
        </form>
      </details>
    </div>
  );
}
