# TigerTail Agent Portal

External app for TigerTail's **POL (origin) agents** — e.g. Passion — to receive bookings, accept them, return carrier booking details, record origin milestones, enter container details, upload documents, flag exceptions and message about shipments. Next.js (standalone build), deployed on Railway from `main` — a push to `main` deploys to production at https://agents.tigertaillogistics.com.

All data comes from the TigerTail API (`NEXT_PUBLIC_API_URL` = `https://api.tigertaillogistics.com`, routes under `/v1/agent`). This app holds no secrets of its own. Backend code lives in `BradWa123/TigerTail-TMS` (`backend/src/routes/agent*.js`).

## Security rules — these are not optional

These exist because each one was broken once elsewhere in the platform (Oct 2026). Do not relax any of them without the owner explicitly agreeing in the conversation.

- **`NEXT_PUBLIC_*` is public.** Only URLs belong there — never a key, token, password or secret.
- Never put secrets in code, commit messages, logs, docs or git remote URLs. Never commit chat exports or notes (`/*.txt` is gitignored) or `.env*` files.
- Agents sign in with their own accounts (`X-Agent-Token`). Every page except `/` (sign in) and `/invite` is wrapped in `Shell`, which requires a signed-in agent — and the API independently enforces it. Never rely on hiding a page as the protection.
- An agent must only ever see bookings assigned to their own company. The API decides that from the session; never send an agent or booking-owner ID from the browser as the thing that decides access.
- **Agents never see TigerTail's sell rates, margins or quote costs.** If a field like that appears in an API response, that's a backend bug — fix it there.
- The customer sees the agent only as **"POL Agent"**. Remind agents in the UI that messages are visible to the customer and shouldn't contain their own contact details.
- Invite tokens arrive in the URL fragment (`/invite#token=…`) and are removed from the address bar once read. Keep it that way — never move them into a query string.
- Keep the security headers and CSP in `next.config.mjs`. `connect-src` lists only `https://api.tigertaillogistics.com`.
- Don't render API-provided strings as HTML (`dangerouslySetInnerHTML`).
- Keep `npm audit` clean. Review Dependabot PRs. Run `/security-review` before every production release.

## Conventions
- **Mobile-first.** Agents mostly use phones on the quayside and in warehouses: 44px+ tap targets, bottom tab bar on small screens, no fixed-width layouts. Test at 375px wide.
- Light theme matching the customer portal: navy `#0D1B2E`, gold accent, Inter. Use `/logo-dark.svg` on light backgrounds.
- Keep wording plain — many agents use English as a second language.
