"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { type AssistantStage, streamChat } from "@/lib/api/chatStream";
import { api } from "@/lib/api/client";
import type { Turn } from "@/lib/models/chat";
import { useChatStartup } from "./useChatStartup";
import { useVoice } from "./useVoice";
export function useChat(locale: string) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [busy, setBusy] = useState(false);
  const [stages, setStages] = useState<AssistantStage[]>([]);
  const [error, setError] = useState("");
  const touched = useRef(false);
  const restore = useCallback((history: Turn[]) => {
    if (!touched.current) setTurns(history);
  }, []);
  const startup = useChatStartup(restore);
  const abort = useRef<AbortController | null>(null);
  const busyRef = useRef(false);
  const voice = useVoice((role, content) => {
    touched.current = true;
    setTurns((previous) => [
      ...previous,
      { id: crypto.randomUUID(), role, content, voice: true },
    ]);
  });
  useEffect(
    () => () => {
      abort.current?.abort();
    },
    [],
  );
  async function send(content: string) {
    if (!content.trim() || busyRef.current || !startup.model || startup.loading)
      return false;
    const intent = content.startsWith("/image ") ? "image" : "chat";
    const user: Turn = { id: crypto.randomUUID(), role: "user", content };
    touched.current = true;
    setTurns((previous) => [...previous, user]);
    busyRef.current = true;
    setBusy(true);
    setStages([]);
    setError("");
    const controller = new AbortController();
    abort.current = controller;
    try {
      const reply = await streamChat(
        {
          messages: [...turns, user].slice(-20).map((turn) => ({
            role: turn.role,
            content: turn.content.slice(0, 12000).replace(/^\/image\s+/, ""),
          })),
          model: startup.model,
          locale,
          intent,
        },
        controller.signal,
        (stage) => {
          if (!controller.signal.aborted)
            setStages((previous) => [
              ...previous.filter((item) => item.stage !== stage.stage),
              stage,
            ]);
        },
      );
      if (!controller.signal.aborted)
        window.dispatchEvent(new Event("kivof:workspace-changed"));
      if (!controller.signal.aborted)
        setTurns((previous) => [
          ...previous,
          { id: reply.id, role: "assistant", content: reply.answer, reply },
        ]);
      return !controller.signal.aborted;
    } catch (e) {
      setTurns((previous) => previous.filter((turn) => turn.id !== user.id));
      if (!controller.signal.aborted)
        setError(e instanceof Error ? e.message : "request_failed");
      return false;
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
    touched.current = true;
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
    stages,
    error,
    ...startup,
    send,
    stop,
    clear,
    voice,
  };
}
