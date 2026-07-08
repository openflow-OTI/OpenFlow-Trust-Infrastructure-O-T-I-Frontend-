# OTI Frontend Task Log

## Legend
- ✅ Done (Manager verified)
- 🔄 In Progress
- ⬜ Pending

---

## Completed

### ✅ Task 7B — txCount Cap Indicator
Confirmed done by Manager (July 7, 2026).

### ✅ Task 7C — Dynamic Rate Limit Display
- File: `src/hooks/useAnonymousLimit.ts`
- Switched from GET /admin/plan-configs (admin-protected) to GET /api/config/anonymous-limit (public)
- Falls back to 3 when backend returns null (architectural default)
- Homepage shows live DB value; confirmed live showing "20 per day" (Manager verified)

### ✅ Task 9 — Admin Panel UI
Full admin panel implemented and confirmed working live by Manager (July 7, 2026).

### ✅ Task 10 — Navbar API Health Status Dot
Confirmed done by Manager (July 7, 2026).

### ✅ Plan Configs Tab (Admin Panel)
- File: `src/pages/admin/PlanConfigs.tsx`
- PATCH /admin/plan-configs/{plan_name} with body `{ daily_limit, description? }`
- Description only sent if non-empty (avoid backend empty-string edge cases)
- On success: invalidates both `['admin', 'plan-configs']` and `['anonymous-limit']` queries

### ✅ Admin Panel Desktop Layout Fix
- File: `src/index.css`
- `.app-main:has(.admin-shell), .app-main:has(.admin-gate)` → `max-width: 100%; width: 100%; margin: 0; padding: 0`
- Admin sidebar sticky at `top: 70px; height: calc(100vh - 70px)`

### ✅ useAnonymousLimit Hook Fix
- File: `src/hooks/useAnonymousLimit.ts`
- Switched from admin-protected endpoint to correct public endpoint
- staleTime: 5 minutes; falls back to architectural default of 3 when DB returns null

### ✅ Homepage Scrollbar + Layout Fix
- File: `src/index.css`
- html/body/root: `min-height: 100%` (was `height: 100%`)
- `.app-shell`: removed `overflow: hidden`; uses `min-height: 100%`
- `.app-main`: removed `overflow-y: auto`; added `min-height: calc(100vh - 62px)`
- `.navbar`: `position: sticky; top: 0; z-index: 50; background: var(--bg)`
- `.home-rate-note`: `margin-top: auto` pins rate note to bottom of viewport

### ✅ API Keys Tab — UI Resilience Fix
- File: `src/pages/admin/ApiKeys.tsx`
- Section header + `+ New Key` button always rendered regardless of load state
- Loading state renders inline below header
- Error state renders inline with `.admin-error-block` styling + `↻ Retry` button wired to `keys.refetch()`
- Table guarded behind `keys.isSuccess`; removed `keys.data!` non-null assertions
- Confirmed working (create/list/edit/delete) — Manager verified July 7, 2026

### Fix: API Key Reveal on Creation ✅
- POST /api/admin/keys response field corrected: `data.apiKey` → `data.api_key`
- TypeScript interface updated to match: `apiKey: string` → `api_key: string`
- Modal now displays full key after creation with copy button and "never shown again" warning
- Verified live on Vercel by Manager

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

