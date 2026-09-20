function checkedUrl(value: string | undefined, protocols: string[]) {
  if (!value) return undefined;
  const url = new URL(value);
  if (!protocols.includes(url.protocol) || url.username || url.password)
    throw new Error("Invalid service configuration");
  return url.toString().replace(/\/$/, "");
}

export function config() {
  return {
    backend: checkedUrl(process.env.BACKEND_URL, ["http:", "https:"]),
    events: checkedUrl(process.env.BACKEND_WS_URL, ["ws:", "wss:"]),
    origin: checkedUrl(process.env.APP_ORIGIN, ["http:", "https:"]),
    realtime: checkedUrl(process.env.REALTIME_CALL_URL, ["https:"]),
    secureCookie: process.env.SESSION_COOKIE_SECURE !== "false",
    surface: process.env.KIVOF_SURFACE ?? "product",
    cookieName: "kivof_session",
    sessionSeconds: 8 * 60 * 60,
    maxBodyBytes: 64 * 1024,
    maxResponseBytes: 16 * 1024 * 1024,
  };
}
