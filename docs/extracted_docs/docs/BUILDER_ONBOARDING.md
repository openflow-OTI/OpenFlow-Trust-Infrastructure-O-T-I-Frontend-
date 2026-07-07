# OTI — Builder Onboarding Guide
> Last updated: July 5, 2026
> Read this completely before writing a single line of code.

---

## What is OTI?

**OTI (OpenFlow Trust Infrastructure)** is a blockchain wallet trust scoring API and frontend built by OpenFlow Labs (CEO: Ahmad).

Given a wallet address + chain, OTI returns a 0–100 trust score built from five weighted signals. It works across 15 blockchains and is designed as infrastructure for exchanges, DeFi protocols, and custody platforms.

**Live URLs:**
- Frontend: `https://otiscore.vercel.app`
- Backend API: `https://workspaceapi-server-production-5c0c.up.railway.app`
- Swagger docs: `/api/docs`

---

## The Team Structure

| Role | Who | Responsibility |
|---|---|---|
| Ahmad (CEO) | Human — Ahmad Alhassan | Reviews all work. Handles all Git operations — pushes and merges to GitHub himself. Sets env vars in Railway/Vercel. |
| Development Manager | AI agent | Writes your task prompts. Reviews your PRs. You report to them. |
| Frontend Builder | AI agent | Builds the React + Vite frontend |
| Backend Builder | AI agent | Builds the Express + TypeScript backend |

You are an AI Builder. Your job is to build. You do not touch Git, push code, or open PRs — Ahmad handles all of that himself through Replit's Git interface.

---

## How You Work

1. The Manager gives you a task prompt from your dedicated task file — `docs/BACKEND_TASKS.md` for the Backend Builder, `docs/FRONTEND_TASKS.md` for the Frontend Builder
2. You build it in your Replit workspace
3. When your work is complete, notify the Manager
4. Ahmad handles all pushing and branch management himself through Replit's Git interface
5. Ahmad reviews the work — if it looks good, he pushes and merges to `main` on GitHub
6. Vercel (frontend) or Railway (backend) auto-deploys on merge

**Never push anything yourself. Never open a PR yourself. Never touch Git directly.**
**Your job is to build. Ahmad handles all Git operations.**

---

## Tech Stack

### Backend (Express + TypeScript)
- **Runtime:** Node.js + TypeScript
- **Framework:** Express
- **Database:** PostgreSQL via Drizzle ORM
- **Deployment:** Railway
- **Build config:** `nixpacks.toml` — **NEVER TOUCH THIS FILE**

### Frontend (React + Vite)
- **Framework:** React + Vite
- **Data fetching:** TanStack Query
- **API client:** openapi-fetch (strongly typed via `schema.gen.ts`)
- **Deployment:** Vercel
- **Routing config:** `vercel.json` — **NEVER TOUCH THIS FILE**

---

## Sacred Files — Never Modify Without Manager Approval

| File | Why |
|---|---|
| `src/lib/scoring.ts` (backend) | Core trust algorithm — protected IP. Even reading it is fine, touching it is not. |
| `nixpacks.toml` | Railway build configuration — breaking this breaks all deployments |
| `vercel.json` | SPA routing — breaking this breaks all Vercel routing |

---

## Key Things to Know Before Writing Code

### 1. The Scoring Algorithm
Five signals, five weights:
- Wallet Age: 25% weight
- Transaction Count: 20% weight
- Token Holding Behavior: 20% weight
- Smart Contract Interactions: 20% weight
- Transaction Timing Patterns: 15% weight

The API returns raw signal scores (0-100 each). The weighted contribution = `raw_score × weight`. This is important context for several pending tasks.

### 2. The Database Tables
Read `docs/ARCHITECTURE.md` — every table has a specific purpose. Do not assume anything is redundant. Ask the Manager if you're unsure.

### 3. CORS
Wide open by design — this is a public developer API. Do not add origin restrictions.

### 4. Error Handling
Always return structured errors. Never return raw stack traces to the client. The existing error pattern in the codebase is the standard to follow.

### 5. The OpenAPI Schema
The frontend uses auto-generated types from the backend's OpenAPI spec. If you change the backend response shape, the Frontend Builder must run `pnpm codegen` to regenerate `schema.gen.ts`. Always coordinate with the Manager when making response shape changes.

---

## Backend Builder Specific Notes

- All backend code is in TypeScript with strict type checking
- Drizzle ORM for all database operations — no raw SQL unless absolutely necessary
- When adding new routes, add them to the OpenAPI spec/Swagger docs
- When adding DB columns, write a migration using Drizzle migrations
- Environment variables are set in Railway — ask the Manager what variables you need and they will coordinate with Ahmad to set them
- Run the test suite before submitting a PR (if tests exist for your change)

## Frontend Builder Specific Notes

- `src/api/schema.gen.ts` is auto-generated — NEVER manually edit it. Run `pnpm codegen` to regenerate after backend changes.
- The design language: black background, mint green (`#00ff87` approx) as accent, monospace typography
- Ahmad loves the chain selector component — do not change it
- When in doubt about design decisions, ask the Manager — Ahmad has strong visual opinions
- All CSS is in `src/index.css` — no component library, no CSS modules. Follow existing class naming conventions.
- Test on mobile (375px width) — most users are on mobile

---

## Your First Step

Read the task prompt from the Manager carefully. If anything is unclear, ask the Manager before writing code — it's much easier to clarify upfront than to rebuild after.

Good luck.
