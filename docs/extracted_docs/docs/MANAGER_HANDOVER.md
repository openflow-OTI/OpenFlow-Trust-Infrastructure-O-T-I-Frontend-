# OTI — Manager Handover Document
> Last updated: July 5, 2026
> **If you are a new Manager reading this: start here. Then read ARCHITECTURE.md, ROADMAP.md, and TASKS.md in that order.**

---

## ⚠️ Important — Where the Code Lives

This Replit workspace is the **Manager's workspace** — used for documentation, prompt writing, and roadmap management only. It does NOT contain OTI source code.

The actual OTI source code lives in Ahmad's GitHub repositories:
- **Backend repo:** https://github.com/openflow-OTI/OpenFlow-Trust-Infrastructure-OTI- — **PRIVATE**
- **Frontend repo:** https://github.com/openflow-OTI/OpenFlow-Trust-Infrastructure-O-T-I-Frontend- — **PUBLIC**
- **Docs repo:** https://github.com/openflow-OTI/OpenFlow-Trust-Infrastructure-OTI-Docs — **Manager's workspace repo**

---

## About Ahmad

Ahmad is CEO of OpenFlow Labs and sole GitHub merge authority. He does NOT want the Manager to touch code or push to GitHub. The Manager writes task prompts for Builders, reviews PRs with GO/NO-GO decisions, and owns the product roadmap.

- Call him Ahmad (not "sir", not "boss")
- He is not a software engineer — explain things clearly but don't be condescending
- He has strong product vision — trust it, build around it
- He uses the Replit multi-account system (see bottom of this file)

---

## The Team

| Role | Status | Notes |
|---|---|---|
| Ahmad (CEO) | Always active | Sole GitHub merge authority |
| Frontend Builder | Active | Builds frontend, notifies Manager when work is done |
| Backend Builder | **Account created July 4, 2026 — NOT YET ONBOARDED** | First task = Admin auth |
| Development Manager | This account | Writes prompts, reviews PRs, owns roadmap |

---

## Current State of Production (as of July 5, 2026)

**Live and working:**
- ✅ Backend on Railway: `https://workspaceapi-server-production-5c0c.up.railway.app`
- ✅ Frontend on Vercel: `https://otiscore.vercel.app`
- ✅ 12 chains scoring (10 EVM + TON, Solana, Sui, Bitcoin, Tron = 15 total; 3 intentionally 503)
- ✅ API key + daily quota system (dynamic, DB-driven)
- ✅ Score caching
- ✅ Compromised wallet denylist + red banner UI
- ✅ PNG score card sharing
- ✅ Logo component fix (Task 2 — shipped)
- ✅ UI polish (Task 1 — shipped)

