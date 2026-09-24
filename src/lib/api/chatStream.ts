import { parseReply, type Reply } from "@/lib/models/chat";

export type AssistantStage = {
  stage:
    | "manager"
    | "evidence-specialist"
    | "verifier"
    | "revision"
    | "image-generator"
    | "outcome-owner";
  status: "running" | "completed";
};
const stages = [
  "image-generator",
  "manager",
  "evidence-specialist",
  "verifier",
  "revision",
  "outcome-owner",
];
const failures = [
  "unauthorized",
  "rate_limited",
  "provider_unavailable",
  "review_rejected",
  "model_unavailable_or_output_rejected",
];
const maxBytes = 16 * 1024 * 1024;

export async function readChatStream(
  response: Response,
  onStage: (stage: AssistantStage) => void,
): Promise<Reply> {
  if (!response.ok) {
    const error = await response.json().catch(() => null);
    const code = error?.error;
    throw new Error(
      typeof code === "string" &&
        [...failures, "origin_rejected"].includes(code)
        ? code
        : "request_failed",
    );
  }
  if (
    !response.headers.get("content-type")?.includes("application/x-ndjson") ||
    !response.body
  )
    throw new Error("invalid_stream");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let size = 0;
  let events = 0;
  function event(line: string): Reply | undefined {
    if (!line.trim()) return;
    if (++events > 128) throw new Error("invalid_stream");
    const value = JSON.parse(line);
    if (!value || typeof value !== "object" || Array.isArray(value))
      throw new Error("invalid_stream");
    if (value.type === "assistant.completed") return parseReply(value.result);
    if (value.type === "assistant.failed")
      throw new Error(
        failures.includes(value.error) ? value.error : "request_failed",
      );
    if (
      value.type !== "assistant.stage" ||
      !stages.includes(value.stage) ||
      !["running", "completed"].includes(value.status)
    )
      throw new Error("invalid_stream");
    onStage({ stage: value.stage, status: value.status });
  }
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) {
        buffer += decoder.decode();
        const result = event(buffer);
        if (result) return result;
        throw new Error("incomplete_stream");
      }
      size += value.byteLength;
      if (size > maxBytes) throw new Error("stream_too_large");
      buffer += decoder.decode(value, { stream: true });
      let end = buffer.indexOf("\n");
      while (end >= 0) {
        const result = event(buffer.slice(0, end));
        buffer = buffer.slice(end + 1);
        if (result) return result;
        end = buffer.indexOf("\n");
      }
    }
  } finally {
    await reader.cancel();
  }
}

export async function streamChat(
  body: unknown,
  signal: AbortSignal,
  onStage: (stage: AssistantStage) => void,
) {
  const response = await fetch("/api/chat/stream", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/x-ndjson",
    },
    credentials: "same-origin",
    cache: "no-store",
    body: JSON.stringify(body),
    signal,
  });
  return readChatStream(response, onStage);
}
