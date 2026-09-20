// biome-ignore-all lint/suspicious/noArrayIndexKey: Immutable result snapshots preserve ordered items without source row IDs.
"use client";
import { TelemetryGauge } from "@/components/ui/data-display/TelemetryGauge/TelemetryGauge";
import { Badge } from "@/components/ui/feedback/Badge/Badge";
import { usePreferences } from "@/features/preferences/Preferences";
import type { Sensor } from "@/lib/models/domain";
import styles from "./PanelsStyles.module.css";
export function SensorPanel({ sensors }: { sensors: Sensor[] }) {
  const { t, locale } = usePreferences();
  const native =
    sensors.length > 0 &&
    sensors.every((sensor) => sensor.source === "isaac-sim");
  const label = (sensor: Sensor) => {
    const match = /^franka-([0-7])-joints$/.exec(sensor.id);
    return match
      ? `Franka ${new Intl.NumberFormat(locale).format(Number(match[1]) + 1)} · ${t.jointSpeed}`
      : (t[sensor.id] ?? sensor.name);
  };
  return (
    <>
      <p className={styles.intro}>
        {native ? t.nativeSensorBody : t.sensorBody}
      </p>
      <div className={styles.sensorGauges}>
        {sensors.map((sensor) => (
          <TelemetryGauge
            key={sensor.id}
            label={label(sensor)}
            value={
              sensor.value == null
                ? "—"
                : new Intl.NumberFormat(locale, {
                    maximumSignificantDigits: 4,
                  }).format(sensor.value)
            }
            unit={sensor.unit}
            quality={t[sensor.quality] ?? sensor.quality}
            source={t[sensor.source] ?? sensor.source}
            available={
              sensor.value != null && sensor.quality !== "disconnected"
            }
          />
        ))}
        {!native &&
          sensors.map((sensor) => (
            <TelemetryGauge
              key={`${sensor.id}-age`}
              label={`${t[sensor.id] ?? sensor.name} · ${t.recordedAge}`}
              value={
                typeof sensor.age_ms === "number" &&
                Number.isFinite(sensor.age_ms) &&
                sensor.age_ms >= 0
                  ? new Intl.NumberFormat(locale, {
                      maximumFractionDigits: 1,
                    }).format(sensor.age_ms)
                  : "—"
              }
              unit="ms"
              quality={t[sensor.quality] ?? sensor.quality}
              source={t[sensor.source] ?? sensor.source}
              available={
                typeof sensor.age_ms === "number" &&
                Number.isFinite(sensor.age_ms) &&
                sensor.age_ms >= 0
              }
            />
          ))}
        {!native &&
          [
            [
              "reportedValues",
              sensors.filter(
                (sensor) =>
                  typeof sensor.value === "number" &&
                  Number.isFinite(sensor.value),
              ).length,
            ],
            [
              "validQuality",
              sensors.filter((sensor) => sensor.quality === "valid").length,
            ],
          ].map(([key, count]) => (
            <TelemetryGauge
              key={key}
              label={t[key]}
              value={
                sensors.length
                  ? new Intl.NumberFormat(locale).format(Number(count))
                  : "—"
              }
              unit={`/ ${sensors.length}`}
              quality={t.readOnly}
              source={t.derivedTelemetry}
              available={sensors.length > 0}
            />
          ))}
      </div>
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
                    <strong>{label(sensor)}</strong>
                    <small>{t[sensor.kind] ?? sensor.kind}</small>
                  </td>
                  <td>
                    {sensor.value == null
                      ? t.unknown
                      : new Intl.NumberFormat(locale, {
                          maximumSignificantDigits: 4,
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
                  <td>{t[sensor.source] ?? sensor.source}</td>
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
