export async function api<T = Record<string, unknown>>(
  path: string,
  body?: unknown,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(`/api/${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: "same-origin",
    cache: "no-store",
    signal,
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(
      typeof data.error === "string" ? data.error : "request_failed",
    );
  return data as T;
}
