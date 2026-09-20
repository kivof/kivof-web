"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon, type IconName } from "@/components/ui/data-display/Icon/Icon";
import { Badge } from "@/components/ui/feedback/Badge/Badge";
import { Chat } from "@/features/chat/Chat";
import {
  Preferences,
  usePreferences,
} from "@/features/preferences/Preferences";
import { api } from "@/lib/api/client";
import { type Section, sections } from "@/lib/models/domain";
import { LearningPanel } from "./LearningPanel";
import {
  GraphPanel,
  LabelPanel,
  OverviewPanel,
  RunsPanel,
  SensorPanel,
  SimulationPanel,
} from "./panels";
import { useWorkspace } from "./useWorkspace";
import styles from "./WorkspaceStyles.module.css";

const icons: Record<Section, IconName> = {
  overview: "grid",
  runs: "activity",
  sensors: "robot",
  ontology: "graph",
  labels: "tag",
  simulation: "cube",
  learning: "bolt",
  chat: "chat",
};
export function Workspace({
  section = "overview",
  runId,
}: {
  section?: Section;
  runId?: string;
}) {
  const { t } = usePreferences();
  const state = useWorkspace();
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  async function logout() {
    await api("auth/logout", {});
    router.replace("/login");
  }
  return (
    <div className={styles.workspace} data-section={section}>
      <aside className={styles.sidebar} data-open={menu}>
        <Link href="/" className={styles.brand}>
          <span>K</span>
          <b>kivof.</b>
        </Link>
        <div className={styles.org}>
          <span>HF</span>
          <div>
            <strong>Harness Forge</strong>
            <small>{t.simulationBadge}</small>
          </div>
        </div>
        <nav aria-label={t.workspace}>
          {sections.map((key) => (
            <Link
              key={key}
              href={key === "overview" ? "/workspace" : `/workspace/${key}`}
              aria-current={section === key ? "page" : undefined}
              onClick={() => setMenu(false)}
              title={t[key]}
            >
              <Icon name={icons[key]} />
              <span>{t[key]}</span>
              {section === key && <span className={styles.navDot} />}
            </Link>
          ))}
        </nav>
        <div className={styles.sideBottom}>
          <div className={styles.authority}>
            <Icon name="shield" />
            <p>{t.localAuthority}</p>
          </div>
          <Link href="/deck/JO202609190900">
            <Icon name="expand" size={17} />
            {t.deck}
          </Link>
          <button type="button" onClick={() => void logout()} title={t.signOut}>
            <span className={styles.avatar}>
              {state.user?.name?.slice(0, 1) ?? "D"}
            </span>
            <span>
              <strong>{state.user?.name ?? t.operator}</strong>
              <small>{t.signOut}</small>
            </span>
            <Icon name="logout" size={17} />
          </button>
        </div>
      </aside>
      <div className={styles.body}>
        <header className={styles.header}>
          <div>
            <button
              type="button"
              className={styles.menu}
              onClick={() => setMenu(!menu)}
              aria-label={t.workspace}
            >
              <Icon name="menu" />
            </button>
            <span className={styles.breadcrumb}>
              Harness Forge <Icon name="chevron" size={12} /> {t[section]}
            </span>
          </div>
          <div>
            <Badge tone={state.connected ? "good" : "neutral"}>
              {state.connected ? t.connected : t.disconnected}
            </Badge>
            <Preferences />
            {section !== "chat" && (
              <button
                type="button"
                className={styles.iconButton}
                aria-label={t.chat}
                title={t.chat}
                aria-expanded={chatOpen}
                onClick={() => setChatOpen(!chatOpen)}
              >
                <Icon name={chatOpen ? "close" : "chat"} size={18} />
              </button>
            )}
          </div>
        </header>
        <div
          className={styles.contentGrid}
          data-chat={section === "chat"}
          data-chat-open={chatOpen}
        >
          <main className={styles.main}>
            {state.error ? (
              <div className={styles.empty} role="alert">
                <p>{t.error}</p>
                <button type="button" onClick={() => void state.refresh()}>
                  {t.retry}
                </button>
              </div>
            ) : !state.overview ? (
              <div className={styles.empty}>{t.loading}</div>
            ) : (
              <>
                <div className={styles.pageTitle}>
                  <div>
                    <span>HARNESS FORGE / 01</span>
                    <h1>
                      {section === "overview" ? t.overviewTitle : t[section]}
                    </h1>
                  </div>
                  <button
                    type="button"
                    className={styles.iconButton}
                    onClick={() => void state.refresh()}
                    title={t.refresh}
                    aria-label={t.refresh}
                  >
                    <Icon name="activity" />
                  </button>
                </div>
                {section === "overview" && (
                  <OverviewPanel overview={state.overview} />
                )}
                {section === "runs" && (
                  <RunsPanel runs={state.runs} runId={runId} />
                )}
                {section === "sensors" && (
                  <SensorPanel sensors={state.sensors} />
                )}
                {section === "ontology" && (
                  <GraphPanel graph={state.ontology} />
                )}
                {section === "labels" && (
                  <LabelPanel
                    runs={state.runs}
                    labels={state.labels}
                    refresh={state.refresh}
                  />
                )}
                {section === "learning" && <LearningPanel runs={state.runs} />}
                {section === "simulation" && (
                  <SimulationPanel
                    capabilities={state.overview.capabilities}
                    latestRun={state.overview.latest_run}
                    refresh={state.refresh}
                  />
                )}
              </>
            )}
          </main>
          <aside className={styles.chatDock}>
            <Chat compact={section !== "chat"} />
          </aside>
        </div>
      </div>
    </div>
  );
}
