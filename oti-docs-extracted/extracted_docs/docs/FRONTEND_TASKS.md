# OTI — Frontend Builder Task List
> Last updated: July 6, 2026 | Maintained by: Development Manager

> **This file contains your tasks only. Read BUILDER_ONBOARDING.md and ARCHITECTURE.md before starting anything here.**
> Build in the exact order listed. Some tasks have hard dependencies — do not start them until the dependency is confirmed merged and deployed.

---

## ✅ Your Completed Tasks

### Task 1 — UI Polish
- Homepage title, back button style, chain icon sizing, dead CSS removed, `isKnownChain()` guard in `useScore.ts`

### Task 2 — Logo Fix
- `Logo.tsx` → `<img src="/logo.jpg">` replacing spiral SVG math
- `generateScoreCard.ts` → uses `loadImage()` before canvas draw

### Task 2B — Logo: SVG Replace ✅
- Used the original SVG logo file directly as public/logo.svg
- Crisp and sharp at all sizes, zero blur on Retina/high-DPI screens
- generateScoreCard.ts points to /logo.svg — score card PNG uses real logo

### Task 7 — Signal Bars → Weighted Display ✅
- pnpm codegen run — src/api/schema.gen.ts regenerated from live backend spec
- SignalBar.tsx updated: bar fill = (weighted / maxWeight) × 100%, label = "weighted/maxWeight"
- Color logic updated to use weighted / maxWeight ratio
- Home.tsx updated to pass full signal object to SignalBar
- generateScoreCard.ts updated — score card PNG shows weighted labels and correct fills
- Verified live on Vercel — all 5 bars showing weighted values
- Also resolved black screen crash caused by Task 5 API shape mismatch

### Task 7B — txCount Cap Indicator ✅
- formatMetadata.ts updated: txCount >= 1000 displays "1,000+ transactions" instead of "1,000 transactions"
- generateScoreCard.ts updated with same logic so score card PNG stays consistent with UI
- Verified live on Vercel — confirmed by Manager

---

## 🔴 Your Task Queue — Build In This Exact Order

---

### TASK 7B — txCount Cap Indicator
**Phase:** 1 — Bug Fixes
**Priority:** LOW
**Depends on:** Nothing — can be done alongside Task 2B

**Why you are doing this:**
Etherscan's free API tier caps transaction counts at 1,000. So when a wallet has 5,000 transactions, the API returns 1,000 — and OTI currently displays "1000 transactions" as if that's the real number. This misleads users into thinking the wallet is less active than it really is. Displaying "1,000+ transactions" is an honest signal that the wallet has at minimum that many transactions, and the actual number may be higher.

**What to build:**
In the results page, the signal bar subtitle for Transaction Count shows the raw `txCount` from the API `metadata`. When `metadata.txCount >= 1000`, display `"1,000+ transactions"` instead of `"1000 transactions"`. This communicates to users that Etherscan's free tier caps the count and the actual volume may be higher.

**Definition of done:** A wallet with txCount=1000 shows "1,000+ transactions" in the Transaction Count signal subtitle.

---

### TASK 7C — Dynamic Rate Limit Display ⏸ ON HOLD
**Phase:** 2 — Operational
**Priority:** MEDIUM
**Depends on:** Nothing — reads from existing API

**Why you are doing this:**
The homepage currently hardcodes the text "Anonymous lookups are limited to 3 per day." That number is stored in the `plan_configs` database table and Ahmad can change it at any time — for example, to run a promotion with higher limits, or to tighten limits as traffic grows. Every time the limit changes, someone would have to manually update the frontend and redeploy just to change one number. This fix makes the frontend read the live value from the API so it always reflects the real current limit automatically.

**What to build:**
Call `GET /api/healthz` or a suitable endpoint to fetch the anonymous plan's `daily_limit` from the backend and display it dynamically. If the fetch fails, fall back to showing "limited per day" without a number. This ensures the text stays accurate when the `plan_configs` table is updated without needing a frontend redeploy.

