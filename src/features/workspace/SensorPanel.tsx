// biome-ignore-all lint/suspicious/noArrayIndexKey: Immutable result snapshots preserve ordered items without source row IDs.
"use client";
import { Badge } from "@/components/ui/feedback/Badge/Badge";
import { usePreferences } from "@/features/preferences/Preferences";
import type { Sensor } from "@/lib/models/domain";
import styles from "./PanelsStyles.module.css";
export function SensorPanel({ sensors }: { sensors: Sensor[] }) {
  const { t, locale } = usePreferences();
  return (
    <>
      <p className={styles.intro}>{t.sensorBody}</p>
      <section className={styles.card}>
        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                {["name", "value", "quality", "source", "time"].map((key) => (
                  <th key={key}>{t[key]}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sensors.map((sensor) => (
                <tr key={sensor.id}>
                  <td>
                    <strong>{sensor.name}</strong>
                    <small>{sensor.kind}</small>
                  </td>
                  <td>
                    {sensor.value == null
                      ? t.unknown
                      : new Intl.NumberFormat(locale, {
                          maximumFractionDigits: 3,
                        }).format(sensor.value)}{" "}
                    {sensor.unit}
                  </td>
                  <td>
                    <Badge
                      tone={
                        sensor.quality === "disconnected"
                          ? "warning"
                          : "neutral"
                      }
                    >
                      {t[sensor.quality] ?? sensor.quality}
                    </Badge>
                  </td>
                  <td>{sensor.source}</td>
                  <td>
                    {sensor.last_seen
                      ? new Date(sensor.last_seen).toLocaleString(locale)
                      : t.unknown}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!sensors.length && <p className={styles.empty}>{t.noData}</p>}
      </section>
    </>
  );
}
