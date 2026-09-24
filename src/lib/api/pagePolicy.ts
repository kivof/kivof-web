const DECK_PATH = "/deck/JO202609240900";

export function pagePolicy(path: string, frameOrigins: string[]) {
  const deck = path === DECK_PATH;
  const workspace = path === "/workspace" || path.startsWith("/workspace/");
  return {
    frameSources: deck ? ["'self'", ...frameOrigins].join(" ") : "'none'",
    frameAncestors: workspace ? "'self'" : "'none'",
    frameOptions: workspace ? "SAMEORIGIN" : "DENY",
    // Vimeo and the recorded replay run in their own origin without COEP.
    embedderPolicy: deck || workspace ? "unsafe-none" : "require-corp",
  };
}
