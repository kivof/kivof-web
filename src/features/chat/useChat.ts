"use client";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api/client";
import { parseModels, parseReply, type Turn } from "@/lib/models/chat";
import { historyTurns } from "./history";
import { useVoice } from "./useVoice";
export function useChat(locale: string) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [models, setModels] = useState<{ id: string; label: string }[]>([]);
  const [model, setModel] = useState("");
  const [loading, setLoading] = useState(true);
  const abort = useRef<AbortController | null>(null);
  const busyRef = useRef(false);
  const voice = useVoice((role, content) =>
    setTurns((previous) => [
      ...previous,
      { id: crypto.randomUUID(), role, content, voice: true },
    ]),
  );
  useEffect(() => {
    let active = true;
    void Promise.all([
      api("models").then(parseModels),
      api("chat").then(historyTurns),
    ])
      .then(([catalogue, history]) => {
        if (!active) return;
        setModels(catalogue.models);
        setModel(catalogue.defaultModel);
        setTurns(history);
      })
      .catch(() => {
        if (active) setError("history_unavailable");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      abort.current?.abort();
    };
  }, []);
  async function send(content: string) {
    if (!content.trim() || busyRef.current || !model || loading) return;
    const intent = content.startsWith("/image ") ? "image" : "chat";
    const user: Turn = { id: crypto.randomUUID(), role: "user", content };
    setTurns((previous) => [...previous, user]);
    busyRef.current = true;
    setBusy(true);
    setError("");
    const controller = new AbortController();
    abort.current = controller;
    try {
      const raw = await api(
        "chat",
        {
          messages: [...turns, user].slice(-20).map((turn) => ({
            role: turn.role,
            content: turn.content.slice(0, 12000).replace(/^\/image\s+/, ""),
          })),
          model,
          locale,
          intent,
        },
        controller.signal,
      );
      const reply = parseReply(raw);
      if (!controller.signal.aborted)
        setTurns((previous) => [
          ...previous,
          { id: reply.id, role: "assistant", content: reply.answer, reply },
        ]);
    } catch (e) {
      if (!controller.signal.aborted)
        setError(e instanceof Error ? e.message : "request_failed");
    } finally {
      if (abort.current === controller) {
        busyRef.current = false;
        setBusy(false);
      }
    }
  }
  function stop() {
    abort.current?.abort();
    busyRef.current = false;
    setBusy(false);
  }
  async function clear() {
    stop();
    voice.stop();
    try {
      await api("chat", undefined, undefined, "DELETE");
      setTurns([]);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "request_failed");
    }
  }
  return {
    turns,
    busy,
    error,
    models,
    model,
    setModel,
    send,
    stop,
    clear,
    voice,
    loading,
  };
}
