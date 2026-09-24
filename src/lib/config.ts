function checkedUrl(value: string | undefined, protocols: string[]) {
  if (!value) return undefined;
  const url = new URL(value);
  if (!protocols.includes(url.protocol) || url.username || url.password)
    throw new Error("Invalid service configuration");
  return url.toString().replace(/\/$/, "");
}

export function checkedFrameOrigins(value: string | undefined): string[] {
  if (!value) return [];
  return [
    ...new Set(
      value.split(",").map((entry) => {
        const input = entry.trim();
        const url = new URL(input);
        if (
          !/^https:\/\/[^/?#\\\s]+\/?$/i.test(input) ||
          url.protocol !== "https:" ||
          !/^(?:[a-z0-9.-]+|\[[a-f0-9:]+\])$/i.test(url.hostname) ||
          url.username ||
          url.password ||
          url.pathname !== "/" ||
          url.search ||
          url.hash
        )
          throw new Error("Invalid deck frame origin");
        return url.origin;
      }),
    ),
  ];
}

export function config() {
  return {
    deckFrameOrigins: checkedFrameOrigins(process.env.DECK_FRAME_ORIGINS),
    backend: checkedUrl(process.env.BACKEND_URL, ["http:", "https:"]),
    events: checkedUrl(process.env.BACKEND_WS_URL, ["ws:", "wss:"]),
    origin: checkedUrl(process.env.APP_ORIGIN, ["http:", "https:"]),
    realtime: checkedUrl(process.env.REALTIME_CALL_URL, ["https:"]),
    secureCookie: process.env.SESSION_COOKIE_SECURE !== "false",
    demoLoginEnabled: process.env.DEMO_LOGIN_ENABLED === "true",
    surface: process.env.KIVOF_SURFACE ?? "product",
    cookieName: "kivof_session",
    sessionSeconds: 8 * 60 * 60,
    maxBodyBytes: 512 * 1024,
    maxResponseBytes: 16 * 1024 * 1024,
  };
}