**Definition of done:** Homepage rate limit text reflects the live `anonymous` plan's daily_limit. Changing the value in the database updates what the homepage shows automatically.

**ON HOLD — reason:** Backend currently returns `daily_limit: null` — Ahmad is running unlimited manual tests on the live site and will set a real limit later via the Admin Panel (Task 9). There is also an unresolved backend design question about how the limit should behave going forward. Frontend work is complete: `useAnonymousLimit.ts` hook + `Home.tsx` fallback logic are correct and will start working automatically once the backend returns a real number. Paused until Task 7C-BACKEND resumes.

---

### Task 10 — API Health Status Indicator ✅
- src/hooks/useHealth.ts connected to Navbar.tsx
- 7px status dot in top-right: green (online), red (offline), hidden (loading)
- Pulsing ring animation via GPU-accelerated transform + opacity pseudo-element
- Accessible: role="status", aria-live="polite", sr-only text label
- Verified live on Vercel — confirmed by Manager

---

### TASK 10 — API Health Status Indicator
**Phase:** 2 — Operational
**Priority:** LOW
**Depends on:** Nothing — the hook already exists

**Why you are doing this:**
When Railway has an outage or the backend is restarting after a deploy, users currently just see a confusing error when they try to score a wallet — with no indication of whether the problem is on their end or OTI's. A small status dot in the navbar tells users instantly whether the API is up, so they know to wait rather than keep trying. The hook that checks the API health (`useHealth.ts`) is already fully built — it just isn't connected to any component yet. This task is a quick win.

**What to build:**
The `src/hooks/useHealth.ts` hook already exists and pings `GET /api/healthz`. Connect it to a small status indicator in the Navbar (`src/components/Navbar.tsx`).

Display: a small colored dot (6–8px circle) in the top-right of the navbar.
- Green dot = API is responding (`status: "ok"`)
- Red dot = API is unreachable (error state)
- No dot / pulsing = loading

Tooltip on hover: "API online" or "API offline". Keep it subtle — it should not distract from the main content.

**Definition of done:** Navbar shows a green dot when Railway API is up, red when it's down. Verified by checking the deployed frontend.

---

### TASK 9 — Admin Panel UI
**Phase:** 2 — Operational
**Priority:** HIGH
**Depends on:** ⚠️ Backend Task 3 (admin auth) AND Backend Task 6 (updatedAt migration) must both be merged and deployed first — do not start until the Manager confirms both are done

**Why you are doing this:**
Once bots launch (Phase 5), OTI will start getting real traffic — developers signing up for API keys, wallets being scored at volume, cache needing management. Ahmad needs a control panel to manage all of this without touching the database directly. The admin panel is the operational nerve center. It must be ready before bots launch. It depends on Task 3 because every admin API call requires the `x-admin-secret` header — without auth, there is no admin panel worth building. It depends on Task 6 because the API Keys screen shows a "last modified" column that requires the `updated_at` database column to exist.

**What to build:**
Add a `/admin` route to the React app. It is URL-only — no navigation link anywhere in the app. On load, it shows a simple password prompt (reads `VITE_ADMIN_SECRET` from Vercel environment variables, stored in sessionStorage after entry). Wrong password = locked view.

Screens to build:
1. **Dashboard** — total queries today/week/month, active keys count, cache hit rate (from `GET /admin/stats`)
2. **API Keys** — table of all keys with plan, usage today, last used, active/suspended status. Actions: create new key (form: email, plan, daily limit), edit (change plan/limit/status), delete. (`GET /admin/keys`, `POST /admin/keys`, `PATCH /admin/keys/:id`, `DELETE /admin/keys/:id`)
3. **Query History** — recent wallet lookups: address, chain, score, timestamp (`GET /admin/history`)
4. **Cache** — a single "Flush Cache" button (`POST /admin/cache/flush`)

All API calls must include the `x-admin-secret` header (read from sessionStorage). Style consistently with the existing black + mint design system. Plain HTML tables are fine — no table library required.

**Definition of done:** `/admin` route works. Password gates all screens. All 4 screens render real data from the backend. Cache flush button works.

---

