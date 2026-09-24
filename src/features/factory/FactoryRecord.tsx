import { AnswerBlocks } from "@/components/ui/data-display/AnswerBlocks/AnswerBlocks";
import { Badge } from "@/components/ui/feedback/Badge/Badge";
import type { Locale } from "@/lib/i18n";
import type { FactoryRecord as FactoryEvidence } from "@/lib/models/factory";
import { FactoryNativeEvidence } from "./FactoryNativeEvidence";
import styles from "./FactoryStyles.module.css";

export function FactoryRecord({
  record,
  copy: t,
  locale,
}: {
  record: FactoryEvidence;
  copy: Record<string, string>;
  locale: Locale;
}) {
  const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 3 });
  const percent = new Intl.NumberFormat(locale, {
    style: "percent",
    maximumFractionDigits: 1,
  });
  const name = (value: string | null) => (value ? (t[value] ?? value) : "—");
  return (
    <div className={styles.record} data-factory-record={record.id}>
      <div className={styles.provenance}>
        <Badge tone={record.verification.passed ? "good" : "neutral"}>
          {name(record.status)}
        </Badge>
        <span>
          {t.recordOrigin}: {name(record.data_origin)}
        </span>
        <code>{record.id}</code>
      </div>
      <p className={styles.notice}>
        {record.native
          ? t.nativeResultNote
          : record.source === "cpu-cheese-factory-simulation"
            ? t.simulationNote
            : t.submittedOrigin}
      </p>
      {record.native && (
        <FactoryNativeEvidence
          key={record.id}
          native={record.native}
          copy={t}
          locale={locale}
        />
      )}
      {!record.origin_verified && (
        <p className={styles.notice}>{t.submittedOrigin}</p>
      )}
      <div className={styles.cards}>
        <section className={styles.card} aria-label={t.decision}>
          <h3>{t.decision}</h3>
          <strong>{name(record.decision.action)}</strong>
          <dl>
            <div>
              <dt>{t.class}</dt>
              <dd>{name(record.decision.class)}</dd>
            </div>
            <div>
              <dt>{t.bin}</dt>
              <dd>{name(record.decision.bin)}</dd>
            </div>
            <div>
              <dt>{t.confidence}</dt>
              <dd>{percent.format(record.decision.confidence)}</dd>
            </div>
          </dl>
        </section>
        <section className={styles.card} aria-label={t.quality}>
          <h3>{t.quality}</h3>
          <strong>
            {record.quality.passed ? t.qualityPassed : t.qualityFailed}
          </strong>
          <dl>
            <div>
              <dt>{t.age_ms}</dt>
              <dd>
                {record.quality.age_ms == null
                  ? t.unknown
                  : `${number.format(record.quality.age_ms)} ms`}
              </dd>
            </div>
            <div>
              <dt>{t.max_skew_ms}</dt>
              <dd>
                {record.quality.max_skew_ms == null
                  ? t.unknown
                  : `${number.format(record.quality.max_skew_ms)} ms`}
              </dd>
            </div>
          </dl>
          {record.quality.issues.length > 0 && (
            <ul>
              {record.quality.issues.map((issue) => (
                <li key={issue}>{name(issue)}</li>
              ))}
            </ul>
          )}
        </section>
        <section className={styles.card} aria-label={t.placement}>
          <h3>{t.placement}</h3>
          <strong>
            {record.verification.passed
              ? t.passed
              : name(record.verification.error_code) || t.notPlaced}
          </strong>
          <dl>
            <div>
              <dt>{t.expectedBin}</dt>
              <dd>{name(record.verification.expected_bin)}</dd>
            </div>
            <div>
              <dt>{t.observedBin}</dt>
              <dd>{name(record.verification.observed_bin)}</dd>
            </div>
          </dl>
          <p>{t.noMotor}</p>
        </section>
      </div>
      {record.sensors.length > 0 && (
        <section className={styles.card}>
          <h3>{t.sensors}</h3>
          <div className={styles.scroll}>
            <table>
              <thead>
                <tr>
                  <th>{t.name}</th>
                  <th>{t.value}</th>
                  <th>{t.time}</th>
                </tr>
              </thead>
              <tbody>
                {record.sensors.map((sensor) => (
                  <tr key={sensor.id}>
                    <th scope="row">{name(sensor.kind)}</th>
                    <td>
                      {number.format(sensor.value)} {sensor.unit}
                    </td>
                    <td>
                      {new Date(sensor.timestamp_ms).toLocaleString(locale)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
      <AnswerBlocks
        components={[
          {
            type: "diagram",
            title: t.ontology,
            nodes: record.nodes.map((node) => ({
              id: node.id,
              label: name(node.id),
            })),
            edges: record.edges.map((edge) => ({
              ...edge,
              label: name(edge.relation),
            })),
            sourceIds: ["F1"],
          },
        ]}
        evidence={[{ id: "F1", label: t.factory, locator: record.id }]}
        copy={t}
      />
      <section className={styles.card}>
        <h3>{t.labelReview}</h3>
        {record.labels.map((label, index) => (
          <p key={`${label.label}-${index}`}>
            {name(label.label)} · {name(label.status)} ·{" "}
            {label.training_eligible ? t.available : t.trainingBlocked}
          </p>
        ))}
      </section>
      <details className={styles.raw}>
        <summary>{t.sourceMetadata}</summary>
        <pre>{JSON.stringify(record.raw, null, 2)}</pre>
      </details>
    </div>
  );
}
