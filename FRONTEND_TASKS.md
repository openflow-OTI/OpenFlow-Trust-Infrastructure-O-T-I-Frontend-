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

---

## Pending

### ⬜ Task 9C — Plan Limit Enforcement Verification (Backend, Frontend aware)
Backend Builder verifying `daily_limit` enforcement across all plan types (free, pro, enterprise). No frontend changes needed. Logged for record completeness.

---

## Active

### 🔄 Task 8D — Homepage Visual Polish: Contrast, Animated CTA, Spacing & Density
**Priority:** HIGH
**Depends on:** Task 8B ✅, Task 8C ✅ — both done

**Context:** A previous Builder started this task and hit their account's credit limit mid-way. Ahmad pushed their in-progress work live to Vercel, so it's already partially done in production — but incomplete, with a new animation-jank problem. Pull up the live site and the current index.css/Home.tsx and see what's actually there before changing anything — don't assume a blank slate.

**Files:** `src/index.css`, and `src/pages/Home.tsx` only if animation markup needs restructuring (no logic changes).
**Do not touch:** `src/lib/scoring.ts`, `nixpacks.toml`, `vercel.json`, the chain selector, or `useAnonymousLimit.ts`/the admin mutation logic (Task 8C, already fixed and verified — leave it alone).

**What to fix, in order:**

1. Placeholder text contrast: the wallet address input's placeholder ("0x… or wallet address") is dim grey and hard to read. Make it white/near-white via `::placeholder`, distinct from typed text only through opacity, not a different color.

2. "Try an example →" link: text must be white. Ahmad wants a thin, continuously moving mint-green line tracing around the text — always alive, eye-catching. The current live version has this but causes real lag on mobile. Keep the effect, fix the performance: rebuild using only GPU-cheap transform-based animation (e.g. rotate a conic-gradient pseudo-element, clipped to a thin ring via mask/-webkit-mask). Never animate box-shadow, filter, backdrop-filter, or width/height every frame — that's almost certainly the current cause of the jank. Respect `prefers-reduced-motion`. Test on a throttled mobile CPU profile in Chrome DevTools (4x slowdown) before calling this done — zero visible stutter. Same mint green as everywhere else, no new color.

3. Zoom/oversized content: current live page still looks too large/zoomed on mobile (375-414px). Go element by element — logo, wordmark, tagline, input, buttons, badges, icons, paddings, margins — and reduce consistently at the mobile breakpoint so the whole page fits a 375×812 viewport comfortably without scrolling and without looking oversized. Don't do a partial pass; verify each element against the live screenshot.

4. Spacing: current layout is cramped, especially the gap between the "free lookups/day" badge and the WOR links/buttons below it. Increase spacing between every major block (header → input card → rate-limit badge → WOR links → footer). Treat this together with #3 — reclaim space from the size reduction and redistribute it as breathing room; the page must still fit one screen without scrolling.

5. Typography hierarchy: not everything should be the same size. Primary (largest): "OTI" wordmark, "Check trust score" button. Secondary (medium): tagline, input text. Tertiary (small, muted): field labels, rate-limit badge, footer, WOR links. Increase primary/secondary where too small; keep tertiary compact.

**Constraints:** all CSS in `src/index.css`, no new libraries, black background + existing mint green system only, works on both mobile (375px) and desktop.

**Definition of done:** placeholder is readable, example-link animation is smooth on a throttled mobile profile with zero jank, page fits 375×812 without feeling zoomed, clear spacing between sections, clear typographic hierarchy. Screenshot the result on a simulated 375px viewport and report back before marking done.