### TASK 8 — Professional Results Page Redesign
**Phase:** 3 — Redesign
**Priority:** HIGH — MVP requirement, Ahmad's explicit request
**Depends on:** Task 7 (signal bars must be correct first) AND Task 2B (SVG logo must be done first)

**Why you are doing this:**
The results page is the first thing a potential enterprise partner, developer, or investor sees after they score a wallet. Right now it doesn't look professional enough to represent OTI as the infrastructure business it is. Ahmad has explicitly flagged this as an MVP requirement — the product must be presentable before any distribution channel launches or any business conversation happens. This redesign does not change any logic — only the visual presentation and layout.

**What to build:**
Redesign the scoring results page (`src/pages/Home.tsx` results section and related components). Keep: the black background, the mint green color scheme, the chain selector (do not touch it), the score gauge color system. Keep the "← Score Another Wallet" button.

Required changes:

1. **Wallet address:** Truncate the middle — show `0xAb58...eC9B` format (first 6 + last 4 chars). Add a copy-to-clipboard icon button next to it.

2. **Score tier label:** Add a label below the score gauge:
   - 85–100 → "HIGHLY TRUSTED" (mint green)
   - 65–84 → "TRUSTED" (light green)
   - 45–64 → "CAUTION" (amber)
   - 25–44 → "SUSPICIOUS" (orange)
   - 0–24 → "HIGH RISK" (red)

3. **Signal section:** Add a section header "Trust Signals" above the signal bars. Each signal bar now shows `weighted/maxWeight` as the score label (from Task 7). Add visual card/panel separation between the score gauge section and the signals section.

4. **Share button:** Make it larger and more prominent — mint green border, full width or centered with min-width, not a tiny button buried at the bottom.

5. **Footer:** Add a minimal footer: "© 2026 OpenFlow Labs · openflowlabs.io"

6. **Report this wallet:** Add a small ghost link below the signals section: "⚑ Report this wallet" — it should do nothing for now (disabled or href="#") but must be present for the WOR system to connect to later.

7. **Empty space:** The large void below the share button must be eliminated. Use the footer to anchor the bottom.

Keep all CSS in `src/index.css`. Do not add a new component library. Follow existing class naming conventions.

**Definition of done:** Results page looks professional on both mobile (375px) and desktop. Wallet address is truncated. Score tier label is visible. Signal bars show weighted values. Share button is prominent. Footer exists. "Report this wallet" link is present.

---

### TASK 11A — Restructure Vercel App: Marketing Front Door + Scoring at /score
**Phase:** 4 — Pre-Distribution
**Priority:** HIGH
**Depends on:** Task 8 (results redesign done) AND Task 2B (SVG logo done)

**Why you are doing this:**
Right now, anyone who visits `otiscore.vercel.app` lands directly on the scoring tool with no context about what OTI is, why it matters, or who built it. Every bot reply, every widget badge, every browser extension popup will link back to this URL. Without a proper front door, that traffic converts to nothing — developers and partners arrive, see a form, and leave. The marketing homepage gives OTI's story, explains the product, and converts curious visitors into API users and potential business partners. The scoring tool moves to `/score` — nothing about it changes visually. One Vercel project, one URL, two purposes.

**Part A — Move the scoring tool to `/score`**

Move the current homepage (wallet address form + results) to the `/score` route. Update `vercel.json` carefully — the SPA rewrite rule `{"source":"/(.*)", "destination":"/index.html"}` must stay intact; do not remove or break it. Update any internal links that currently point to `/`.

**Part B — Build the marketing homepage at `/`**

Brand system:
- Primary mint: `#3EFFC1` (outer/bright), `#2BD9A4` (inner/deeper)
- Background: `#0A0A0A` deep black
- Typography: Geist Sans or Inter — clean, geometric, modern
- Micro-interaction: the spiral logo rotates subtly on hover (CSS `transform: rotate()`, 2–3s ease, infinite)
- All CTAs, highlights, active states: mint only

Sections to build:

