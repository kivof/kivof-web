export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
  ) {
    super(code);
  }
}
export async function boundedText(response: Response | Request, max: number) {
  if (!response.body) return "";
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let length = 0;
  let result = "";
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > max) throw new ApiError(413, "payload_too_large");
      result += decoder.decode(value, { stream: true });
    }
    return result + decoder.decode();
  } finally {
    await reader.cancel();
  }
}
export function jsonObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new ApiError(502, "invalid_response");
  return value as Record<string, unknown>;
}
export function safeError(error: unknown) {
  return error instanceof ApiError
    ? { status: error.status, code: error.code }
    : { status: 502, code: "service_unavailable" };
}
