# OTI — Fixes Log
> Last updated: July 10, 2026 (session 8 — created this file. Ahmad's direction: bug fixes, corrections, cleanup, and polish are NOT tasks — a "task" builds new capability, a "fix" repairs or refines something already built. Keeping them separate keeps TASKS.md from bloating with churn and stops confusion about what's actually new work vs. maintenance. All fix-type items previously listed in TASKS.md/BACKEND_TASKS.md/FRONTEND_TASKS.md have been moved here.) | Maintained by: Development Manager

---

## How This File Works

- **A task** (lives in `TASKS.md` / `BACKEND_TASKS.md` / `FRONTEND_TASKS.md`) builds something that didn't exist before — a new page, a new endpoint, a new system.
- **A fix** (lives here) repairs, corrects, hardens, or polishes something that already exists — a bug, a wrong value, a security hole, a copy/tone pass, a visual polish round.
- Each list below is numbered smallest/quickest fix first, largest/most involved last — so it's easy to see what can be knocked out fast vs. what needs real time.
- Same rules as everywhere else: one active item at a time per Builder, Manager adds fixes here first, Builder only updates their own copy when told to explicitly.

---

## Backend Fixes

### BF1 — GET /admin/stats 500 Error ✅
**Fixed:** July 7, 2026. Root cause: stats handler had no error handling — any DB query failure caused an unhandled rejection and returned raw HTML 500. Fix: per-query isolation with individual try/catch blocks, each defaulting to 0 on failure. Result: `/admin/stats` always returns HTTP 200 with valid JSON. Verified live.

### BF2 — PATCH /admin/plan-configs/:id 404 Error ✅
**Fixed:** July 7, 2026. Root cause: handler matched `WHERE plan_name = :id`, but the frontend was sometimes sending a UUID — matched nothing. Fix: dual lookup, detects if the param is a UUID (`WHERE id`) or a name string (`WHERE plan_name`). Both forms now work. Verified live.

### BF3 — subscriptions.updated_at Missing Column ✅
**Fixed:** July 6, 2026. Added `updated_at` column to the `subscriptions` table via Drizzle migration; `PATCH /api/admin/keys/:id` now sets it on every update. Railway production DB migration was run manually via the Railway Console (see the note in MANAGER_HANDOVER.md — Railway does not auto-run migrations on deploy). Verified: `GET /api/admin/keys` no longer 500s.

### BF4 — GET/POST /admin/keys Full Resolution ✅
**Fixed:** July 7, 2026. Root cause: the Railway `subscriptions` table predates the Drizzle schema in the repo — real columns are `id, api_key, plan, owner_address, created_at, expires_at, updated_at` with **no `status` column and no `email` column**. All handlers now use raw SQL instead of Drizzle ORM selects on this table (which crash with "column does not exist"). GET uses a column-name fallback mapper; POST inserts only the columns that actually exist; the `active_keys` stat no longer filters on a `status` column that isn't there. Verified live — Ahmad created enterprise/pro/free keys and confirmed edit/delete worked.

### BF5 — Admin Route Authentication (security) ✅
**Fixed:** July 5, 2026. Every `/api/admin/*` route was callable by anyone on the internet — no auth at all, meaning any visitor could create/delete API keys or flag wallets. Fix: `adminAuth.ts` middleware added, requires a correct `x-admin-secret` header on all admin routes, returns 401 otherwise. This had to ship before anything else touched the admin surface. Verified live on Railway.

### BF6 — Score History Served From Memory Instead of Database ✅
**Fixed:** July 6, 2026. `GET /api/score/:address/history` was reading from an in-memory `Map` (wiped on every Railway restart) instead of the `chain_scores` database table, even though the data was already being written there. Fix: endpoint now queries `chain_scores` directly, with an optional `?chain=` filter (auto-detects chain family when omitted), ordered by `scored_at` DESC, capped at 50 records. Verified live.

### BF7 — Signal Scores Missing Weighted Values in API Response ✅
**Fixed:** July 6, 2026. The API returned raw 0–100 signal scores with no indication of how much each signal actually contributed to the overall score. Fix: added a `signalWeighting.ts` transformer (the protected `scoring.ts` algorithm itself was never touched) so the response now includes `{ score, weighted, maxWeight }` per signal, on both the fresh-compute and cache-hit paths. This was a prerequisite for the frontend's weighted signal bars and for any external developer integrating the API. Verified live.

