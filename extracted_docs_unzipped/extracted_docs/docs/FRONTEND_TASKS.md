# OTI — Frontend Builder Task List
> Last updated: July 10, 2026 (session 8 — full rewrite. Bug fixes, cleanup, and polish work moved out to `FIXES.md` — including the former Task 11E, now FF17 there. This file now only lists genuine new-build tasks.) | Maintained by: Development Manager
> **This file contains your tasks only. Read BUILDER_ONBOARDING.md and ARCHITECTURE.md before starting anything here. Read `FIXES.md` too — FF17 (AI-native tell cleanup) is your likely next item, pending Ahmad's priority call.**
> Build in the exact order listed. Some tasks have hard dependencies — do not start them until the dependency is confirmed merged and deployed.
>
> **⚠️ This is YOUR copy of this file, in YOUR own account/repo.** The Manager's copy of this file is separate and does not sync with yours. Only mark a task done here, or add a new task here, when the Manager explicitly tells you to.

---

## Where You Stand Right Now

You are idle as of July 9, 2026 — all tasks below are done. Your likely next item is `FIXES.md` FF17 (a full "AI-native tell" cleanup pass across the homepage, docs site, and whitepaper — copy/tone, emoji, any other AI-generated tell), but the Manager needs to confirm priority with Ahmad before sending it. Do not start anything new until the Manager assigns it.

---

## ✅ Your Completed Tasks (genuine new-build work)

### TASK 8 — Professional Results Page Redesign ✅
**Completed:** July 7, 2026. Full visual rebuild of the wallet score results page: score panel in its own bordered card with a chain-color ring gauge, score tier label (HIGHLY TRUSTED → HIGH RISK), a separate "Trust Signals" card with weighted signal bars, truncated wallet address with copy button, native-share-sheet Share button, 3× PNG "Save as Image" export, "⚑ Report this wallet" placeholder ghost link (for WOR, Phase 2), and a footer. This task also established the OTI color system below — every later task must use it.

### TASK 8B — Professional Wallet Input Page Redesign ✅
**Completed:** July 8, 2026. Matching redesign of the landing/input screen: logo sizing and position, gradient wordmark, tagline, mint-glow form card, styled rate-limit badge, "Try an example →" link, WOR ghost links, footer, faint watermark, plus a polish round fixing zkSync/Linea icon visibility, chain icon/dropdown sizing, and mobile vertical spacing.

### TASK 9 — Admin Panel UI ✅
**Completed:** July 7, 2026. Built the `/admin` route (URL-only, no public nav link, per Ahmad's decision): password gate, Dashboard, API Keys (create/list/edit/delete, reveal-once creation modal), Query History, Cache, and Plan Configs tabs. All calls authenticate with `x-admin-secret` from sessionStorage.

### TASK 11A — Restructure Vercel App: Marketing Front Door + Scoring at /score ✅
**Completed:** July 8, 2026. Moved the scoring tool intact to `/score` and built a full marketing homepage at `/`: navbar, hero with chain row, How It Works (3 steps), Trust Signals (5 cards), Use Cases (9-tile grid), Get the API (cURL example), Find Us/Integrations row, footer with social links. Crisp.chat live-chat widget embedded in `<head>` (site ID left blank until Ahmad provides it). Brand consistency with `/score` verified via cache-busted screenshot and JS bundle inspection by the Manager, and directly by Ahmad.

### TASK 11B — Whitepaper Page ✅
**Completed:** July 8, 2026 (build), fixes verified July 8–9, 2026. Built `/whitepaper`: full section-by-section technical/business document, sticky TOC sidebar on desktop (accordion on mobile), mint section numbers, print-to-PDF via `window.print()`, shared navbar/footer/color system with the homepage. Three post-launch rendering fixes (body text color, mobile horizontal scroll, Roadmap section removal) are logged in `FIXES.md` FF16.

### TASK 11 — Developer Docs Site ✅
**Completed:** July 9, 2026. Docusaurus site (`oti-docs/`) covering Getting Started, API Reference, Score Explanation, Supported Chains, Rate Limits, and JS/Python/cURL examples, plus an OG social-share image and a live "Try It Live" widget. Deployed as its own Vercel project (pnpm-based build — do not switch back to npm, see `MANAGER_HANDOVER.md` for why) and proxied onto the main site at `/docs/` via `vercel.json` rewrites. Confirmed fully live via curl on `/docs`, `/docs/`, and `/docs/api-reference`. One open follow-up: `FIXES.md` BF11/BF-style item — re-verify "Try It Live" hits the real Railway backend post-redeploy (tracked as BF11 in `FIXES.md`, owned by whichever Builder picks it up next — currently unassigned).

---

## 🎨 OTI Color System (Locked — July 7, 2026)

> This palette replaced the old flat black + mint system. Every future task must use these exact values. Do not revert to pure black (`#000000`) or the old surface colors.

| Token | Value | Usage |
|---|---|---|
| Background | `#05080f` | Page background — deep blue-black |
| Surface | `#0b0f1a` | Card backgrounds, panels |
| Surface-2 | `#0f1520` | Inner elements, signal bar tracks |
| Borders | `#1c2535` | All card/panel borders |
| Body text | `#e8f4ff` | Main readable text — slight blue tint |
| Dimmed text | `#7a8fa8` | Metadata, labels, secondary text |
| Mint (primary) | `#00e5a0` | CTAs, highlights, active states, mint accents |
| Mint (gradient end) | `#3EFFC1` | Gradient highlights |

**Chain brand colors (ring gauge + panel tint):** Ethereum `#627EEA` · Bitcoin `#F7931A` · Solana `#9945FF` · BNB `#F3BA2F` · (all 15 chains have their exact brand hex in the codebase — check there before inventing a new one).

**Special effects (do not remove):**
- Navbar: `backdrop-filter: blur(14px)` frosted glass
- Submit button: green glow on hover `box-shadow: 0 0 24px rgba(0,229,160,0.40)`
- Score panel: border + background tint shifts toward the selected chain's brand color via `color-mix()`
- Signal bars: 5px height, soft color glow on fill
- All `color-mix()` declarations have plain-value fallbacks above them for older browsers

---

## 🔴 Your Task Queue

Nothing is currently queued. Once Ahmad confirms priority, the Manager will send you `FIXES.md` FF17 (AI-native tell cleanup) as your next active item — it lives in the fixes log, not here, since it corrects existing copy/design rather than building something new.

---

## ⏳ Future Tasks (Not Yet Active — Manager Will Assign When Ready)

- **Phase 5:** Firefox browser extension (then Chrome) — separate repo, content script that detects wallet addresses on Etherscan/OpenSea and injects OTI score badges
- **Phase 2:** Wallet Ownership Registry (WOR) UI — registration flow, compromise report flow, passkey integration
- **Phase 3:** Self-serve developer portal — sign up, get API key, choose plan

---

## Keeping This File Updated

You never update either file on your own initiative. Every update — whether marking a task done or adding a new one — happens only when the Manager explicitly tells you to.

**When you complete a task:**
1. Notify the Manager — do not mark anything done yourself
2. Wait for the Manager to review and confirm your work
3. Only when the Manager explicitly tells you to mark it done:
   - Move it to the ✅ Completed Tasks section in this file
   - Mark it ✅ in `TASKS.md` as well (or in `FIXES.md`, if it's a fix, not a task)
4. All your files must always match the Manager's

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
