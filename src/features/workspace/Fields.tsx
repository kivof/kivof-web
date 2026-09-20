// biome-ignore-all lint/suspicious/noArrayIndexKey: Immutable result snapshots preserve ordered items without source row IDs.
"use client";
import { Badge } from "@/components/ui/feedback/Badge/Badge";
import { usePreferences } from "@/features/preferences/Preferences";
import { printable, type Run } from "@/lib/models/domain";
import styles from "./PanelsStyles.module.css";
export function Fields({ values }: { values: Record<string, unknown> }) {
  return (
    <dl className={styles.fields}>
      {Object.entries(values).map(([key, value]) => (
        <div key={key}>
          <dt>{key.replaceAll("_", " ")}</dt>
          <dd>{printable(value)}</dd>
        </div>
      ))}
    </dl>
  );
}

export function RunBadge({ run }: { run: Run }) {
  const { t } = usePreferences();
  return (
    <Badge
      tone={
        run.status === "succeeded"
          ? "good"
          : run.status === "failed"
            ? "error"
            : "neutral"
      }
    >
      {t[run.status] ?? run.status}
    </Badge>
  );
}
