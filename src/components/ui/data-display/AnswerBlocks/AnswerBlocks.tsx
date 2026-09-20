// biome-ignore-all lint/suspicious/noArrayIndexKey: Immutable result snapshots preserve ordered items without source row IDs.
import type { ChatComponent, Evidence } from "@/lib/models/chatComponents";
import styles from "./AnswerBlocksStyles.module.css";

function Points({ points }: { points: { label: string; value: number }[] }) {
  const max = Math.max(...points.map((point) => Math.abs(point.value)), 1);
  return (
    <>
      <svg
        className={styles.chart}
        viewBox="0 0 500 140"
        role="img"
        aria-label={points
          .map((point) => `${point.label}: ${point.value}`)
          .join(", ")}
      >
        {points.map((point, i) => (
          <g key={point.label + i}>
            <rect
              x={i * (480 / points.length) + 10}
              y={110 - (Math.abs(point.value) / max) * 95}
              width={Math.max(2, 360 / points.length)}
              height={(Math.abs(point.value) / max) * 95}
              rx="3"
            />
            <text x={i * (480 / points.length) + 10} y="130">
              {point.label.slice(0, 9)}
            </text>
          </g>
        ))}
      </svg>
      <div className={styles.scroll}>
        <table>
          <tbody>
            {points.map((point, i) => (
              <tr key={point.label + i}>
                <th scope="row">{point.label}</th>
                <td>{point.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
function Content({
  item,
  copy,
}: {
  item: ChatComponent;
  copy: Record<string, string>;
}) {
  switch (item.type) {
    case "metric":
      return (
        <>
          <strong className={styles.metric}>{item.value}</strong>
          <p>{item.detail}</p>
        </>
      );
    case "chart":
      return <Points points={item.points} />;
    case "projection":
      return (
        <>
          <BadgeText text={copy.illustrative} />
          <Points points={item.points} />
          <h5>{copy.assumptions}</h5>
          <ul>
            {item.assumptions.map((s, i) => (
              <li key={s + i}>{s}</li>
            ))}
          </ul>
        </>
      );
    case "table":
      return (
        <div className={styles.scroll}>
          <table>
            <thead>
              <tr>
                {item.columns.map((s, i) => (
                  <th key={s + i}>{s}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {item.rows.map((row, i) => (
                <tr key={row.join("-") + i}>
                  {row.map((cell, j) => (
                    <td key={cell + j}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "evidence":
      return (
        <dl>
          {item.items.map((s, i) => (
            <div key={s.label + i}>
              <dt>{s.label}</dt>
              <dd>
                {s.detail}
                <small>{s.source}</small>
              </dd>
            </div>
          ))}
        </dl>
      );
    case "diagram":
      return (
        <>
          <div className={styles.nodes}>
            {item.nodes.map((node) => (
              <span key={node.id}>{node.label}</span>
            ))}
          </div>
          <ul className={styles.edges}>
            {item.edges.map((edge, i) => (
              <li key={edge.from + edge.to + i}>
                {item.nodes.find((node) => node.id === edge.from)?.label} →{" "}
                {item.nodes.find((node) => node.id === edge.to)?.label}
                {edge.label && <small>{edge.label}</small>}
              </li>
            ))}
          </ul>
        </>
      );
  }
}
function BadgeText({ text }: { text: string }) {
  return <small className={styles.notice}>{text}</small>;
}
export function AnswerBlocks({
  components,
  evidence,
  copy,
}: {
  components: ChatComponent[];
  evidence: Evidence[];
  copy: Record<string, string>;
}) {
  return (
    <div className={styles.blocks}>
      {components.map((item, index) => (
        <section
          className={styles.card}
          data-component-type={item.type}
          key={item.type + index}
        >
          <h4>{item.type === "metric" ? item.label : item.title}</h4>
          <Content item={item} copy={copy} />
          {item.sourceIds.length > 0 && (
            <details className={styles.sources}>
              <summary>
                {copy.sources} · {item.sourceIds.join(", ")}
              </summary>
              {item.sourceIds.map((id) => {
                const source = evidence.find((e) => e.id === id);
                return (
                  <p key={id}>
                    {source?.label}
                    <small>{source?.locator}</small>
                  </p>
                );
              })}
            </details>
          )}
        </section>
      ))}
    </div>
  );
}