**1. Navbar**
- Left: OTI spiral logo (34px) + "OTI" wordmark in white
- Right: "Score a Wallet" button (mint outline) → `/score`; "API Docs" text link → placeholder `#`
- Mobile: hamburger with same links

**2. Hero**
- Headline: "Know Who You're Transacting With"
- Sub-headline: "OTI scores any blockchain wallet 0–100 using five on-chain trust signals. Instant. Free. API-ready."
- CTAs: "Try It Free" (mint filled → `/score`), "View API Docs" (ghost → `#`)
- Faint watermark spiral behind headline (CSS only, no JS library)
- Chain row below CTAs: small chain icons for ETH, SOL, BTC, TON, MATIC, ARB, SUI, TRX + "+7 more" badge

**3. How It Works (3 steps)**
- Step 1: Enter wallet address + select chain
- Step 2: OTI analyzes 5 on-chain behavioral signals
- Step 3: Get a 0–100 trust score with full signal breakdown
- Style: numbered cards, horizontal row on desktop, vertical stack on mobile

**4. Trust Signals (5 cards)**
- 🕐 Wallet Age (25%) — "How long this wallet has been active on-chain"
- 📊 Transaction Count (20%) — "Volume and frequency of transactions"
- 🪙 Token Holding Behavior (20%) — "Diversity and quality of tokens held"
- 🔗 Smart Contract Interactions (20%) — "Depth of DeFi and protocol engagement"
- ⏱ Transaction Timing (15%) — "Consistency and naturalness of activity patterns"

**5. Use Cases (tile grid — 3 cols desktop, 2 tablet, 1 mobile)**

| Tile | Sector | Body |
|---|---|---|
| 💱 | Exchanges & Gateways | Flag compromised wallets before processing withdrawals. |
| 🏦 | DeFi Protocols | Risk-adjust lending and collateral requirements based on wallet trust. |
| 🖼 | NFT Marketplaces | Display trust badges next to seller listings. |
| 💸 | Payment Processors | Require a minimum trust score before processing. |
| 🎮 | Web3 Gaming | Prevent fresh-wallet farming in Play-to-Earn. |
| 🗳 | DAO Governance | Weight votes by wallet trust alongside token balance. |
| 🔐 | Custody Services | Score source wallets before crediting accounts. |
| 📡 | Bridges & Cross-chain | Score the source wallet before allowing a bridge transaction. |
| 🛠 | Developer Tooling | One API call. Any chain. No blockchain infrastructure required. |

**6. Get the API**
- Headline: "Free API Key. No Credit Card."
- Sub-line: "Anonymous: 3 lookups/day. Register free for higher limits."
- cURL example block (copy-pasteable)
- CTA: "Read the Docs" → `#` placeholder

**7. Find Us / Integrations**
Row of icons with labels: Telegram, Discord, Chrome Extension, Firefox Extension — all `#` placeholder links

**8. Footer**
- Left: OTI spiral logo (small) + "© 2026 OpenFlow Labs"
- Center: Score a Wallet · API Docs · GitHub (public frontend repo link) · Privacy Policy (placeholder) · Terms (placeholder)
- Right: Social icons — Twitter/X, LinkedIn, Telegram, Discord (all `#`)

**Chat support — Crisp.chat:**
Add to `index.html` `<head>`:
```html
<script>window.$crisp=[];window.CRISP_WEBSITE_ID="AHMAD_PROVIDES_THIS";</script>
<script src="https://client.crisp.chat/l.js" async></script>
```
If Ahmad has not yet provided the ID, leave `CRISP_WEBSITE_ID=""` — the widget simply won't appear until filled.

**Feedback form — Tally.so:**
Ahmad creates a form at tally.so and provides the embed snippet. Place it in a modal triggered by "Send Feedback" in the footer. If not yet provided, use `mailto:` fallback.

**Definition of done:**
- `/` shows the full marketing homepage — all 8 sections present and styled
- `/score` shows the scoring tool exactly as before (no visual changes to the tool itself)
- Navbar "Score a Wallet" navigates correctly between the two views
- Crisp script is in `<head>` (even if ID is empty placeholder)
- Responsive on mobile (375px) and desktop (1440px)

