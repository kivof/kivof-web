"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api/client";
import {
  type Camera,
  type LiveScene,
  parseLiveScene,
} from "@/lib/models/liveScene";

type LiveFailure = "failed" | "cameraError" | "stopError" | "busy" | "expired";
function liveFailure(error: unknown): LiveFailure {
  if (error instanceof Error && error.message === "live_worker_busy")
    return "busy";
  if (error instanceof Error && error.message === "live_session_expired")
    return "expired";
  return "failed";
}

export function useLiveScene() {
  const [scene, setScene] = useState<LiveScene | null>(null);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<LiveFailure | null>(null);
  const [age, setAge] = useState(0);
  const [fps, setFps] = useState(0);
  const session = useRef<string | null>(null);
  const mounted = useRef(false);
  const operation = useRef(0);
  const lastFrame = useRef({ sequence: -1, time: 0 });
  const pendingCamera = useRef<Camera | null>(null);
  const cameraBusy = useRef(false);
  const startingRef = useRef(false);

  const receive = useCallback((next: LiveScene) => {
    if (next.id !== session.current || !mounted.current) return;
    const now = performance.now();
    const previous = lastFrame.current;
    if (next.frame && next.sequence > previous.sequence) {
      if (previous.time) setFps(1000 / (now - previous.time));
      lastFrame.current = { sequence: next.sequence, time: now };
      setAge(0);
      setError((value) => (value === "failed" ? null : value));
    }
    setScene(next);
    if (next.status === "failed") setError("failed");
    if (next.status === "failed" || next.status === "stopped")
      session.current = null;
  }, []);

  useEffect(() => {
    mounted.current = true;
    let cancelled = false;
    let polling = false;
    const timer = setInterval(async () => {
      const id = session.current;
      if (lastFrame.current.time)
        setAge((performance.now() - lastFrame.current.time) / 1000);
      if (!id || polling || document.hidden) return;
      polling = true;
      try {
        const next = parseLiveScene(
          await api(
            `simulation/live/${id}`,
            undefined,
            AbortSignal.timeout(10000),
          ),
        );
        if (!cancelled && session.current === id) receive(next);
      } catch (failure) {
        if (!cancelled && session.current === id) {
          const reason = liveFailure(failure);
          setError(reason);
          if (reason === "expired") {
            session.current = null;
            setScene((value) =>
              value ? { ...value, status: "stopped" } : null,
            );
          }
        }
      } finally {
        polling = false;
      }
    }, 500);
    return () => {
      cancelled = true;
      mounted.current = false;
      operation.current += 1;
      clearInterval(timer);
      const id = session.current;
      session.current = null;
      if (id)
        void fetch(`/api/simulation/live/${id}`, {
          method: "DELETE",
          credentials: "same-origin",
          keepalive: true,
        }).catch(() =>
          console.warn(
            "Live scene cleanup was not confirmed; idle expiry applies.",
          ),
        );
    };
  }, [receive]);

  async function start() {
    if (startingRef.current || session.current) return;
    const generation = ++operation.current;
    startingRef.current = true;
    setStarting(true);
    setError(null);
    setScene(null);
    setAge(0);
    setFps(0);
    lastFrame.current = { sequence: -1, time: 0 };
    try {
      const next = parseLiveScene(await api("simulation/live", {}));
      if (!mounted.current || generation !== operation.current) {
        await api(`simulation/live/${next.id}`, undefined, undefined, "DELETE");
        return;
      }
      session.current = next.id;
      receive(next);
    } catch (failure) {
      if (mounted.current) setError(liveFailure(failure));
    } finally {
      startingRef.current = false;
      if (mounted.current) setStarting(false);
    }
  }

  async function stop() {
    operation.current += 1;
    const id = session.current;
    session.current = null;
    pendingCamera.current = null;
    setError(null);
    setScene((value) => (value ? { ...value, status: "stopped" } : null));
    if (!id) return;
    try {
      await api(`simulation/live/${id}`, undefined, undefined, "DELETE");
    } catch {
      if (mounted.current) setError("stopError");
    }
  }

  const camera = useCallback(async (value: Camera) => {
    pendingCamera.current = value;
    if (cameraBusy.current) return;
    cameraBusy.current = true;
    try {
      while (pendingCamera.current && session.current) {
        const next = pendingCamera.current;
        const id = session.current;
        pendingCamera.current = null;
        try {
          await api(
            `simulation/live/${id}/camera`,
            next,
            AbortSignal.timeout(10000),
          );
          if (mounted.current && session.current === id) setError(null);
        } catch {
          if (mounted.current && session.current === id)
            setError("cameraError");
        }
      }
    } finally {
      cameraBusy.current = false;
    }
  }, []);
  return { scene, starting, error, age, fps, start, stop, camera };
}
