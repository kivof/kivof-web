import { parseReply, type Turn } from "@/lib/models/chat";
import { array, object, text } from "@/lib/models/chatComponents";
export function historyTurns(raw: unknown): Turn[] {
  const result = object(raw, ["items"]);
  return array(result.items, 30, 0).flatMap((record) => {
    if (!record || typeof record !== "object" || Array.isArray(record))
      throw new Error("invalid_history");
    const item = record as Record<string, unknown>;
    const reply = parseReply(item);
    const request = item.request as Record<string, unknown>;
    if (!request || !Array.isArray(request.messages))
      throw new Error("invalid_history");
    const last = [...request.messages]
      .reverse()
      .find((message) => message?.role === "user");
    if (!last) return [];
    const imageId =
      typeof item.image_id === "string" ? text(item.image_id, 128) : undefined;
    return [
      {
        id: `${reply.id}-user`,
        role: "user" as const,
        content: text(last.content, 12000, true),
      },
      {
        id: reply.id,
        role: "assistant" as const,
        content: reply.answer,
        reply,
        imageId,
      },
    ];
  });
}
