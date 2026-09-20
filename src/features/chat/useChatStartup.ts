"use client";
import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import { parseModels, type Turn } from "@/lib/models/chat";
import { historyTurns } from "./history";

export function useChatStartup(restore: (turns: Turn[]) => void) {
  const [models, setModels] = useState<{ id: string; label: string }[]>([]);
  const [model, setModel] = useState("");
  const [loading, setLoading] = useState(true);
  const [modelsError, setModelsError] = useState(false);
  const [historyError, setHistoryError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  // biome-ignore lint/correctness/useExhaustiveDependencies: Retrying intentionally starts a fresh pair of requests.
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setModelsError(false);
    setHistoryError(false);
    void api("models", undefined, controller.signal)
      .then(parseModels)
      .then((catalogue) => {
        if (controller.signal.aborted) return;
        setModels(catalogue.models);
        setModel((previous) =>
          catalogue.models.some((item) => item.id === previous)
            ? previous
            : catalogue.defaultModel,
        );
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setModelsError(true);
        setModels([]);
        setModel("");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    void api("chat", undefined, controller.signal)
      .then(historyTurns)
      .then((history) => {
        if (!controller.signal.aborted) restore(history);
      })
      .catch(() => {
        if (!controller.signal.aborted) setHistoryError(true);
      });
    return () => controller.abort();
  }, [attempt, restore]);
  return {
    models,
    model,
    setModel,
    loading,
    modelsError,
    historyError,
    retry: () => setAttempt((value) => value + 1),
  };
}
