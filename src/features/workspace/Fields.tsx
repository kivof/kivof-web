// biome-ignore-all lint/suspicious/noArrayIndexKey: Immutable result snapshots preserve ordered items without source row IDs.
"use client";
import { Badge } from "@/components/ui/feedback/Badge/Badge";
import { usePreferences } from "@/features/preferences/Preferences";
import type { Run } from "@/lib/models/domain";
import styles from "./PanelsStyles.module.css";
import { RawRecord } from "./RawRecord";
import { fieldValue, translated } from "./recordPresentation";
export function Fields({ values }: { values: Record<string, unknown> }) {
  const { t, locale } = usePreferences();
  return (
    <dl className={styles.fields}>
      {Object.entries(values).map(([key, value]) => (
        <div key={key}>
          <dt>{translated(key, t)}</dt>
          <dd>
            {value != null &&
            typeof value === "object" &&
            key !== "guide_occupancy" ? (
              <RawRecord value={value} label={t.sourceMetadata} />
            ) : (
              fieldValue(key, value, locale, t)
            )}
          </dd>
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
