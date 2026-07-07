# OTI — Architecture Ground Truth
> Last updated: July 5, 2026 | Maintained by: Development Manager
> **This file is the source of truth for every piece of infrastructure in OTI. All Builders and all new Manager accounts must read this before touching anything.**

---

## ⚠️ Important — Where the Code Lives

**This document describes the production OTI system deployed on Railway (backend) and Vercel (frontend).** The Manager's Replit workspace is used only for documentation, prompt writing, and roadmap management — it does NOT contain the OTI source code.

The OTI source code lives in Ahmad's GitHub repositories:
- **Backend repo:** https://github.com/openflow-OTI/OpenFlow-Trust-Infrastructure-OTI- — **PRIVATE** (contains scoring algorithm IP)
- **Frontend repo:** https://github.com/openflow-OTI/OpenFlow-Trust-Infrastructure-O-T-I-Frontend- — **PUBLIC** (clean React code, no secrets, builds developer trust)
- **Docs repo:** https://github.com/openflow-OTI/OpenFlow-Trust-Infrastructure-OTI-Docs — **Manager's workspace repo**

Builders work in their own Replit accounts against those GitHub repos. The Manager reads them for research but does not push to them.

**GitHub open/closed strategy:** GitHub does not support per-file access control. A repo is either fully public or fully private. The frontend is safe to make public (no secrets, no scoring logic). The backend must stay private — `scoring.ts` is protected IP and the admin routes must not be visible publicly.

---

## How Each Builder Gets These Docs

Builders don't receive docs via email or file sharing. The `docs/` folder lives inside the GitHub repos. When a Builder clones the repo to start work, the docs come with it.

**What Ahmad tells each Builder on day one:**
> "Clone the repo. Open the `docs/` folder. Read `BUILDER_ONBOARDING.md` first, then `ARCHITECTURE.md`, then open your dedicated task file — `BACKEND_TASKS.md` if you are the Backend Builder, `FRONTEND_TASKS.md` if you are the Frontend Builder."

**Manager session update flow:**
- End of session: update `MANAGER_HANDOVER.md` + `TASKS.md` → Ahmad pushes via Replit's Git interface
- Start of new session: clone repo or `git pull` → read `MANAGER_HANDOVER.md` → continue

---

## What OTI Is

**OTI (OpenFlow Trust Infrastructure)** — a blockchain wallet trust scoring API and frontend.

Given a wallet address + chain, OTI returns a 0–100 trust score built from five weighted signals. The score is deterministic, derived purely from on-chain data, and works across 15 blockchains.

**Live URLs:**
| Resource | URL |
|---|---|
| Frontend / Marketing | `https://otiscore.vercel.app` ✅ Live |
| Scoring App | `https://otiscore.vercel.app/score` (after Task 11A restructure) |
| Backend | `https://workspaceapi-server-production-5c0c.up.railway.app` |
| Swagger | `/api/docs` |
| Health | `/api/healthz` |

**Domain status:** `otiscore.vercel.app` — confirmed live July 5, 2026. Ahmad attempted `oti.vercel.app` but it was already claimed by another project. `otiscore.vercel.app` is clean and professional. Medium-term: acquire a real domain like `openflowlabs.io` or `getoti.com` (~$15–30/yr on Porkbun.com) and point it at this Vercel project.

---

## The Five Trust Signals (scoring.ts — SACRED, NEVER TOUCH)

`src/lib/scoring.ts` is the core protected algorithm. It computes five signals, each scored 0–100, then applies weights to produce the final 0–100 overall score.

| Signal | Weight | What it measures |
|---|---|---|
| Wallet Age | **25%** | How long the wallet has existed on-chain |
| Transaction Count | **20%** | Volume and frequency of transactions |
| Token Holding Behavior | **20%** | Diversity and quality of tokens held |
| Smart Contract Interactions | **20%** | Depth of DeFi/contract engagement |
| Transaction Timing Patterns | **15%** | Consistency and naturalness of activity timing |

**Math:** `overall_score = (walletAge × 0.25) + (txCount × 0.20) + (tokenHolding × 0.20) + (contractInteractions × 0.20) + (timingPatterns × 0.15)`

**Example (49% wallet):**
- Wallet Age: raw=100, weighted=25 (100 × 0.25)
- Transaction Count: raw=20, weighted=4 (20 × 0.20)
- Token Holding: raw=22, weighted=4.4 (22 × 0.20)
- Smart Contract: raw=25, weighted=5 (25 × 0.20)
- Timing Patterns: raw=70, weighted=10.5 (70 × 0.15)
- **Total: 48.9 ≈ 49** ✓