### BF8 — Bitcoin Wallet Age Returning Wrong Value ✅
**Fixed:** July 6, 2026. `getBitcoinTxs()` was only fetching the most recent ~50 transactions (a single page) instead of full history, so old wallets reported an age of only a few days. Fix: now paginates backwards through mempool.space's `/address/:address/txs/chain/:last_seen_txid` until the true first transaction is found, with a 40-page safety cap to bound latency for hyperactive wallets. Verified on Railway: previously-broken old wallets now correctly return walletAgedays in the thousands.

### BF9 — Plan Limit Enforcement Hardening ✅
**Fixed:** July 7, 2026. A production-wide bug was found during testing: every API request using a valid key was silently returning raw HTML 500 since launch, caused by a Drizzle ORM schema mismatch (a `status` column defined in the repo's schema but missing from the actual Railway DB). Fixed across four call sites — `apiKeyAuth.ts`, `score.ts` (compromised-wallet check), and both the DELETE and PATCH handlers in `admin.ts` — all switched from Drizzle ORM to raw SQL for this table. Verified live: free plan correctly 429s on the 3rd daily request, enterprise (unlimited) never 429s, PATCH edits confirmed persisting.

### BF10 — Signal Accuracy Audit & Cross-Chain Fix 🔴 OPEN — NOT YET SENT — CRITICAL
**Status:** Scoped, not yet sent to Backend Builder — has not started. This is the largest and highest-priority fix on the backend list — once sent, it becomes the active item and nothing else goes to Backend Builder until it's verified done.

**The problem:** the 5 scoring signals were designed around EVM chains. Bitcoin, Solana, TON, Tron, and Sui have fundamentally different data models — no ERC-20 tokens, no internal transactions, no smart contracts in the EVM sense — but are currently being scored with EVM-specific logic, producing wrong and misleading results for every single non-EVM wallet. Confirmed examples: the Satoshi genesis wallet (`1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa`) scores ~51 days wallet age when the correct answer is 5,700+ days; Bitcoin wallets score 0/20 on Token Holding because ERC-20 tokens don't exist on Bitcoin; Bitcoin wallets show a fabricated "1 smart-contract tx" despite Bitcoin having no smart contracts.

**What's being audited/fixed, per signal:**
- **Wallet Age (25%)** — re-verify the Bitcoin fix (BF8) against the Satoshi wallet after a cache flush; verify Solana/TON/Tron/Sui each pull the correct first-tx timestamp.
- **Transaction Count (20%)** — verify every non-EVM chain returns a real count, not a placeholder/default.
- **Token Holding Behavior (20%)** — Bitcoin has no tokens; instead of scoring 0/20 (which unfairly penalizes BTC wallets), either redistribute this signal's weight across the other 4 or score it neutral (50/100). Verify Solana SPL token diversity is actually being scored, not defaulting to 0. Verify TON/Tron/Sui individually.
- **Smart Contract Interactions (20%)** — Bitcoin has no smart contracts; stop fabricating data, apply the same redistribute-or-neutral fix. Verify Solana program interactions (the equivalent concept) are scored correctly. Verify TON/Tron/Sui.
- **Transaction Timing Patterns (15%)** — non-EVM chains currently show "0 internal transactions" as a proxy; must use real transaction timestamps instead.

**Definition of done:** Satoshi wallet scores > 5,000 days wallet age; no signal fabricates data for a chain where that data type doesn't exist; non-applicable signals are redistributed or neutral, never a default 0; all 15 chains tested with at least one known wallet; a short test log is committed to the repo; Backend Builder reports results to the Manager before this is marked done.

**Sacred files — do not touch while fixing this:** `src/lib/scoring.ts`, `nixpacks.toml`.

---

### BF11 — Re-verify "Try It Live" Widget Against Railway Backend 🔴 OPEN
**Priority:** Low-medium, small effort. The docs site's "Try It Live" widget had its API URL reverted during the Task 11 (docs site) remediation, but was never re-checked live after the redeploys. Just needs a live check that it's actually hitting the real Railway backend, not a stale/dev URL. Not yet assigned to a Builder.

### BF12 — Railway Deploys Don't Auto-Run Migrations 🔴 OPEN (optional)
**Priority:** Low, small effort, not urgent. Confirmed July 5, 2026: Railway's deploy pipeline only runs `pnpm install && build && start` — it does **not** run `drizzle-kit push`. Every schema change currently needs Ahmad to manually run the migration against the Railway production DB after deploying (this is how BF3 above was applied). Optional fix: add `drizzle-kit push` to `railway.json`'s `buildCommand` (a one-line change — NOT to `nixpacks.toml`, which stays sacred). Not yet assigned; only worth doing if Ahmad wants to remove the manual step.

---

## Frontend Fixes

### FF1 — Logo Rendering as Broken Spiral Math ✅
**Fixed:** July 5, 2026. `Logo.tsx` replaced spiral SVG math with a plain `<img src="/logo.jpg">` tag; `generateScoreCard.ts` updated to use `loadImage()` before drawing to canvas.

### FF2 — Logo Blurry at 34px (SVG Replace) ✅
**Fixed:** July 6, 2026. Switched to the original SVG logo file directly as `public/logo.svg` — crisp on Retina/high-DPI screens, zero blur. No reconstruction needed, the asset already existed.

### FF3 — txCount Displayed as Raw, Sometimes Misleading Number ✅
**Fixed:** July 7, 2026. `formatMetadata.ts` and `generateScoreCard.ts` both now show "1,000+ transactions" once `txCount >= 1000`, instead of a raw capped number that looked like the true count. Verified live.

### FF4 — Homepage Scrollbar/Layout Bug ✅
**Fixed:** July 7, 2026. `html`/`body`/`root` given proper `min-height` so the browser scrollbar sits at the true far-right edge instead of floating mid-page.

### FF5 — useAnonymousLimit Hook Called Wrong Endpoint ✅
**Fixed:** July 7, 2026. Hook was calling the admin-protected `/admin/plan-configs` route (401 on a public page) instead of the correct public `GET /api/config/anonymous-limit`. Fixed, with a fallback to displaying 3 when the API returns null.

### FF6 — API Key Not Shown Correctly on Creation ✅
**Fixed:** July 7, 2026. POST response field name mismatch — frontend read `data.apiKey`, backend returned `data.api_key`. Fixed the field name and the TypeScript interface; the reveal modal now correctly shows the full key once with a copy button and a "never shown again" warning.

### FF7 — Admin Panel Desktop Layout Constrained to Mobile Width ✅
**Fixed:** July 7, 2026. The app's `max-width: 720px` container rule was also constraining the admin panel on desktop. Fixed with a CSS `:has()` selector that removes the width constraint specifically when the admin shell is present; mobile layout unaffected.

### FF8 — API Keys Tab Broke Entirely When the List Failed to Load ✅
**Fixed:** July 7, 2026. The "+ New Key" button and the whole tab used to disappear if the keys list failed to fetch. Fixed: the button is now always visible, errors show inline with a Retry button, and the table only renders once the fetch actually succeeds.

### FF9 — Rate Limit Display Hardcoded Instead of Live ✅
**Fixed:** July 7, 2026. Homepage showed a hardcoded "3 per day" regardless of the real configured value. `useAnonymousLimit.ts` now calls the live public endpoint and displays the real `daily_limit`, invalidating and refreshing automatically after an admin change.

### FF10 — API Health Not Visible Anywhere in the UI ✅
**Fixed:** July 7, 2026. The `useHealth` hook existed but was wired into zero components. Connected it to a small status dot in the navbar (green/red/loading), with a tooltip and proper `aria-live`/`role="status"` accessibility attributes.

### FF11 — General UI Polish Pass ✅
**Fixed:** July 5, 2026. Homepage title styling, back button style, chain icon sizing, removed dead CSS, added an `isKnownChain()` guard in `useScore.ts` to avoid crashes on unrecognized chains.

### FF12 — Admin API Calls Hitting Wrong Base Path ✅
**Fixed:** July 7, 2026. Every admin panel screen 404'd because the frontend called `/admin/*` while the real backend routes live at `/api/admin/*` (consistent with the rest of the API's `/api/*` prefix). Fixed in `adminClient.ts` and everywhere else admin routes are called.

