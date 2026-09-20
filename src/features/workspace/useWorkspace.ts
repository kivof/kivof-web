"use client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api/client";
import type {
  Label,
  Ontology,
  Overview,
  Run,
  Sensor,
  User,
} from "@/lib/models/domain";
export function useWorkspace() {
  const router = useRouter();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [runs, setRuns] = useState<Run[]>([]);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [ontology, setOntology] = useState<Ontology>({ nodes: [], edges: [] });
  const [labels, setLabels] = useState<Label[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState(false);
  const [connected, setConnected] = useState(false);
  const refreshing = useRef(false);
  const refresh = useCallback(async () => {
    if (refreshing.current) return;
    refreshing.current = true;
    try {
      const [o, r, s, g, l, u] = await Promise.all([
        api<Overview>("overview"),
        api<{ items: Run[] }>("runs"),
        api<{ items: Sensor[] }>("sensors"),
        api<Ontology>("ontology"),
        api<{ items: Label[] }>("labels"),
        api<{ user: User }>("auth/me"),
      ]);
      if (
        !o.factory ||
        !o.metrics ||
        ![r.items, s.items, l.items, g.nodes, g.edges].every(Array.isArray)
      )
        throw new Error("invalid_response");
      setOverview(o);
      setRuns(r.items);
      setSensors(s.items);
      setOntology(g);
      setLabels(l.items);
      setUser(u.user);
      setError(false);
    } catch (e) {
      if (e instanceof Error && e.message === "unauthorized")
        router.replace("/login");
      else setError(true);
    } finally {
      refreshing.current = false;
    }
  }, [router]);
  useEffect(() => {
    void refresh();
    const changed = () => void refresh();
    window.addEventListener("kivof:workspace-changed", changed);
    const events = new EventSource("/api/events");
    let timer: ReturnType<typeof setTimeout> | undefined;
    events.addEventListener("telemetry", () => {
      setConnected(true);
      if (!timer)
        timer = setTimeout(() => {
          timer = undefined;
          void refresh();
        }, 1500);
    });
    events.addEventListener("status", () => setConnected(false));
    events.onerror = () => setConnected(false);
    return () => {
      window.removeEventListener("kivof:workspace-changed", changed);
      events.close();
      if (timer) clearTimeout(timer);
    };
  }, [refresh]);
  return {
    overview,
    runs,
    sensors,
    ontology,
    labels,
    user,
    error,
    connected,
    refresh,
  };
}
