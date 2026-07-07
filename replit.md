# oti-frontend

React + Vite dashboard for the **OpenFlow Trust Infrastructure (OTI)**. Displays wallet health scores, trust data across blockchains (Ethereum, Solana, TON, etc.), and an admin panel for managing API keys and compromised wallets.

## Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 8
- **Data Fetching**: TanStack Query v5 + `openapi-fetch` (type-safe)
- **Styling**: Tailwind CSS
- **Icons**: `@web3icons/react`

## Running

```
npm install --legacy-peer-deps && npm run dev
```

App serves on port 5000.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | Yes | Base URL of the OTI backend API (e.g. `https://your-api.railway.app`) |

The app will throw an error on load if `VITE_API_BASE_URL` is not set.

## Key Routes

- `/` — Wallet health/score lookup (Home)
- `/admin/*` — Admin dashboard (API keys, usage, plan configs, compromised wallets)

## Code Generation

To sync the OpenAPI client with the live backend spec:

```
npm run codegen
```

## User Preferences
