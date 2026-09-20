// biome-ignore-all lint/suspicious/noArrayIndexKey: Recorded coordinates and immutable observations have stable source order.
"use client";
import { useId } from "react";
import { usePreferences } from "@/features/preferences/Preferences";
import { Fields } from "./Fields";
import panels from "./PanelsStyles.module.css";
import { RawRecord } from "./RawRecord";
import styles from "./RecordEvidenceStyles.module.css";
import {
  geometryPoints,
  recordNumber,
  recordObject,
  translated,
} from "./recordPresentation";

export function VerificationSummary({
  value,
  compact = false,
}: {
  value: Record<string, unknown>;
  compact?: boolean;
}) {
  const thresholds = recordObject(value.thresholds);
  return (
    <Fields
      values={{
        passed: value.passed,
        independent: value.independent,
        guide_occupancy: value.guide_occupancy,
        position_error_m: value.position_error_m,
        yaw_error_rad: value.yaw_error_rad,
        released: value.released,
        retained_seconds: value.retained_seconds,
        ...(compact
          ? {}
          : {
              positionTolerance: thresholds.position_m,
              orientationTolerance: thresholds.yaw_rad,
              retentionRequirement: thresholds.retention_s,
            }),
        ...(value.error_code ? { error_code: value.error_code } : {}),
      }}
    />
  );
}

export function StepSummary({ value }: { value: Record<string, unknown> }) {
  return (
    <Fields
      values={{
        phase: value.phase,
        simulation_time_s: value.simulation_time_s,
        status: value.status,
        ...(value.guide_occupancy
          ? { guide_occupancy: value.guide_occupancy }
          : {}),
      }}
    />
  );
}

export function ObservationSummary({
  value,
}: {
  value: Record<string, unknown>;
}) {
  const { t, locale } = usePreferences();
  const sensors = Array.isArray(value.sensors)
    ? value.sensors.map(recordObject)
    : [];
  return (
    <>
      <Fields
        values={{
          quality: value.quality,
          source: value.source,
          sensor_time_s: value.sensor_time_s,
          age_ms: value.age_ms,
          max_skew_ms: value.max_skew_ms,
          frame: value.frame,
          calibration_version: value.calibration_version,
        }}
      />
      {!!sensors.length && (
        <div className={panels.tableWrap}>
          <table>
            <thead>
              <tr>
                <th>{t.name}</th>
                <th>{t.kind}</th>
                <th>{t.value}</th>
                <th>{t.confidence}</th>
              </tr>
            </thead>
            <tbody>
              {sensors.map((sensor, index) => (
                <tr key={String(sensor.id ?? index)}>
                  <td>{translated(sensor.id, t)}</td>
                  <td>{translated(sensor.kind, t)}</td>
                  <td>
                    {recordNumber(
                      sensor.value,
                      locale,
                      typeof sensor.unit === "string" ? sensor.unit : "",
                    )}
                  </td>
                  <td>{recordNumber(sensor.confidence, locale)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <RawRecord value={value} />
    </>
  );
}

export function CableEvidence({
  evidence,
}: {
  evidence: Record<string, unknown>;
}) {
  const { t, locale } = usePreferences();
  const titleId = useId();
  const points = geometryPoints(evidence.cable_points_m);
  const guides = geometryPoints(evidence.guide_positions_m);
  const socket = geometryPoints([evidence.socket_position_m]);
  const all = [...points, ...guides, ...socket];
  const minX = all.length ? Math.min(...all.map((point) => point[0])) : 0;
  const maxX = all.length ? Math.max(...all.map((point) => point[0])) : 1;
  const minZ = all.length ? Math.min(...all.map((point) => point[2])) : 0;
  const maxZ = all.length ? Math.max(...all.map((point) => point[2])) : 1;
  const scale = Math.min(
    600 / Math.max(maxX - minX, 0.01),
    164 / Math.max(maxZ - minZ, 0.01),
  );
  const x = (point: number[]) => 40 + (point[0] - minX) * scale;
  const z = (point: number[]) => 205 - (point[2] - minZ) * scale;
  return (
    <>
      {points.length ? (
        <figure className={styles.geometry}>
          <svg viewBox="0 0 680 240" role="img" aria-labelledby={titleId}>
            <title id={titleId}>{t.cableGeometry}</title>
            <path d="M40 25V205H640" className={styles.axis} />
            <text x="18" y="28">
              Z
            </text>
            <text x="640" y="225">
              X
            </text>
            <text x="40" y="225">
              {recordNumber(minX, locale)} m
            </text>
            <text x="600" y="225">
              {recordNumber(maxX, locale)} m
            </text>
            <polyline
              points={points
                .map((point) => `${x(point)},${z(point)}`)
                .join(" ")}
              className={styles.cable}
            />
            {guides.map((point, i) => (
              <g key={i}>
                <circle
                  cx={x(point)}
                  cy={z(point)}
                  r="9"
                  className={styles.guide}
                />
                <text x={x(point)} y={z(point) - 16} textAnchor="middle">
                  {i + 1}
                </text>
              </g>
            ))}
            {socket.map((point, i) => (
              <rect
                key={i}
                x={x(point) - 7}
                y={z(point) - 7}
                width="14"
                height="14"
                className={styles.socket}
              />
            ))}
          </svg>
          <figcaption>
            <span>{t.geometryCaption}</span>
            <span>
              <i className={styles.cableKey} />
              {t.cable} <i className={styles.guideKey} />
              {t.guides} <i className={styles.socketKey} />
              {t.socket}
            </span>
          </figcaption>
        </figure>
      ) : (
        <p className={panels.empty}>{t.geometryUnavailable}</p>
      )}
      <Fields
        values={{
          cable_nominal_length_m: evidence.cable_nominal_length_m,
          fixed_step_s: evidence.fixed_step_s,
          recipe: evidence.recipe,
          simulator: evidence.simulator,
        }}
      />
      <RawRecord value={evidence} />
    </>
  );
}

export function CapabilitySummary({
  value,
}: {
  value: Record<string, unknown>;
}) {
  const { t } = usePreferences();
  const isaac = recordObject(value.isaac_sim);
  const availability = (flag: unknown) =>
    flag === true ? t.available : flag === false ? t.notAdvertised : t.unknown;
  return (
    <>
      <Fields
        values={{
          [t.cpuEngine]: availability(value.cpu_simulation),
          [t.isaacEngine]:
            isaac.verified === true
              ? t.verified
              : isaac.configured === true
                ? t.configuredUnverified
                : t.notAdvertised,
          [t.policy]: availability(value.vla_inference),
          [t.world]: availability(value.world_model_inference),
          [t.physicalExecution]:
            value.physical_execution === false
              ? t.disabled
              : value.physical_execution === true
                ? t.available
                : t.unknown,
        }}
      />
      <p className={panels.footnote}>{t.readinessNote}</p>
      <RawRecord value={value} />
    </>
  );
}