**Open issues:**
- 🚨 Admin endpoints have zero authentication — anyone can create/delete keys and flag wallets
- 🟠 API response returns raw signal scores — should return weighted contributions (misleads developers and powers incorrect frontend display)
- 🟠 History endpoint reads from in-memory store — resets on Railway restart (DB data is there, endpoint just not reading it)
- 🟡 Logo asset is blurry — component fix done, but the JPG image itself is low-res
- 🟡 Results page UX needs professional redesign (Ahmad's explicit request)
- 🟡 Bitcoin wallet age calculation bug
- 🟡 BSC/Base/Optimism return 503 — waiting on Ahmad's Etherscan Lite ($49/mo) decision

---

## Active Decisions — Do Not Reverse Without Ahmad's Approval

| Decision | Reason |
|---|---|
| `scoring.ts` is SACRED — never modify | Core IP, protected algorithm |
| `nixpacks.toml` is SACRED — never touch | Railway build config |
| `vercel.json` is SACRED — never touch | SPA routing |
| CORS is fully open | Intentional — OTI is a public developer API |
| BSC/Base/Optimism are 503 | Waiting for Etherscan Lite decision |
| Admin page is URL-only (no nav link) | Ahmad's decision |
| Non-EVM scoring heuristics are unchanged | Ahmad confirmed acceptable |
| WOR reports are automated (no admin review) | Ahmad's decision |

---

## Next 3 Things the Manager Must Do (In Order)

### 1. Onboard the Backend Builder
Write a comprehensive onboarding prompt for the Backend Builder covering:
- What OTI is and the tech stack
- Sacred files (scoring.ts, nixpacks.toml)
- How the work flow operates — Builder builds, notifies Manager, Ahmad handles all Git
- Their first task (Task 3: Admin auth — see TASKS.md)
- Link to this docs folder

### 2. Assign Task 3 — Admin Route Authentication
Full prompt for Backend Builder:
> "Add `ADMIN_SECRET` header verification to all `/api/admin/*` routes. Create `src/middlewares/adminAuth.ts` that reads `process.env.ADMIN_SECRET` and validates it against an `x-admin-secret` request header. Return 401 if missing or incorrect. Apply to the admin router. Ahmad will set `ADMIN_SECRET` in Railway environment variables. Update Swagger docs to document the header requirement."

### 3. Assign Task 4 — History Endpoint → Database
After Task 3 is merged, assign the history endpoint fix (see BACKEND_TASKS.md Task 4 for full spec). Then assign Task 5 (Signal Scores → Weighted Response Shape) immediately after.

---

## The Replit Multi-Account System

Ahmad uses multiple Replit free-tier accounts to avoid hitting credit limits:
- **Manager account** — writes prompts, manages roadmap
- **Frontend Builder account** — builds frontend, notifies Manager when work is done
- **Backend Builder account** — builds backend, notifies Manager when work is done

When credits exhaust → Ahmad pushes to GitHub via Replit's Git interface → open new account → handover → continue.

**The problem:** Handover documents between Manager accounts were inconsistent, causing context loss and orphaned planned features appearing as "abandoned" code.

**The solution (implemented July 5, 2026):**
All context now lives in the GitHub repository itself — not in AI chat memory:
- `docs/MANAGER_HANDOVER.md` — this file
- `docs/ARCHITECTURE.md` — what every piece of the codebase is
- `docs/ROADMAP.md` — all planned features with status
- `docs/TASKS.md` — master task list (all tasks, all roles — Manager adds tasks, Builders update it only when Manager says so)
- `docs/BACKEND_TASKS.md` — Backend Builder's dedicated task list
- `docs/FRONTEND_TASKS.md` — Frontend Builder's dedicated task list
- `docs/BUILDER_ONBOARDING.md` — onboarding for each Builder role
- `docs/READING_GUIDE.md` — who reads which file and when

---

## How Builders Get These Docs (No Manual File Sharing Needed)

Builders do not receive docs via email or file download. The `docs/` folder lives inside the GitHub repos. When a Builder clones the repo to start work, the docs come with it automatically.

**What Ahmad tells each Builder on day one:**
> "Clone the repo. Open the `docs/` folder. Read `BUILDER_ONBOARDING.md` first, then `ARCHITECTURE.md`, then open your dedicated task file — `BACKEND_TASKS.md` if you are the Backend Builder, `FRONTEND_TASKS.md` if you are the Frontend Builder."

**GitHub visibility:**
- **Frontend repo → PUBLIC** — React code has no secrets, making it public builds developer trust
- **Backend repo → PRIVATE** — scoring algorithm IP, admin routes, API key logic stays private

---

## New Manager Startup Procedure (5 minutes, not 5 hours)
1. Clone the repo (or `git pull` if already cloned)
2. Read `docs/MANAGER_HANDOVER.md` (this file)
3. Read `docs/ARCHITECTURE.md`
4. Read `docs/ROADMAP.md`
5. Read `docs/TASKS.md`
6. Check GitHub for open PRs awaiting review
7. Continue from "Next 3 Things" section above

**Rule before ending ANY Manager session:**
Update the following before closing — no exceptions:
1. If a task was confirmed done: explicitly tell the Builder to mark it ✅ in both their own task file AND `TASKS.md`
2. If a new task was added: add it to `TASKS.md` first, then explicitly tell the Builder to add it to their own file AND to `TASKS.md`
3. Builders do not update any file on their own — they act only when the Manager explicitly tells them to, whether marking done or adding new tasks
4. Update "Current State of Production" and "Next 3 Things" in this file
5. Ahmad pushes everything via Replit's Git interface

This is the lifeline between Manager accounts. 5 minutes of updating now saves hours of re-research later.

---

## Critical Context That Must Never Be Lost

1. **Wallet Ownership Registry (WOR)** is Ahmad's flagship new feature. Off-chain signing + passkey pre-registration. Users can self-report wallet compromise even when attacker also has keys (passkey is the differentiator). No blockchain. No admin review. Fully automated. See ROADMAP.md Phase 4.

2. **`wallet_links` table** was built in anticipation of WOR + portfolio. It is NOT abandoned — it needs WOR to exist first.

3. **`scores` table** is a lightweight fast-lookup cache alongside the full `chain_scores` historical table. NOT redundant — serves a different read pattern.

4. **`useHealth` hook** was designed for a navbar API status indicator dot. NOT unused by mistake — just needs a component connected to it.

5. **History endpoint** reads from memory as temporary scaffolding — the permanent fix is to read `chain_scores` from DB. Data is there.

6. **The 3 unavailable chains** (BSC, Base, Optimism) return 503 intentionally — they need Etherscan Lite subscription. Ahmad is aware.
