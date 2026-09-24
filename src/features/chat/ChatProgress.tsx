import type { AssistantStage } from "@/lib/api/chatStream";
import styles from "./ChatStyles.module.css";

export function ChatProgress({
  stages,
  copy,
}: {
  stages: AssistantStage[];
  copy: Record<string, string>;
}) {
  return (
    <div className={styles.progress}>
      <p>{copy.working}</p>
      {stages.length > 0 && (
        <ol aria-label={copy.executionProgress}>
          {stages.map(({ stage, status }) => (
            <li key={stage} data-status={status}>
              <span aria-hidden="true">
                {status === "completed" ? "✓" : "◌"}
              </span>
              <span>{copy[`stage_${stage}`]}</span>
              <small>
                {status === "completed"
                  ? copy.stageCompleted
                  : copy.stageRunning}
              </small>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
