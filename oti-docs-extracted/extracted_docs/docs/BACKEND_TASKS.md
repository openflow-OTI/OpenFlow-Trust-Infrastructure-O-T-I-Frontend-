# OTI — Backend Builder Task List
> Last updated: July 5, 2026 | Maintained by: Development Manager
> **This file contains your tasks only. Read BUILDER_ONBOARDING.md and ARCHITECTURE.md before starting anything here.**
> Build in the exact order listed. Do not skip ahead.

---

## ✅ Your Completed Tasks

None yet — you are newly onboarded. Welcome.

---

## 🔴 Your Task Queue — Build In This Exact Order

---

### TASK 3 — Admin Route Authentication
**Phase:** 0 — Security
**Priority:** CRITICAL — nothing else ships until this is done
**Depends on:** Nothing — this is your first task

**Why you are doing this:**
Right now, every `/api/admin/*` endpoint on the live Railway server is completely open to the internet. Anyone who finds the URL can create or delete API keys, flag wallets as compromised, and flush the cache — with no password, no header, nothing stopping them. This is an active security risk on a live production server. Everything else — all other tasks, all other features — is blocked until this is fixed. This is your starting point for a reason.

**What to build:**
Create `src/middlewares/adminAuth.ts`. It reads `process.env.ADMIN_SECRET` and checks it against the `x-admin-secret` request header. If the header is missing or doesn't match, return HTTP 401 `{"error": "Unauthorized"}`. Apply this middleware to the entire admin router in `src/routes/admin.ts`. Add `ADMIN_SECRET` to Railway environment variables — Ahmad sets the actual value. Update the Swagger/OpenAPI docs to show `x-admin-secret` as a required header on all `/api/admin/*` endpoints.

**Definition of done:** Every `/api/admin/*` route returns 401 without the correct header. Swagger shows the requirement. Ahmad has set `ADMIN_SECRET` in Railway.

---

### TASK 4 — History Endpoint → Database
**Phase:** 1 — Bug Fixes
**Priority:** HIGH
**Depends on:** Task 3 must be merged first

**Why you are doing this:**
OTI's data moat — its long-term competitive advantage — is the history of every wallet ever scored. That history lives in the `chain_scores` database table and accumulates permanently. But the `/api/score/:address/history` endpoint currently reads from an in-memory store (`lib/history.ts`) that wipes itself every time Railway restarts. Every restart loses all history visibility. Bots are about to start generating real query volume — that means Railway restarts will happen, and losing history at that point is a business intelligence loss. The data is already in the database. This task just makes the endpoint read from the right place.

**What to build:**
Change `GET /api/score/:address/history` (currently in `src/routes/history.ts`) to query the `chain_scores` table from the database instead of reading from the in-memory store in `lib/history.ts`. The `chain_scores` table already has all historical data — it just isn't being served through the history endpoint. The query should filter by wallet address and optionally by chain (if `?chain=` param is provided), ordered by `created_at` descending, limited to the most recent 50 records. The in-memory `lib/history.ts` can remain as a file but should no longer be used by the history route. Update the OpenAPI spec to reflect the response shape (it now comes from the database).

**Definition of done:** History endpoint returns database records that persist across Railway restarts. Test by scoring a wallet, restarting the server, and verifying history still appears.

---

### TASK 5 — Signal Scores → Weighted API Response
**Phase:** 1 — Bug Fixes
**Priority:** HIGH
**Depends on:** Task 3 must be merged first

**Why you are doing this:**
The API currently returns raw signal scores (e.g. `"walletAge": 100`). This misleads every developer who integrates OTI — they see 100 and think the wallet scored 100 out of 100 on wallet age, when in reality wallet age only contributes 25 points to the total score. The Frontend Builder also cannot fix the signal bars correctly until this response shape is fixed. This change unblocks both the frontend display fix and gives all API integrators accurate data.

⚠️ **Coordination point — Frontend Builder:**
When your PR for this task is merged and deployed to Railway, notify the Manager. The Frontend Builder cannot start Task 7 (signal bar fix) until your new response shape is live. The Manager will coordinate the handoff.

**What to build:**
Update the score response shape returned by `GET /api/score/:address`. Currently `signals` is a flat object of raw scores `{"walletAge": 100, "transactionCount": 20, ...}`. Change it to include weighted contribution data per signal.

New shape:
```json
"signals": {
  "walletAge":                { "score": 100, "weighted": 25.0,  "maxWeight": 25 },
  "transactionCount":         { "score": 20,  "weighted": 4.0,   "maxWeight": 20 },
  "tokenHoldingBehavior":     { "score": 22,  "weighted": 4.4,   "maxWeight": 20 },
  "smartContractInteractions":{ "score": 25,  "weighted": 5.0,   "maxWeight": 20 },
  "transactionTimingPatterns":{ "score": 70,  "weighted": 10.5,  "maxWeight": 15 }
}
```