### FF13 — Anonymous Rate Limit Badge Not Updating After Admin Change ✅
**Fixed:** July 8, 2026. A full audit found the real root cause: `setEditId(null)` inside the Plan Configs mutation's `onSuccess` raced with React 18 batching and unmounted the edit row before the cache update could be trusted — compounded by there being no `invalidateQueries` fallback at all, a closure-based (not server-response-based) value being written to cache, and "unlimited" (`null`) being silently displayed as "3". Fixed by consolidating all cache updates into the mutation's global `onSuccess`, always calling `invalidateQueries`, using the actual PATCH response value, and correctly displaying "Unlimited" for a null `daily_limit`. Verified live by Ahmad: changing the limit to 42 updated the homepage instantly; setting it to unlimited correctly showed "Unlimited".

### FF14 — Mobile Pinch/Double-Tap Zoom Breaking Carefully-Sized Layouts ✅
**Fixed:** July 8, 2026. Every page is precisely sized for mobile, but users could still pinch/double-tap zoom and break the intended layout. Fixed with the accessibility-conscious compromise Ahmad chose: viewport `maximum-scale=5, minimum-scale=1` (not a full `user-scalable=no` lock, which would violate WCAG 1.4.4) plus a `touch-action: manipulation` CSS backstop to curb iOS's accidental double-tap-zoom specifically. Deliberate pinch-zoom still works up to 5x; desktop zoom completely unaffected. Verified across homepage, results page, and admin dashboard.

