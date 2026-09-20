"use client";
import { useState } from "react";
import { usePreferences } from "@/features/preferences/Preferences";
import styles from "./RecordEvidenceStyles.module.css";

export function RawRecord({
  value,
  label,
}: {
  value: unknown;
  label?: string;
}) {
  const { t } = usePreferences();
  const [open, setOpen] = useState(false);
  return (
    <details
      className={styles.raw}
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary>{label ?? t.sourceRecord}</summary>
      {open && <pre>{JSON.stringify(value, null, 2)}</pre>}
    </details>
  );
}
