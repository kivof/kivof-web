import {
  array,
  type ChatComponent,
  type Evidence,
  object,
  parseComponent,
  parseEvidence,
  text,
} from "./chatComponents";
export type Reply = {
  id: string;
  answer: string;
  model: string;
  components: ChatComponent[];
  evidence: Evidence[];
  summary: string[];
  reviewed?: boolean;
  image?: { data: string; mime_type: string };
};
export type Turn = {
  id: string;
  role: "user" | "assistant";
  content: string;
  reply?: Reply;
  voice?: boolean;
  imageId?: string;
};
export function parseReply(raw: unknown): Reply {
  if (!raw || typeof raw !== "object" || Array.isArray(raw))
    throw new Error("invalid_response");
  const value = raw as Record<string, unknown>;
  const evidence = parseEvidence(value.evidence);
  let image: Reply["image"];
  if (value.image) {
    const source = object(value.image, ["data", "mime_type"]);
    const mime = text(source.mime_type, 40);
    const data = text(source.data, 14_000_000);
    if (
      !["image/png", "image/jpeg", "image/webp"].includes(mime) ||
      !/^[A-Za-z0-9+/=\r\n]+$/.test(data)
    )
      throw new Error("invalid_image");
    image = { data, mime_type: mime };
  }
  return {
    id: text(value.id, 128),
    answer: text(value.answer, 50000, true),
    model: text(value.model, 128),
    evidence,
    components: array(value.components ?? [], 20, 0).map((part) =>
      parseComponent(part, evidence),
    ),
    summary: array(value.summary ?? [], 12, 0).map((item) => text(item, 2000)),
    image,
    reviewed:
      (value.verification as Record<string, unknown> | undefined)?.accepted ===
        true &&
      (value.verification as Record<string, unknown> | undefined)
        ?.physical_verification === false,
  };
}
export function parseModels(raw: unknown) {
  const value = object(raw, ["defaultModel", "models"]);
  const models = array(value.models, 32).map((item) => {
    const model = object(item, ["id", "label"]);
    return { id: text(model.id, 128), label: text(model.label, 128) };
  });
  const defaultModel = text(value.defaultModel, 128);
  if (!models.some((model) => model.id === defaultModel))
    throw new Error("invalid_models");
  return { models, defaultModel };
}
