# OTI Project Task Log

## Legend
- ✅ Done (Manager verified)
- 🔄 In Progress
- ⬜ Pending
- 🔵 Backend task

---

## Completed Tasks

### ✅ Task 7B — txCount Cap Indicator
Confirmed done by Manager (July 7, 2026).

### ✅ Task 7C — Dynamic Rate Limit Display
Homepage shows live DB value from /api/config/anonymous-limit. Confirmed live showing "20 per day". Falls back to architectural default of 3 when DB returns null.

### ✅ Task 9 — Admin Panel UI
Full admin panel implemented and confirmed working live by Manager (July 7, 2026).

### ✅ Task 10 — Navbar API Health Status Dot
Confirmed done by Manager (July 7, 2026).

### ✅ Plan Configs Tab (Admin Panel)
PATCH /admin/plan-configs/{plan_name} with clean body (description omitted when empty). Invalidates both admin and public anonymous-limit queries on success.

### ✅ Admin Panel Desktop Layout Fix
CSS `:has()` selector removes max-width/padding constraints from `.app-main` when admin shell is present. Full-width layout on desktop.

### ✅ useAnonymousLimit Hook Fix
Was calling admin-protected endpoint on public homepage. Fixed to call correct public endpoint GET /api/config/anonymous-limit.

### ✅ Homepage Scrollbar + Layout Fix
Switched to browser-level scroll. Navbar sticky. Rate note pinned to bottom of viewport.

### ✅ API Keys Tab — UI Resilience Fix
Header and Create Key button always visible. Error renders inline with Retry button. Confirmed working (create/list/edit/delete) — Manager verified July 7, 2026.

### Fix: API Key Reveal on Creation ✅
- POST /api/admin/keys response field corrected: `data.apiKey` → `data.api_key`
- TypeScript interface updated to match: `apiKey: string` → `api_key: string`
- Modal now displays full key after creation with copy button and "never shown again" warning
- Verified live on Vercel by Manager

### Task 11A — Restructure Vercel App: Marketing Front Door + Scoring at /score ✅
Confirmed live and verified by Manager (July 8, 2026). `/` now shows the full marketing homepage (8 sections); `/score` shows the scoring tool exactly as before, zero visual changes. Full build notes in `FRONTEND_TASKS.md`.

### Task 8 — Professional Results Page Redesign ✅
- Score panel in bordered card — ring gauge color matches chain brand (all 15 chains)
- Tier label beneath gauge: HIGHLY TRUSTED / TRUSTED / CAUTION / SUSPICIOUS / HIGH RISK
- Trust Signals in separate bordered card with heading; each signal shows label, metadata, fraction, colored bar
- Wallet address truncated (0xAb58...eC9B) with copy button; chain icon + name displayed
- Share — native OS share sheet with clipboard fallback
- Save as Image — 3× scale PNG (1920×2580px), chain-color ring, tier label, mirrors live UI
- "⚑ Report this wallet" ghost link in mint — WOR placeholder
- Footer: "© 2026 OpenFlow Labs · openflowlabs.io"
- Full color system upgrade (see OTI Color System section)
- Verified live on Vercel by Manager — July 7, 2026

### ✅ Task 11B — Whitepaper Page (Manager verified July 8, 2026)
Route `/whitepaper` — full whitepaper with 13 sections, sticky TOC sidebar, mobile accordion TOC, print stylesheet (A4). Post-build fixes: white body text, mobile horizontal scroll eliminated (table overflow wrappers), Roadmap section removed and sections renumbered (Team=12, Contact=13), scroll-spy TOC highlighting, back-to-top button, `~16 min read` header badge, reading progress bar.

---

## Active Tasks

Nothing else currently active.

---

## Completed Tasks

### ✅ Task 11 — Developer Docs Site (Docusaurus) (Manager verified July 9, 2026)
Started July 8, 2026. Docusaurus 3.10.1 classic project scaffolded at `oti-docs/`. Six sections completed: Getting Started, API Reference, Score Explanation, Supported Chains, Rate Limits & Plans, Code Examples. OTI branding applied (dark #05080f, mint #00e5a0, dark mode default). Anonymous limit verified live (100/day). All chain IDs verified from live API. Deployed as its own Vercel project (oti-docs.vercel.app); main site's vercel.json rewrites `/docs`, `/docs/`, and `/docs/:path*` to it. Fixed baseUrl (`/docs/`) and docs.routeBasePath (`''`) to resolve a root-page 404 caused by the routeBasePath/baseUrl interaction. Manager confirmed live in production: otiscore.vercel.app/docs, /docs/, and /docs/api-reference all working.

---

## Pending Tasks

### ⬜ 🔵 Task 9C — Plan Limit Enforcement Verification (Backend task, Frontend aware)
Backend Builder verifying `daily_limit` enforcement across all plan types (free, pro, enterprise). No frontend changes needed.
