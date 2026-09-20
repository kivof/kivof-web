# syntax=docker/dockerfile:1.7
FROM oven/bun:1.4.2-alpine AS dependencies
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM zricethezav/gitleaks:v8.28.0@sha256:cdbb7c955abce02001a9f6c9f602fb195b7fadc1e812065883f695d1eeaba854 AS secret-scan
WORKDIR /repo
COPY . .
RUN gitleaks dir --no-banner --redact . && touch /tmp/gitleaks-passed

FROM dependencies AS verification
COPY --from=secret-scan /tmp/gitleaks-passed /tmp/gitleaks-passed
COPY . .
RUN bunx biome check --vcs-use-ignore-file=false && bun test && bun audit --audit-level=high

FROM verification AS builder
RUN bun run build

FROM node:24-alpine@sha256:d32cdf619f63fe0471182d08996dd516c6275bb5fd31ae06e55a570bd9e1ad43 AS runtime
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0 NEXT_TELEMETRY_DISABLED=1
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD node -e 'fetch(`http://127.0.0.1:${process.env.PORT}/api/health`).then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))'
CMD ["node", "server.js"]
