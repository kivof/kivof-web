// biome-ignore-all lint/suspicious/noArrayIndexKey: Immutable result snapshots preserve ordered items without source row IDs.
"use client";
import { Icon } from "@/components/ui/data-display/Icon/Icon";
import { usePreferences } from "@/features/preferences/Preferences";
import type { Ontology } from "@/lib/models/domain";
import styles from "./PanelsStyles.module.css";
export function GraphPanel({ graph }: { graph: Ontology }) {
  const { t } = usePreferences();
  return (
    <>
      <p className={styles.intro}>{t.graphBody}</p>
      <div className={styles.graphNodes}>
        {graph.nodes.map((node) => (
          <article key={node.id}>
            <Icon name={node.type === "robot" ? "robot" : "cube"} />
            <div>
              <strong>{node.label}</strong>
              <small>
                {node.type} · {node.id}
              </small>
            </div>
          </article>
        ))}
      </div>
      <section className={styles.card}>
        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th>{t.source}</th>
                <th>{t.kind}</th>
                <th>{t.name}</th>
              </tr>
            </thead>
            <tbody>
              {graph.edges.map((edge, i) => (
                <tr key={edge.source + edge.target + i}>
                  <td>{edge.source}</td>
                  <td>
                    <span className={styles.relation}>→ {edge.label}</span>
                  </td>
                  <td>{edge.target}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