### Task 8B — Professional Wallet Input Page Redesign ✅
Completed July 8, 2026 (initial build + one polish round). Logo, wordmark, tagline, mint-glow input card, rate-limit badge, "Try an example" link, WOR ghost links, footer, watermark all shipped. Polish round fixed logo size/position, zkSync/Linea icon visibility, chain icon sizing, spacing, and report-link styling.
*(Recorded per Manager's report — matches what is currently present in `src/pages/Home.tsx`/`src/index.css`; live-screenshot verification by Ahmad not independently confirmed by this Builder.)*

### Task 8C — Fix Anonymous Rate Limit Cache Sync Bug ✅
Completed July 8, 2026. Root cause: `setEditId(null)` inside the admin mutation's `onSuccess` raced with React 18 automatic batching and unmounted the edit row before the success banner (and its cache invalidation) could be trusted. Fixed by keeping the edit row open until the user clicks "Done" instead of auto-closing on success.
*(Recorded per Manager's report — the described fix and its explanatory comment are confirmed present in `src/pages/admin/PlanConfigs.tsx`; live Vercel behavior verification by Ahmad not independently confirmed by this Builder.)*

### Task 8D — Homepage Visual Polish: Contrast, Animated CTA, Spacing & Density ✅
Completed July 8, 2026. Fixed placeholder contrast, rebuilt the "Try an example" moving border from a paint-triggering animated @property-driven conic-gradient to a GPU-cheap transform-based rotation (no jank), corrected oversized/zoom sizing, added breathing room between sections, and established a clear typographic hierarchy. Verified live by Ahmad via screen recording — confirmed working normally and looking good.
*(Recorded per Manager's report — not independently verified by this Builder against the live site or local diff.)*

---

## Pending

### ⬜ Task 9C — Plan Limit Enforcement Verification (Backend, Frontend aware)
Backend Builder verifying `daily_limit` enforcement across all plan types (free, pro, enterprise). No frontend changes needed. Logged for record completeness.

---

## Active

### ✅ Task 8E — Disable Mobile Pinch/Double-Tap Zoom Across the App
Completed July 8, 2026. Final state: viewport meta set to `maximum-scale=1, minimum-scale=1`. Added `touch-action: manipulation` on html/body as an iOS double-tap-zoom backstop; verified it does not affect `.admin-table-wrap` horizontal scroll or the `.chain-select-panel` dropdown. Desktop zoom (Ctrl+/-, Ctrl+scroll) unaffected — those properties are touch/viewport-only.
*(History: started at maximum-scale=5 as an accessibility compromise (avoiding user-scalable=no / maximum-scale=1 per Ahmad's initial accessibility concern), then reduced to 2, then explicitly set to 1 by Ahmad on final follow-up — overriding the earlier accessibility carve-out. Flagged to Ahmad both times before applying; he confirmed 1 explicitly. Mobile zoom is now fully disabled, same effective result as user-scalable=no. Verified by inspection and static screenshots only — no physical touch-gesture test was possible in this environment; recommend a quick real-device check.)*

### ✅ Task 8F — Reorder Chain Selector by Popularity, Remove EVM/Non-EVM Grouping
Completed July 8, 2026, per Ahmad's direct request (exception to the "chain selector is off-limits" rule — confirmed explicitly by Ahmad in-session).
- File: `src/lib/chains.ts` — reordered the `CHAINS` array by real-world popularity instead of EVM-first: Bitcoin, Ethereum, Solana, BNB Smart Chain, Tron, TON, Avalanche, Polygon, Arbitrum, Optimism, Base, Sui, Fantom, Linea, zkSync. Removed the now-unused `EVM_CHAINS`/`NON_EVM_CHAINS` exports (the `family` field itself is still used by `validateAddress.ts` for per-chain address format validation — not removed).
- File: `src/components/ChainSelect.tsx` — dropdown no longer renders separate "EVM" / "Non-EVM" group headers; renders one flat list under a single "SELECT COIN" heading, in the new popularity order.
- Popularity ranking is a reasoned estimate (market cap for L1 native coins, TVL/usage mindshare for L2s) — not pulled from a live ranking API. Flagged to Ahmad for awareness; open to reordering specific chains if he disagrees with any placement.

### ✅ Task 8G — Rotating Ring Effect on Wallet-Input Card and Score/Percentage Card
Completed July 8, 2026, per Ahmad's direct request (referenced two attached screenshots of the homepage wallet-input card and the results-page score/percentage card).
- File: `src/pages/Home.tsx` — wrapped the results score panel in a `.results-score-ring-wrap` (mirroring the existing `.home-form-card-wrap` pattern), moved the `--chain-color` CSS var up to the wrap so both the ring and the panel can read it, added a decorative `.results-score-ring` sibling layer.
- File: `src/index.css` — added `.results-score-ring` using the same rotating conic-gradient technique as `.home-form-card-ring` (reuses the `card-ring-spin` keyframe), with its `::after` painted using the same chain-tinted `color-mix` background as `.results-score-panel` so the ring blends into the existing chain-colored glow instead of covering it. Respects `prefers-reduced-motion`. The homepage wallet-input card already had this ring from earlier work — left unchanged, now the results score panel matches it.
- Verified both cards render correctly post-restart (screenshots taken of homepage and a live results page for wallet `0xde0B...7BAe` / ethereum).

### ✅ Task 11A — Restructure Vercel App: Marketing Front Door at `/`, Scoring Tool at `/score`
Completed July 8, 2026, per Ahmad's direct request. Full spec: `docs/FRONTEND_TASKS.md`.
- **Part A:** `src/App.tsx` restructured — `/score` now renders `<Home/>` wrapped in the exact same `<Layout/>` (navbar + status dot) as before; `/admin` and `404` also kept in `<Layout/>`. Zero changes to `Home.tsx`, `Layout.tsx`, `Navbar.tsx`, or any `.home-*`/`.results-*` CSS — verified with a live screenshot of `/score` against the pre-change baseline. `vercel.json`'s SPA rewrite (`"/(.*)" → "/index.html"`) untouched — it already covers any client-side route.
- **Part B:** New marketing homepage at `/` — `src/pages/Landing.tsx` + `src/components/marketing/{MarketingNavbar,MarketingFooter,FeedbackModal}.tsx`. All 8 sections built per spec (Navbar, Hero, How It Works, Trust Signals, Use Cases, Get the API, Find Us, Footer), copy taken verbatim from the task spec.
- Brand fidelity: before writing any CSS, inspected the *live* `/score`/`/admin` pages and `:root` tokens directly rather than trusting the spec's brand-system blurb, which was stale in two places — flagging both to Ahmad:
  - Font is `var(--mono)` (JetBrains Mono) everywhere in production, not Geist Sans/Inter as the spec assumed. Used JetBrains Mono throughout the new page for true consistency.
  - Background/border/text tokens used are the real `:root` values (`#05080f` bg, `#0b0f1a` surface, `#1c2535` border, `#00e5a0` accent, etc.) per Ahmad's own confirmed-live palette, not the spec's `#0A0A0A`/`#3EFFC1`-only description.
  - All new `.marketing-*` CSS (in `src/index.css`) reuses the exact color/radius/shadow recipes already live in `.home-form-card`, `.wallet-form-submit`, `.results-back`, `.admin-btn`, and the app navbar (frosted glass `blur(14px)`) — new button/card classes were added (not the literal old class names) because of different layout context, but every value traces back to an existing on-screen recipe, not an invention.
  - Reused `ChainIcon`, `CopyButton`, and `Logo` components as-is (no re-implementation) for the hero chain row, cURL copy button, and navbar/footer logos.
- Chat + feedback: Crisp.chat placeholder script added to `index.html` `<head>` with empty `CRISP_WEBSITE_ID` (Ahmad to provide). Footer "Send Feedback" opens a modal with a `mailto:feedback@openflowlabs.io` fallback (placeholder address) until Ahmad provides the Tally.so embed; modal has Escape-to-close, a Tab focus trap, and returns focus to the trigger on close.
- Verified via architect code review (post-build) — flagged and fixed one real gap (modal focus management: initial focus + trap + focus-return, now implemented). Also reviewed and *rejected* a review suggestion to swap the reused hardcoded `rgba(0, 229, 160, …)`/`#001a0e` glow and button-text values for CSS-variable equivalents — those exact literal values are the codebase's own established pattern (already used identically in `.home-form-card`, `.wallet-form-submit`, `.chain-select-panel`, etc.), so changing them would have been a deviation, not a fix.
- Verified responsively: grid sections (`How It Works`, `Trust Signals`, `Use Cases`) collapse to 1–2 columns under the documented breakpoints; hero/nav/footer collapse to a mobile hamburger layout.
- Side-by-side screenshot of `/` and `/score` sent to Ahmad for sign-off before starting Task 11B (whitepaper), per his explicit request.

## Nothing else currently active.
