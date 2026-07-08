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

### ✅ Task 8E — Disable Mobile Pinch/Double-Tap Zoom Across the App (compromise version)
Completed July 8, 2026. Per Ahmad's accessibility compromise: viewport meta set to `maximum-scale=2, minimum-scale=1` (not `user-scalable=no`/`maximum-scale=1`) — curbs runaway pinch-zoom while preserving accessibility zoom. Added `touch-action: manipulation` on html/body as an iOS double-tap-zoom backstop; verified it does not affect `.admin-table-wrap` horizontal scroll or the `.chain-select-panel` dropdown. Desktop zoom (Ctrl+/-, Ctrl+scroll) unaffected — those properties are touch/viewport-only.
*(Note: maximum-scale was further reduced from 5→2 on Ahmad's follow-up request in the same session. Verified by inspection and static screenshots only — no physical touch-gesture test was possible in this environment; recommend a quick real-device check.)*

### ✅ Task 8F — Reorder Chain Selector by Popularity, Remove EVM/Non-EVM Grouping
Completed July 8, 2026, per Ahmad's direct request (exception to the "chain selector is off-limits" rule — confirmed explicitly by Ahmad in-session).
- File: `src/lib/chains.ts` — reordered the `CHAINS` array by real-world popularity instead of EVM-first: Bitcoin, Ethereum, Solana, BNB Smart Chain, Tron, TON, Avalanche, Polygon, Arbitrum, Optimism, Base, Sui, Fantom, Linea, zkSync. Removed the now-unused `EVM_CHAINS`/`NON_EVM_CHAINS` exports (the `family` field itself is still used by `validateAddress.ts` for per-chain address format validation — not removed).
- File: `src/components/ChainSelect.tsx` — dropdown no longer renders separate "EVM" / "Non-EVM" group headers; renders one flat list under a single "SELECT COIN" heading, in the new popularity order.
- Popularity ranking is a reasoned estimate (market cap for L1 native coins, TVL/usage mindshare for L2s) — not pulled from a live ranking API. Flagged to Ahmad for awareness; open to reordering specific chains if he disagrees with any placement.

## Nothing else currently active.
