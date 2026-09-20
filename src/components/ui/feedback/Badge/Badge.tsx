import styles from "./BadgeStyles.module.css";
export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "good" | "warning" | "error";
}) {
  return (
    <span className={`${styles.badge} ${styles[tone]}`}>
      <span aria-hidden="true">●</span>
      {children}
    </span>
  );
}
