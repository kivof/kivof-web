// biome-ignore-all lint/suspicious/noArrayIndexKey: Immutable result snapshots preserve ordered items without source row IDs.
"use client";
import { Icon } from "@/components/ui/data-display/Icon/Icon";
import { usePreferences } from "@/features/preferences/Preferences";
import type { Locale } from "@/lib/i18n";
import type { Ontology } from "@/lib/models/domain";
import styles from "./PanelsStyles.module.css";
import { RawRecord } from "./RawRecord";

export function ontologyLabel(
  node: Ontology["nodes"][number],
  t: Record<string, string>,
  locale: Locale,
  native = false,
) {
  const arm = /^franka-([0-7])(-joints)?$/.exec(node.id);
  if (arm)
    return `Franka ${new Intl.NumberFormat(locale).format(Number(arm[1]) + 1)}${arm[2] ? ` · ${t.jointState}` : " · Panda"}`;
  if (node.id === "factory") return node.label;
  if (node.id === "cell") return native ? t.nativeCell : t.assemblyCell;
  if (node.id === "robot-camera" && native) return t.renderedCamera;
  const guide = /^guide-([1-3])$/.exec(node.id);
  if (guide) return t[`route_guide_${guide[1]}`];
  return t[`entity_${node.id}`] ?? t[node.id] ?? node.label;
}

export function GraphPanel({ graph }: { graph: Ontology }) {
  const { t, locale } = usePreferences();
  const native = graph.source === "native-scene-and-recorded-state";
  const labels = new Map(
    graph.nodes.map((node) => [
      node.id,
      ontologyLabel(node, t, locale, native),
    ]),
  );
  return (
    <>
      <p className={styles.intro}>{t.graphBody}</p>
      {native && <p className={styles.intro}>{t.nativeGraphBody}</p>}
      <div className={styles.graphNodes}>
        {graph.nodes.map((node) => (
          <article key={node.id}>
            <Icon name={node.type === "robot" ? "robot" : "cube"} />
            <div>
              <strong>{labels.get(node.id)}</strong>
              <small title={node.id}>
                {t[`entityType_${node.type}`] ?? node.type}
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
                  <td title={edge.source}>
                    {labels.get(edge.source) ?? edge.source}
                  </td>
                  <td>
                    <span className={styles.relation}>
                      → {t[`relation_${edge.label}`] ?? edge.label}
                    </span>
                  </td>
                  <td title={edge.target}>
                    {labels.get(edge.target) ?? edge.target}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <RawRecord value={graph} />
    </>
  );
}
