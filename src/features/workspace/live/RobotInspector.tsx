"use client";
import type { Locale } from "@/lib/i18n";
import type { LiveRobot } from "@/lib/models/liveScene";
import styles from "./LiveSceneStyles.module.css";
import type { LiveLabels } from "./liveLabels";
export function RobotInspector({
  robot,
  labels,
  locale,
  onFocus,
  enabled = true,
}: {
  robot: LiveRobot;
  labels: LiveLabels;
  locale: Locale;
  onFocus: () => void;
  enabled?: boolean;
}) {
  const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 3 });
  return (
    <aside
      className={styles.inspector}
      aria-label={enabled ? labels.joints : labels.recordedJoints}
    >
      <header>
        <strong>
          {robot.id} · {robot.model}
        </strong>
        <button type="button" onClick={onFocus} disabled={!enabled}>
          {labels.focus}
        </button>
      </header>
      <table>
        <caption>{enabled ? labels.joints : labels.recordedJoints}</caption>
        <thead>
          <tr>
            <th>{labels.joint}</th>
            <th>{labels.position} / rad</th>
            <th>{labels.velocity} / rad/s</th>
          </tr>
        </thead>
        <tbody>
          {robot.joint_names.map((name, i) => (
            <tr key={name}>
              <th title={name}>{number.format(i + 1)}</th>
              <td>{number.format(robot.joint_positions[i])}</td>
              <td>{number.format(robot.joint_velocities[i])}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </aside>
  );
}