The weights are defined in `scoring.ts` — **do NOT modify `scoring.ts`**. Apply the weights in the response transformer layer only (the route handler or a separate formatter). `weighted = score × (maxWeight / 100)`. Update the OpenAPI spec to reflect the new signal object shape. The `score` field (0–100 overall) must remain unchanged.

**Definition of done:** API response includes `score`, `weighted`, and `maxWeight` for each signal. Overall `score` field still equals the sum of all `weighted` values. Swagger updated.

---

### TASK 6 — subscriptions updatedAt Migration
**Phase:** 1 — Bug Fixes
**Priority:** MEDIUM
**Depends on:** Task 3 must be merged first

**Why you are doing this:**
The Admin Panel (being built by the Frontend Builder in Task 9) will display a table of all API keys including a "last modified" column. That column needs a timestamp from the database. The `subscriptions` table currently has no `updated_at` column, so every edit to an API key has no timestamp recorded. This migration adds that column and wires it up so the Admin Panel has the data it needs when it ships.

⚠️ **Coordination point — Frontend Builder:**
The Frontend Builder's Task 9 (Admin Panel UI) depends on this migration being merged and deployed first. Once your PR is merged and Railway has run the migration, notify the Manager so the Frontend Builder can proceed.

**What to build:**
Add an `updated_at` column to the `subscriptions` table via a Drizzle migration. The column should be `timestamp`, nullable, defaulting to null (so existing rows aren't affected). Update the `PATCH /api/admin/keys/:id` handler in `src/routes/admin.ts` to set `updated_at: new Date()` on every update. Update the Drizzle schema file for the `subscriptions` table to include the new column.

**Definition of done:** Migration runs cleanly. PATCH endpoint updates `updated_at`. Column visible in database.

---

### TASK 7D — Bitcoin Wallet Age Fix
**Phase:** 1 — Bug Fixes
**Priority:** MEDIUM
**Depends on:** Task 3 must be merged first

**Why you are doing this:**
Bitcoin is one of the 5 non-EVM chains OTI supports. Wallet Age carries 25% of the total trust score — the single highest weight of any signal. A Bitcoin wallet created in 2020 should score near 100 on wallet age, giving it 25 points toward the overall score. Instead, a bug in the timestamp parsing returns `walletAgedays: 5`, making every Bitcoin wallet appear brand new regardless of its actual age. This means every Bitcoin score is wrong. The fix is isolated to the Bitcoin chain handler and does not touch `scoring.ts`.

**What to build:**
There is a timestamp parsing bug in the Bitcoin chain handler (`bitcoin.ts` or equivalent). When computing `walletAgedays`, the calculation returns `5` for wallets that are years old (e.g., a wallet created in 2022 returns only 5 days). Investigate the timestamp format returned by the Bitcoin API (likely milliseconds vs seconds confusion, or epoch vs block height conversion error). Fix the calculation so `walletAgedays` correctly reflects the number of days since the wallet's first transaction. Verify with a known old Bitcoin wallet address.

**Definition of done:** A Bitcoin wallet with first activity in 2020 returns a `walletAgedays` value greater than 1,000 days.

---

## ⏳ Future Tasks (Not Yet Active — Manager Will Assign When Ready)

These are coming after the queue above is complete. You do not need to read these in detail now — they are listed so you know what is ahead.

- **Phase 5:** Telegram bot, Discord bot, embeddable widget (`/bots/` directory in this repo)
- **Phase 6:** Wallet Ownership Registry (WOR) — Ahmad's flagship feature. Off-chain EIP-191 signing + passkey. New DB tables, new routes.
- **Phase 7:** Monetization — self-serve developer portal, paid plan tiers, BSC/Base/Optimism unlock

---

## Keeping This File Updated

You never update either file on your own initiative. Every update — whether marking a task done or adding a new one — happens only when the Manager explicitly tells you to.

**When you complete a task:**
1. Notify the Manager — do not mark anything done yourself
2. Wait for the Manager to review and confirm your work
3. Only when the Manager explicitly tells you to mark it done:
   - Move it to the ✅ Completed Tasks section in this file
   - Mark it ✅ in `TASKS.md` as well
4. Both files must always match

**When the Manager assigns you a new task:**
1. The Manager will explicitly tell you to add the new task to your file
2. Only then: add it to the bottom of your Queue section in this file AND add it to `TASKS.md`
3. Read it fully before starting — every task has a "Why" and a "Definition of done"
4. Do not start a task that has a ⚠️ dependency warning until the Manager confirms it is cleared

**General rules:**
- Never touch Git, never push, never open a PR — Ahmad handles all of that himself
- Never touch `scoring.ts` — ever
- Never touch `nixpacks.toml` — ever
- If a task is blocked, tell the Manager immediately — do not sit on a blocker
- Never update any file without the Manager's explicit instruction