---

## Supported Chains (15 total)

**EVM chains (10) — via Etherscan V2 API:**
Ethereum, Polygon, Arbitrum, Avalanche, Fantom, Linea, Scroll, zkSync, Sepolia, Holesky

**Non-EVM chains (5):**
TON, Solana, Sui, Bitcoin, Tron

**Intentionally returning 503 (need Etherscan Lite $49/mo):**
BSC (BNB Smart Chain), Base, Optimism

---

## Database Tables — Purpose of Each

### `chain_scores`
**Purpose:** The historical ledger — the core of OTI's data moat.
Every score ever computed for any wallet on any chain is stored here. Full record: wallet address, chain, all 5 raw signal scores, overall score, timestamp. This is what makes OTI more valuable over time — the data accumulates.

**Status:** ✅ Working. `persistScore()` writes here on every lookup.

**Known gap:** The `/api/score/:address/history` endpoint reads from an in-memory store (see `lib/history.ts`), NOT from this table. Fix: make the history endpoint query this table directly. The data is here — it's just not being served.

---

### `scores`
**Purpose:** Lightweight public lookup cache — given a wallet address, quickly return its last known overall score without querying the heavier `chain_scores` table with full signal data. Designed for simple integrations that only need a single trust number, not the full breakdown.

**Status:** ✅ Being written to. `persistScore()` writes to both `chain_scores` and `scores` simultaneously.

**Note:** This table is NOT redundant. It serves a different read pattern — fast, minimal, no signal detail.

---

### `wallet_links`
**Purpose:** The future portfolio / wallet cluster feature. Allows one user to link multiple wallet addresses as belonging to them. Once a user proves ownership of multiple wallets (via the WOR system, see ROADMAP), OTI can compute an aggregate trust profile across all of them.

**Status:** 🔵 Infrastructure ready. Zero routes use it yet. This is because it depends on the Wallet Ownership Registry (WOR) system which hasn't been built yet. `wallet_links` is the second step — WOR must exist first.

---

### `plan_configs`
**Purpose:** Rate limiting tier system. Different API plans have different daily quotas. `anonymous` = 3/day, `free` = higher limit. `pro` and `enterprise` tiers are planned.

**Status:** ✅ Working. The rate limiter reads `daily_limit` from this table dynamically.

**Planned next:** Self-serve developer portal where developers sign up, get a key, and choose their plan. Also: the frontend should display the current plan's quota dynamically (currently hardcoded "3 per day" text).

---

### `subscriptions` (API keys table)
**Purpose:** Developer access layer — every third party (exchange, DeFi protocol, custody platform) that wants to integrate OTI gets an API key here. Paired with `plan_configs`, these two tables form the complete monetization backend.

**Status:** ✅ Working. Missing `updated_at` column — needs migration when PATCH /admin/keys/:id is used.

---

### `compromised_wallets`
**Purpose:** The trust denylist. Any wallet address in this table gets flagged in every score response regardless of its calculated score. Powers the `"compromised": true` field and the red warning banner in the frontend.

**Status:** ✅ Working. Currently only admin can add wallets here.

**Planned next:** The Wallet Ownership Registry (WOR) system will allow verified wallet owners to self-submit compromise reports, which will automatically add to this table without admin involvement.

---

## Backend — Key Files and Their Purpose

### `src/lib/scoring.ts` ⚠️ SACRED — NEVER MODIFY
The trust scoring algorithm. Five signals, five weights, pure computation. This is OTI's protected IP.

### `src/lib/history.ts` ⚠️ NEEDS FIX
In-memory Map storing score history per wallet+chain key. This was temporary scaffolding — the data IS being written to `chain_scores` in the database, but the history endpoint reads from memory instead of the DB. Every Railway restart wipes this. Fix by making the history route query `chain_scores`.

### `src/routes/admin.ts` ⚠️ NEEDS SECURITY FIX
Full admin CRUD: API keys, plan configs, compromised wallets, usage stats. **Currently has zero authentication** — any person on the internet can call these endpoints. Must add `ADMIN_SECRET` header verification before any other work ships.

### `src/middlewares/apiKeyAuth.ts`
Daily quota logic. Reads from `plan_configs` table dynamically — not hardcoded.

### `src/middlewares/rateLimiter.ts`
IP-level rate limiter. 10 requests per minute per IP via express-rate-limit. Separate from API key quota.

### `lib/db/src/persist.ts`
`persistScore()` — writes to both `chain_scores` and `scores` tables. Called after every successful score computation.

