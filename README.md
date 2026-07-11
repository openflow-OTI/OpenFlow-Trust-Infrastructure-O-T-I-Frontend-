# OTI — OpenFlow Trust Infrastructure (Frontend)

**Instant, on-chain trust scores for any wallet address — no login, no KYC.**

OTI scores any blockchain wallet from 0–100 using five on-chain behavioral signals (wallet age, transaction history, token holdings, contract interactions, and timing patterns). This repo is the public React frontend: the wallet lookup tool, the API docs experience, the whitepaper, and the admin dashboard that powers [otiscore.vercel.app](https://otiscore.vercel.app).

[![Live Site](https://img.shields.io/badge/live-otiscore.vercel.app-00e5a0?style=flat-square)](https://otiscore.vercel.app)
[![API Docs](https://img.shields.io/badge/docs-docs.otiscore.vercel.app-00e5a0?style=flat-square)](https://otiscore.vercel.app/docs/)
[![React](https://img.shields.io/badge/React-19-149eca?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)

---

## What's in the box

| Route | What it does |
|---|---|
| `/` | Marketing landing page — how OTI works, trust signals, supported chains |
| `/score` | The wallet lookup tool — enter an address + chain, get a trust score with a full signal breakdown |
| `/whitepaper` | The OTI whitepaper |
| `/docs/` | API reference, rate limits, and integration guides (proxied from the docs site) |
| `/admin/*` | Internal dashboard for managing API keys, usage, plan limits, and compromised-wallet reports |

## Tech stack

- **React 19 + TypeScript** — strict typing throughout, no `any` escape hatches on the data layer
- **Vite 8** — dev server and build
- **TanStack Query v5** + **openapi-fetch** — type-safe data fetching generated straight from the backend's OpenAPI spec
- **React Router 7** — routing
- **react-icons** / **@web3icons/react** — brand and chain iconography
- **Docusaurus** ([`oti-docs/`](./oti-docs)) — the API documentation site, served under `/docs`

## Getting started

```bash
npm install --legacy-peer-deps
npm run dev
```

The app serves on `http://localhost:5000`.

> `--legacy-peer-deps` is required while TypeScript 6 is in beta and some peer-dependency ranges haven't caught up yet.

### Environment variables

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | Yes | Base URL of the OTI backend API (e.g. `https://your-api.railway.app`). The app throws on load if this isn't set. |

Copy `.env.example` to `.env` and fill it in before running locally.

### Other scripts

```bash
npm run build     # type-check + production build
npm run preview   # preview a production build locally
npm run lint       # oxlint
npm run codegen    # regenerate the typed API client from the backend's live OpenAPI spec
```

## Project structure

```
src/
├── api/          # generated OpenAPI client (schema.gen.ts) — do not hand-edit, run `npm run codegen`
├── components/   # shared UI, including the marketing navbar/footer and the admin dashboard shell
├── hooks/        # data-fetching hooks (React Query)
├── lib/          # chain metadata, score-card image generation, small utilities
└── pages/        # one file per route (Home, Landing, Whitepaper, Admin, NotFound)

oti-docs/         # the Docusaurus API docs site, deployed under /docs
public/           # static assets (logo, favicon)
```

## Project documentation

This repo doubles as the shared source of truth for the OTI team, so the process/planning docs live at the root alongside the code rather than in a wiki:

| File | Purpose |
|---|---|
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Where every piece of OTI infrastructure lives and how the repos relate |
| [`ROADMAP.md`](./ROADMAP.md) | Strategic direction and what's coming next |
| [`TASKS.md`](./TASKS.md) / [`FRONTEND_TASKS.md`](./FRONTEND_TASKS.md) / [`BACKEND_TASKS.md`](./BACKEND_TASKS.md) | Active build task lists |
| [`FIXES.md`](./FIXES.md) | Open and completed bug fixes, hardening, and polish work |
| [`TOKENOMICS.md`](./TOKENOMICS.md) | OTI token supply, allocation, and distribution design |
| [`BUILDER_ONBOARDING.md`](./BUILDER_ONBOARDING.md) | How the team works and the ground rules for contributors |
| [`MANAGER_HANDOVER.md`](./MANAGER_HANDOVER.md) | Current project state, for anyone picking up project management |
| [`READING_GUIDE.md`](./READING_GUIDE.md) | Quick reference for which of the above to read, and in what order |

## License

Copyright © OpenFlow Labs. All rights reserved.
