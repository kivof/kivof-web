# kivof-web

Kivof's browser workspace for simulation evidence, robot operations, data review and provider-backed conversation.

## Setup

Use Bun 1.4.2 and Node 24. Install with `bun install --frozen-lockfile`, copy `.env.example` to `.env`, configure the backend and application origins, and run `bun run dev`. Use `bun run build && bun run start` for strict-CSP browser verification; development debug tooling may require policies that production deliberately disallows.

## Configuration

Every application variable is read through `src/lib/config.ts`. `BACKEND_URL`, `BACKEND_WS_URL` and `APP_ORIGIN` are runtime addresses. `REALTIME_CALL_URL` must match the configured provider's HTTPS WebRTC calls endpoint. `SESSION_COOKIE_SECURE=true` is required on HTTPS deployments. Set it to false only for local HTTP. `KIVOF_SURFACE=product` selects the main product. The backend provisions demo credentials; no password is embedded in this application.

The frontend uses CSS Modules and shared semantic tokens in `src/styles/globals.css`. Reusable UI components are local to this repository. Translations are in `src/lib/i18n` and the deck locale modules. Offline caching stores only the explicit public offline page, never authenticated responses.

## Commands

- `bun run lint`
- `bun run test`
- `bun run build`
- `bun run start`
- `git config core.hooksPath .githooks` enables the required Gitleaks pre-commit hook.

## Containers

Build independently with `container build --tag kivof-web:local .` or `docker build --tag kivof-web:local .`. The image runs Gitleaks, lint, unit tests and dependency audit before creating Next.js standalone output. It runs as the non-root Node user. Local Compose uses this directory as its complete build context; set `WEB_IMAGE_TAG` before `docker compose up --build --wait`.

Health endpoint: `/api/health`. Main routes: `/`, `/login`, `/workspace`, `/workspace/runs`, `/workspace/sensors`, `/workspace/ontology`, `/workspace/labels`, `/workspace/simulation`, `/workspace/chat`, `/workspace/learning`, and `/deck/JO202609190900`.

Production build copies public assets and static chunks into `.next/standalone`. `bun run start` loads `.env` when present and serves that complete standalone build with Node 24. Run a new build before restarting after source changes.