### `src/lib/validateAddress.ts` (backend)
Server-side address format validation per chain.

### `src/lib/generateScoreCard.ts`
640×800px PNG canvas image — the shareable score card. Draws all 5 signals, footer says `openflowlabs.io`. This is the virality engine — every share is a free brand impression.

### `nixpacks.toml` ⚠️ SACRED — NEVER TOUCH
Railway build configuration. Breaking this breaks all deployments.

---

## Frontend — Key Files and Their Purpose

### `src/lib/scoring.ts` — NOT IN FRONTEND
Scoring logic is backend-only. Frontend receives computed scores via API.

### `src/api/client.ts`
OpenAPI-fetch client pointed at `VITE_API_BASE_URL`. Strongly typed via auto-generated schema.

### `src/api/schema.gen.ts`
Auto-generated TypeScript types from the live OpenAPI spec. Run `pnpm codegen` to regenerate. Never manually edit this file.

### `src/hooks/useScore.ts`
TanStack Query hook — fetches the score for a given wallet+chain. Handles loading, error, and cached states.

### `src/hooks/useHealth.ts`
Pings `GET /api/healthz` to check if the backend is reachable. **Currently unused in any component.** Designed to power a live status indicator in the navbar. Needs to be connected.

### `src/lib/validateAddress.ts` (frontend)
Client-side address format validation — gives instant format errors before hitting the API.

### `src/components/Logo.tsx`
`<img src="/logo.jpg" width={34} height={34}>`. Task 2 replaced the spiral SVG with this `<img>` tag (shipped ✅). However, a JPG rendered at 34px is blurry on high-DPI screens — a higher-resolution image or an SVG version is still needed. **The logo component change is done; the logo asset quality is still an open issue.**

### `src/pages/Home.tsx`
Single-page component that handles both the homepage (search form) and the results page (score display), switched by URL params.

### `vercel.json` ⚠️ SACRED — NEVER TOUCH
SPA routing: `{"rewrites":[{"source":"/(.*)", "destination":"/index.html"}]}`. Breaking this breaks all Vercel routing.

---

## Current API Response Shape (KNOWN BUG — signal scores need weighted values)

**Current (incorrect for developers):**
```json
{
  "address": "0x...",
  "chain": "ethereum",
  "cached": false,
  "compromised": false,
  "score": 49,
  "signals": {
    "walletAge": 100,
    "transactionCount": 20,
    "tokenHoldingBehavior": 22,
    "smartContractInteractions": 25,
    "transactionTimingPatterns": 70
  },
  "metadata": { ... }
}
```

**Planned (correct — with weighted contributions):**
```json
{
  "signals": {
    "walletAge":               { "score": 100, "weighted": 25.0,  "maxWeight": 25 },
    "transactionCount":        { "score": 20,  "weighted": 4.0,   "maxWeight": 20 },
    "tokenHoldingBehavior":    { "score": 22,  "weighted": 4.4,   "maxWeight": 20 },
    "smartContractInteractions":{ "score": 25, "weighted": 5.0,   "maxWeight": 20 },
    "transactionTimingPatterns":{ "score": 70, "weighted": 10.5,  "maxWeight": 15 }
  }
}
```

The frontend signal bars must be updated to use `weighted / maxWeight` for bar fill width, and display `weighted/maxWeight` as the score label (e.g., "25/25", "4/20"). This fix must happen in BOTH backend (API response shape) and frontend (bar rendering logic).

---

## CORS Policy (Intentional — Do Not Change)

`app.use(cors())` with no origin restrictions is **deliberate and correct**.

**Why:** OTI is a public trust scoring API. Exchanges, DeFi frontends, and wallet apps need to call OTI from their browser-based dashboards. CORS restrictions would break those integrations. API key quotas control WHO can call and HOW MUCH — CORS is not the right tool for access control. Open CORS + API key auth = the correct combination for a developer API.

**Future:** Once paid plans exist, restrict CORS to allowlisted origins per paid API key (complex — low priority).

---

## useHealth Hook — Purpose and Status

`src/hooks/useHealth.ts` pings `GET /api/healthz` from the React app. The endpoint returns `{"status":"ok"}` when the backend is running.

**Intended for:** A live status indicator dot in the navbar — green when the API is up, amber when degraded, red when down. This tells users immediately whether OTI has issues, without needing to run a lookup and get a confusing error.

**Current status:** The hook is complete and correct. It is imported by zero components. **Frontend Builder task:** Add a status dot component to the Navbar that uses this hook.
