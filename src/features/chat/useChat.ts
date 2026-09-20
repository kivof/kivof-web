"use client";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api/client";
import { parseModels, parseReply, type Turn } from "@/lib/models/chat";
import { useVoice } from "./useVoice";
export function useChat(locale: string) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [models, setModels] = useState<{ id: string; label: string }[]>([]);
  const [model, setModel] = useState("");
  const abort = useRef<AbortController | null>(null);
  const voice = useVoice((role, content) =>
    setTurns((previous) => [
      ...previous,
      { id: crypto.randomUUID(), role, content, voice: true },
    ]),
  );
  useEffect(() => {
    void api("models")
      .then(parseModels)
      .then((catalogue) => {
        setModels(catalogue.models);
        setModel(catalogue.defaultModel);
      })
      .catch(() => setModels([]));
    return () => abort.current?.abort();
  }, []);
  async function send(content: string) {
    if (!content.trim() || busy || !model) return;
    const intent = content.startsWith("/image ") ? "image" : "chat";
    const user: Turn = { id: crypto.randomUUID(), role: "user", content };
    setTurns((previous) => [...previous, user]);
    setBusy(true);
    setError(false);
    const controller = new AbortController();
    abort.current = controller;
    try {
      const raw = await api(
        "chat",
        {
          messages: [...turns, user].slice(-30).map((turn) => ({
            role: turn.role,
            content: turn.content.replace(/^\/image\s+/, ""),
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
    } catch {
      if (!controller.signal.aborted) setError(true);
    } finally {
      setBusy(false);
    }
  }
  function stop() {
    abort.current?.abort();
    setBusy(false);
  }
  function clear() {
    stop();
    voice.stop();
    setTurns([]);
    setError(false);
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
  };
}
