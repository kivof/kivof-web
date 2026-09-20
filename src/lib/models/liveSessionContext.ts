export function liveSessionContext(
  value: unknown,
  current: string | null,
):
  | {
      state: "active";
      id: string;
    }
  | { state: "empty" | "stopped" | "unavailable" } {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return { state: "unavailable" };
  const context = value as Record<string, unknown>;
  const id = context.current_live_session;
  if (typeof id === "string" && /^[a-zA-Z0-9_-]{1,128}$/.test(id))
    return { state: "active", id };
  if (id !== null) return { state: "unavailable" };
  if (!current) return { state: "empty" };
  const own = Array.isArray(context.live)
    ? (context.live.find(
        (item: unknown) =>
          item !== null &&
          typeof item === "object" &&
          !Array.isArray(item) &&
          (item as Record<string, unknown>).id === current,
      ) as Record<string, unknown> | undefined)
    : undefined;
  return {
    state:
      own?.status === "stopped" || own?.status === "failed"
        ? "stopped"
        : "unavailable",
  };
}