---

### TASK 11B — Whitepaper Page
**Phase:** 4 — Pre-Distribution
**Priority:** HIGH
**Depends on:** Task 11A must be merged first

**Why you are doing this:**
OTI is positioning itself as infrastructure for enterprises — exchanges, custody platforms, DeFi protocols. Those buyers do not sign contracts based on a landing page alone. They need a technical document that explains what OTI is, how it works, who built it, and what the business model is. A whitepaper also builds credibility with investors and serious developers. The `/whitepaper` route lives inside the same Vercel project — no new deployment, no new domain needed.

**Route:** `/whitepaper`

**Design rules:**
- Same `#0A0A0A` black + `#3EFFC1` mint brand system
- Body text 17–18px, line-height 1.8 — this is a long-form document
- Section numbers displayed in mint: `01`, `02`, `03`
- Sticky table of contents sidebar on desktop (collapses to "Jump to section" accordion on mobile)
- Faint spiral watermark behind page header — `opacity: 0.04`, CSS only
- "Download as PDF" button — uses `window.print()` with `@media print` stylesheet that hides navbar, sidebar, and footer

**Nav update required:**
- Desktop: `Logo | Score a Wallet | API Docs | Whitepaper | [Social icons]`
- Mobile hamburger: Score a Wallet → API Docs → Whitepaper

**Page header:**
- Title: `OpenFlow Trust Infrastructure — Whitepaper`
- Subtitle: `Version 1.0 · July 2026 · OpenFlow Labs`
- Two buttons: `[Download PDF]` and `[Score a Wallet →]`

**Content sections** (copy exactly as provided in TASKS.md — sections 01 through the end of the whitepaper content):
- 01 — Executive Summary
- 02 — About OpenFlow
- 03 — About OpenFlow Labs
- 04 — The Problem
- 05 — How OTI Works
- 06 — Supported Infrastructure
- 07 — Use Cases
- (remaining sections per TASKS.md)

**Definition of done:** `/whitepaper` renders all sections. Sticky sidebar works on desktop. Print-to-PDF hides nav and sidebar. "Score a Wallet" button navigates to `/score`.

---

## ⏳ Future Tasks (Not Yet Active — Manager Will Assign When Ready)

These are coming after the queue above is complete. You do not need to read these in detail now.

- **Phase 5:** Browser extension (Firefox first, then Chrome) — separate repo, content script that detects wallet addresses on Etherscan/OpenSea and injects OTI score badges
- **Phase 6:** Wallet Ownership Registry (WOR) UI — registration flow, compromise report flow, passkey integration
- **Phase 7:** Self-serve developer portal — sign up, get API key, choose plan

---

## Keeping This File Updated

You never update either file on your own initiative. Every update — whether marking a task done or adding a new one — happens only when the Manager explicitly tells you to.

**When you complete a task:**
1. Notify the Manager — do not mark anything done yourself
2. Wait for the Manager to review and confirm your work
3. Only when the Manager explicitly tells you to mark it done:
   - Move it to the ✅ Completed Tasks section in this file
   - Mark it ✅ in `TASKS.md` as well
4. Both files must always match

**When the Manager assigns you a new task:**
1. The Manager will explicitly tell you to add the new task to your file
2. Only then: add it to the bottom of your Queue section in this file AND add it to `TASKS.md`
3. Read it fully before starting — every task has a "Why" and a "Definition of done"
4. Do not start a task that has a ⚠️ dependency warning until the Manager confirms it is cleared

**General rules:**
- Never touch Git, never push, never open a PR — Ahmad handles all of that himself
- Never touch `vercel.json` — ever
- Never manually edit `src/api/schema.gen.ts` — run `pnpm codegen` instead
- Ahmad loves the chain selector — do not touch it
- All CSS goes in `src/index.css` — no new component libraries
- Test on mobile (375px) — most users are on mobile
- If a task is blocked, tell the Manager immediately — do not sit on a blocker
- Never update any file without the Manager's explicit instruction