### FF15 — Homepage Visual Polish: Contrast, Animated CTA Jank, Spacing, Density ✅
**Fixed:** July 8, 2026. Four issues bundled into one pass: (1) input placeholder text was too dim to read, set to near-white; (2) the "Try an example →" moving border caused real jank on mobile Chrome because it animated an expensive `@property`/conic-gradient repaint every frame — rebuilt using a GPU-cheap `transform: rotate()` on a masked pseudo-element, respecting `prefers-reduced-motion`; (3) the whole page felt oversized/zoomed on mobile — audited and reduced sizing across every element; (4) spacing felt cramped, especially below the rate-limit badge — reclaimed space from the sizing fix was redistributed as breathing room without adding page height. Verified live by Ahmad via screen recording.

### FF16 — Whitepaper Rendering Issues ✅
**Fixed:** July 8, 2026. Three issues found during Manager's live verification of the whitepaper page: (1) body/paragraph text was rendering in the dimmed grey token instead of white — fixed, section numbers stay mint; (2) mobile horizontal scroll/shift — fixed, now fits one column at 375px; (3) Ahmad requested the Roadmap section be removed from the whitepaper entirely — removed, all following sections/TOC renumbered sequentially.

### FF17 — "AI-Native Tell" Cleanup: Copy, Tone, and Emoji Across Homepage, Docs, and Whitepaper 🔴 OPEN — HIGH PRIORITY
**Raised by Ahmad:** July 9, 2026. The largest open frontend fix — a full read-through of all three public-facing surfaces (marketing homepage, developer docs site, whitepaper) for anything that reads as AI-generated rather than a deliberately designed product site:
1. **Copy/tone** — flag and rewrite any AI-sounding boilerplate phrasing.
2. **Emoji usage** — audit and replace/remove emoji everywhere it appears (not just the Trust Signals/Use Cases sections) with a proper icon set (Lucide/Heroicons) in mint where an icon is still needed.
3. **Any other AI tell** — visual or textual, caught during the read-through.

**Status:** Scoped, not yet sent to a Builder — confirm priority with Ahmad before sending (this is broad enough that it may be worth splitting into three smaller passes — homepage, docs, whitepaper — rather than one large one). Not yet assigned an order relative to BF10 on the backend side; they're independent and can run in parallel once both are prioritized.

---

## Adding a New Fix

1. Decide fix vs. task first: does this repair/polish something that already exists (→ fix, goes here) or build something new (→ task, goes in `TASKS.md` / `BACKEND_TASKS.md` / `FRONTEND_TASKS.md`)?
2. Add it to the correct builder's list here, ordered by size — small/quick fixes near the top of their section, larger ones lower.
3. Tell the Builder to add it to their own copy of this file — same rule as tasks, copies never auto-sync.
