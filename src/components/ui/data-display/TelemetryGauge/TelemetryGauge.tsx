import styles from "./TelemetryGaugeStyles.module.css";

export function TelemetryGauge({
  label,
  value,
  unit,
  quality,
  source,
  available,
}: {
  label: string;
  value: string;
  unit: string;
  quality: string;
  source: string;
  available: boolean;
}) {
  return (
    <article className={styles.card} data-available={available}>
      <header>
        <span className={styles.status} />
        <h2>{label}</h2>
        <span className={styles.device}>◈</span>
      </header>
      <div className={styles.gauge}>
        <svg viewBox="0 0 260 150" aria-hidden="true">
          <path className={styles.track} d="M30 125a100 100 0 0 1 200 0" />
          <path className={styles.arc} d="M30 125a100 100 0 0 1 200 0" />
          <path
            className={styles.ticks}
            d="M22 125h12m8-52 10 6m35-44 5 11m38-24v12m44 1-5 11m40 27-10 6m27 46h12"
          />
        </svg>
        <div>
          <strong>{value}</strong>
          <span>{unit}</span>
        </div>
      </div>
      <footer>
        <span>
          <i />
          {quality}
        </span>
        <small>{source}</small>
      </footer>
    </article>
  );
}
