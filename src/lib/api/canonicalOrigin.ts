export function canonicalPageUrl(request: Request, origin: string | undefined) {
  if (!origin || !["GET", "HEAD"].includes(request.method)) return undefined;
  const current = new URL(request.url);
  if (/^\/(?:api|_next)(?:\/|$)/.test(current.pathname)) return undefined;
  const document =
    request.headers.get("sec-fetch-dest") === "document" ||
    request.headers.get("accept")?.includes("text/html");
  if (!document) return undefined;

  const destination = new URL(origin);
  // Azure preserves Host; caller-supplied forwarded headers cannot choose a target.
  const host = (request.headers.get("host") ?? current.host).toLowerCase();
  if (host === destination.host) return undefined;
  destination.pathname = current.pathname;
  destination.search = current.search;
  return destination;
}
