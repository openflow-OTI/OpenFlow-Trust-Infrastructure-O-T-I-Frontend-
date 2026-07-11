# OTI — Master Task List
> Last updated: July 10, 2026 (session 8 — full rewrite. Per Ahmad's instruction, this file now only contains genuine new-build tasks (new pages, new systems, new features). All bug fixes, corrections, hardening, and cleanup/polish work — including the former Task 11C and Task 11E — have moved to `FIXES.md`, numbered and split by Builder there. If you're looking for a fix rather than a new build, check `FIXES.md` first.) | Maintained by: Development Manager

---

## How to Read This File

This is the complete history and queue of everything either Builder has built or will build — new pages, new systems, new features. Each Builder also has their own copy of just their tasks (`BACKEND_TASKS.md` / `FRONTEND_TASKS.md`) with full prompt text. Bug fixes and cleanup work are tracked separately in `FIXES.md`.

## Builder Roles

- **Backend Builder** — Node.js/Express API on Railway, scoring engine, database, admin routes, bots
- **Frontend Builder** — React/Vite app on Vercel, scoring UI, marketing site, docs site, admin panel UI

---

## ✅ Completed Tasks

### TASK 8 — Frontend: Professional Results Page Redesign ✅
Full visual rebuild of the wallet score results page to the locked black/mint design system: chain-color ring gauge, score tier labels (HIGHLY TRUSTED → HIGH RISK), Trust Signals card with weighted bars, truncated wallet address with copy button, Share (native share sheet) + Save as Image (3× PNG export), "⚑ Report this wallet" placeholder link (activates once WOR/Phase 2 ships), footer. This redesign also established the OTI color system (see `BUILDER_ONBOARDING.md` for the locked token table) that every subsequent page must use.

### TASK 8B — Frontend: Professional Wallet Input Page Redesign ✅
Matching redesign of the wallet input/landing screen to the same visual system — logo sizing/position, chain icon visibility and sizing (including zkSync/Linea), spacing, report-link styling. Verified live.

### TASK 9 — Frontend: Admin Panel UI ✅
Built the full admin panel: login, Dashboard, API Keys (create/list/edit/delete with a reveal-once creation modal), Query History, Cache management, Plan Configs. URL-only route (no public nav link), per Ahmad's decision.

### TASK 9-BACKEND — Backend: Admin Panel API Routes ✅
Built the `/api/admin/*` route surface backing Task 9 — stats, keys CRUD, plan configs CRUD, query history, cache inspection — all behind the `x-admin-secret` auth (`FIXES.md` BF5).

### TASK 11A — Frontend: Marketing Homepage + Restructure Vercel App ✅
Restructured the single Vercel app into a proper front door: the scoring tool moved intact to `/score`, and `/` became a full marketing homepage — Hero, chain row, How It Works, Trust Signals, Use Cases, Get the API (cURL example), Find Us/Integrations, footer with social links. Crisp.chat chat widget embedded (ID left blank until Ahmad provides it). Live at `otiscore.vercel.app`. Verified by Manager via cache-busted screenshot + JS bundle inspection, and by Ahmad directly.

### TASK 11B — Frontend: Whitepaper Page ✅
Built `/whitepaper` — full-length technical/business document (Executive Summary through remaining sections), sticky table-of-contents sidebar on desktop (accordion on mobile), section numbers in mint, print-to-PDF support via `window.print()`, shares the homepage's nav/footer and color system. Three post-launch rendering issues (body text color, mobile horizontal scroll, Roadmap section removal) were fixed — see `FIXES.md` FF16.

### TASK 11 — Frontend: Developer Docs Site ✅
Docusaurus site covering Getting Started, API Reference (weighted signal shape), Score Explanation, Supported Chains, Rate Limits, and code examples in JS/Python/cURL. Deployed as its own Vercel project (`oti-docs`, pnpm-based build) and proxied onto the main site at `otiscore.vercel.app/docs/` via `vercel.json` rewrites. Confirmed fully live July 9, 2026 — `/docs`, `/docs/`, and `/docs/api-reference` all verified 200 via curl. One open follow-up in `FIXES.md` (BF11 — re-verify "Try It Live" widget against the real backend).

---

## 🔴 Active Queue

Nothing is currently queued as a new-build task for either Builder. **Backend Builder** is idle — `FIXES.md` BF10 (Signal Accuracy Audit) is scoped but has NOT been sent yet, so it hasn't started; once sent it becomes the active item and nothing new goes to Backend Builder until it's verified done. **Frontend Builder** is idle, awaiting Ahmad's priority call on `FIXES.md` FF17 (AI-native tell cleanup) versus starting the next real task below.

---

## ⛔ PHASE 5 GATE — Distribution Channel Tasks Below Depend On Phase 1 Being Fully Closed

Every bot reply, widget badge, and extension popup links back to the marketing homepage, docs site, and whitepaper. Do not start any task below until Ahmad confirms Phase 1 (see `ROADMAP.md`) is fully closed — including the two open Phase 1 fixes in `FIXES.md` (BF11, FF17).

### TASK 12 — Backend: Telegram Bot
Telegraf (Node.js) bot in `/bots/telegram/` inside the backend repo, deployed as a second Railway process. Commands: `/score [address] [chain]`, `/help`, `/about`. Env vars needed: `TELEGRAM_BOT_TOKEN`, `OTI_BOT_API_KEY`. See `ROADMAP.md` Phase 5 for full context.

### TASK 13 — Backend: Discord Bot
discord.js bot in `/bots/discord/`, deployed as a third Railway process. Slash commands `/score`, `/help`, rich embed responses. Env vars needed: `DISCORD_BOT_TOKEN`, `DISCORD_CLIENT_ID`, `OTI_BOT_API_KEY`.

### TASK 14 — Backend: Embeddable Widget
Vanilla JS, zero-dependency widget served from Railway at `GET /widget.js`. One-line integration snippet for site owners. Uses a shared widget API key.

### TASK 15 — Frontend/Extension: Firefox Extension (then Chrome)
Separate GitHub repo (`oti-firefox-extension`). Content script auto-detects wallet addresses on Etherscan/OpenSea/BscScan and injects a score badge. Firefox first (free to publish), Chrome after first revenue. No backend changes required.

---

## Not Yet Scoped Into Task Prompts

These exist in `ROADMAP.md` as phases but have not yet been broken into individual task prompts for a Builder:

- **Phase 2 — Wallet Ownership Registry (WOR):** `wallet_ownership` table, registration/report endpoints, EIP-191 verification (Backend); registration + report UI (Frontend).
- **Phase 3 — Monetization infrastructure:** self-serve developer portal, Pro/Enterprise plan rows + checkout, Stripe + Coinbase Commerce integration.
- **Phase 4 — Growth features:** score history UI, multi-chain wallet comparison, wallet portfolio view, webhook alerts, enterprise exchange compliance path.

---

## Keeping This File Updated

Both Builders update this file — but only when the Manager explicitly tells them to (marking a task ✅, or adding a newly assigned task). Builder copies (`BACKEND_TASKS.md`, `FRONTEND_TASKS.md`) are separate physical files that never auto-sync with this one or with each other — every status change must be explicitly relayed to the relevant Builder.
