"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api/client";
import {
  type FrameSample,
  liveFrameTiming,
  sampleLiveFrame,
} from "@/lib/models/liveFrameTiming";
import {
  type Camera,
  type LiveScene,
  parseLiveScene,
} from "@/lib/models/liveScene";
import { liveSessionContext } from "@/lib/models/liveSessionContext";
import { pollLiveFeed } from "./liveFeed";

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
  const [stopping, setStopping] = useState(false);
  const [error, setError] = useState<LiveFailure | null>(null);
  const [age, setAge] = useState(0);
  const [fps, setFps] = useState(0);
  const [speed, setSpeed] = useState<number | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const session = useRef<string | null>(null);
  const mounted = useRef(false);
  const operation = useRef(0);
  const samples = useRef<FrameSample[]>([]);
  const pendingCamera = useRef<Camera | null>(null);
  const cameraBusy = useRef(false);
  const startingRef = useRef(false);

  const receive = useCallback((next: LiveScene) => {
    if (next.id !== session.current || !mounted.current) return;
    if (
      next.sequence < (samples.current.at(-1)?.sequence ?? -1) &&
      next.status !== "stopped" &&
      next.status !== "failed"
    )
      return;
    const nextSamples = sampleLiveFrame(samples.current, next, Date.now());
    if (nextSamples !== samples.current) {
      samples.current = nextSamples;
      const timing = liveFrameTiming(nextSamples, Date.now());
      setFps(timing.fps);
      setSpeed(timing.speed);
      setAge(timing.age);
      setError((value) => (value === "failed" ? null : value));
    }
    setScene((previous) =>
      previous?.sequence === next.sequence && previous.status === next.status
        ? previous
        : next,
    );
    if (next.status === "failed") setError("failed");
    if (next.status === "failed" || next.status === "stopped") {
      session.current = null;
      setActiveId(null);
    }
  }, []);

  const adopt = useCallback(
    (next: LiveScene) => {
      if (session.current !== next.id) {
        operation.current += 1;
        samples.current = [];
        pendingCamera.current = null;
        setFps(0);
        setSpeed(null);
        setScene(null);
      }
      session.current = next.id;
      setActiveId(next.id);
      receive(next);
    },
    [receive],
  );

  useEffect(() => {
    mounted.current = true;
    const controller = new AbortController();
    const refresh = () => {
      const generation = operation.current;
      void api<{ current_live_session?: unknown }>(
        "assistant/context",
        undefined,
        controller.signal,
      )
        .then(async (context) => {
          if (controller.signal.aborted || generation !== operation.current)
            return;
          const discovered = liveSessionContext(context, session.current);
          if (discovered.state === "stopped") {
            session.current = null;
            setActiveId(null);
            setScene((value) =>
              value ? { ...value, status: "stopped" } : null,
            );
            return;
          }
          if (discovered.state !== "active") {
            if (session.current && discovered.state === "unavailable")
              setError("failed");
            return;
          }
          const next = parseLiveScene(
            await api(
              `simulation/live/${discovered.id}`,
              undefined,
              controller.signal,
            ),
          );
          if (!controller.signal.aborted && generation === operation.current)
            adopt(next);
        })
        .catch((failure) => {
          if (!controller.signal.aborted && session.current)
            setError(liveFailure(failure));
        });
    };
    refresh();
    const update = (event: Event) => {
      try {
        adopt(parseLiveScene((event as CustomEvent<unknown>).detail));
      } catch {
        setError("failed");
      }
    };
    window.addEventListener("kivof:live-session", update);
    window.addEventListener("kivof:workspace-changed", refresh);
    return () => {
      mounted.current = false;
      operation.current += 1;
      controller.abort();
      window.removeEventListener("kivof:live-session", update);
      window.removeEventListener("kivof:workspace-changed", refresh);
      session.current = null;
    };
  }, [adopt]);

  useEffect(() => {
    const timer = setInterval(() => {
      const timing = liveFrameTiming(samples.current, Date.now());
      setAge(timing.age);
      if (timing.age >= 10) setFps(0);
    }, 500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!activeId) return;
    const controller = new AbortController();
    void pollLiveFeed({
      signal: controller.signal,
      read: async (signal) =>
        parseLiveScene(
          await api(
            `simulation/live/${activeId}`,
            undefined,
            AbortSignal.any([signal, AbortSignal.timeout(10000)]),
          ),
        ),
      receive,
      failure: (failure) => {
        const reason = liveFailure(failure);
        setError(reason);
        if (reason !== "expired") return true;
        session.current = null;
        setActiveId(null);
        setScene((value) => (value ? { ...value, status: "stopped" } : null));
        return false;
      },
    });
    return () => controller.abort();
  }, [activeId, receive]);

  async function start() {
    if (startingRef.current || session.current) return;
    const generation = ++operation.current;
    startingRef.current = true;
    setStarting(true);
    setError(null);
    setScene(null);
    setAge(0);
    setFps(0);
    setSpeed(null);
    samples.current = [];
    try {
      const next = parseLiveScene(await api("simulation/live", {}));
      if (!mounted.current || generation !== operation.current) {
        await api(`simulation/live/${next.id}`, undefined, undefined, "DELETE");
        return;
      }
      adopt(next);
    } catch (failure) {
      if (mounted.current) setError(liveFailure(failure));
    } finally {
      startingRef.current = false;
      if (mounted.current) setStarting(false);
    }
  }

  async function stop() {
    if (stopping) return;
    operation.current += 1;
    const id = session.current;
    pendingCamera.current = null;
    setError(null);
    if (!id) return;
    setStopping(true);
    try {
      await api(`simulation/live/${id}`, undefined, undefined, "DELETE");
      if (session.current === id) {
        session.current = null;
        setActiveId(null);
        setScene((value) => (value ? { ...value, status: "stopped" } : null));
      }
    } catch {
      if (mounted.current) setError("stopError");
    } finally {
      if (mounted.current) setStopping(false);
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
  return {
    scene,
    starting,
    stopping,
    error,
    age,
    fps,
    speed,
    start,
    stop,
    camera,
  };
}
