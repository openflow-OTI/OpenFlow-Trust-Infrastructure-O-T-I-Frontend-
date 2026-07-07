---
name: OTI frontend conventions
description: Brand/theme decisions, API quota tradeoff, logo geometry, and chain-icon setup for the OpenFlow Trust Infrastructure frontend.
---

- Brand direction is strict: pure black (#000000) background everywhere, mint/emerald accent (~#00E5A0), monospace typography (JetBrains Mono). Red = compromised/danger, amber = warning. Keep new UI consistent with this rather than defaulting to a generic light/dark theme.
- The backend's anonymous rate limit (3 requests/day) is shared across score + history lookups — fetching history for a wallet counts against the same quota as fetching its score. Any new feature that calls the scoring API must account for this shared budget rather than assuming independent quotas.
- Project's `tsconfig.app.json` intentionally omits `baseUrl` and defines the `@/*` path alias directly under `paths` only. This project uses TypeScript ~6.0.3 (beta, from a Vite 8 template) which deprecates `baseUrl`; adding it back will cause a config warning/error.
- Logo is a programmatically generated nautilus spiral (single continuous path, exponential radius decay from outer to inner, ~2 turns) in `Logo.tsx` — not a static asset. If it ever looks like a plain circular swirl again, increase `turns` and use exponential (not linear/power) radius decay so two visually distinct coils remain visible even at small sizes.
- Chain/network logos come from `@web3icons/react` (`Network<Name>` components, e.g. `NetworkArbitrumOne` for "arbitrum", `NetworkBinanceSmartChain` for "bsc") — mapped by chain id in `ChainIcon.tsx`. Package is large (~99MB unpacked) but only the used components are bundled by Vite tree-shaking.
- Layout.tsx wraps ALL routes (including /admin) in `.app-main` which has `max-width: 720px; margin: 0 auto`. Admin panel must override this via `.app-main:has(.admin-shell), .app-main:has(.admin-gate) { max-width: 100%; width: 100%; margin: 0; padding: 0; }` in index.css — already done.
- Ahmad handles all Git operations himself (push, PR, merge). Never push or open PRs. Build only, then notify when done.
- PlanConfigs PATCH sends only `{ daily_limit }` (description omitted when empty) — correct. Backend endpoint: PATCH /admin/plan-configs/{plan_name}.
- GET /api/config/anonymous-limit is a public backend endpoint but returns {"daily_limit":null} even after Plan Configs saves — backend wiring bug (endpoint not reading from plan_configs table, or PATCH not persisting). Frontend fallback hardcoded to 3 (architectural default). Backend Builder must fix.
- Browser-level scroll (not inner-div): html/body/root use min-height:100%, app-shell has no overflow:hidden, app-main has no overflow-y:auto, navbar is position:sticky top:0. Rate note pinned to bottom via margin-top:auto on .home-rate-note.
- Admin full-width override: .app-main:has(.admin-shell),.app-main:has(.admin-gate) removes max-width/padding. Already in index.css.
