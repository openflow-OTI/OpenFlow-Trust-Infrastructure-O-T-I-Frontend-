# OTI — Backend Builder Task List
> Last updated: July 10, 2026 (session 8 — full rewrite, corrected same day. Bug fixes/hardening/audits moved out to `FIXES.md`; this file now only lists genuine new-build tasks. Task 11C, the Signal Accuracy Audit, moved to `FIXES.md` as BF10 — it corrects existing scoring behavior rather than building something new. Correction: BF10 has NOT been sent to you yet and has NOT started — you are currently idle.) | Maintained by: Development Manager
> **This file contains your tasks only. Read BUILDER_ONBOARDING.md and ARCHITECTURE.md before starting anything here. Read `FIXES.md` too — BF10 will be your next active item once the Manager sends it.**
> Build in the exact order listed. Do not skip ahead.
>
> **⚠️ This is YOUR copy of this file, in YOUR own account/repo.** The Manager's copy is separate and does not sync with yours. Only mark a task done here, or add a new task here, when the Manager explicitly tells you to.

---

## Your Active Item Right Now

You are currently idle. Your next item will be **BF10 — Signal Accuracy Audit & Cross-Chain Fix**, documented in `FIXES.md`, not in this file. It's a correctness fix on the existing 5-signal scoring system (non-EVM chains scored with EVM-shaped logic), not a new feature — that's why it lives in the fixes log instead of here. Status: scoped, NOT yet sent to you, not started. Wait for the Manager to send it before starting anything.

---

## ✅ Your Completed Tasks (genuine new-build work)

### TASK 3 — Admin Route Authentication ✅
Built `adminAuth.ts` middleware, applied to all `/api/admin/*` routes, requiring a correct `x-admin-secret` header. Swagger updated with the `AdminSecretAuth` security scheme. Verified live on Railway.

### TASK 4 — History Endpoint → Database ✅
Built `GET /api/score/:address/history`, querying the `chain_scores` table with an optional `?chain=` filter (auto-detects chain family when omitted), ordered by `scored_at` DESC, capped at 50 records. OpenAPI spec updated; verified live.

### TASK 5 — Signal Scores → Weighted API Response ✅
Built the `signalWeighting.ts` transformer (sits alongside `scoring.ts`, never touches it) so the score response returns `{ score, weighted, maxWeight }` per signal on both the fresh-compute and cache-hit paths. History endpoint correctly still returns raw signals. Both OpenAPI specs updated. Verified live.

### TASK 6 — subscriptions.updated_at Migration ✅
Added the `updated_at` column to the `subscriptions` table via Drizzle migration; `PATCH /api/admin/keys/:id` now sets it on every update. Railway production migration run manually via the Railway Console (Railway does not auto-run migrations — see BF12 in `FIXES.md`).

### TASK 9C — Plan Limit Enforcement System ✅
Built out the real enforcement path across `apiKeyAuth.ts`, `score.ts`, and `admin.ts` (DELETE + PATCH) — the mechanism that actually gates requests against a key's daily quota and returns 429 once exhausted. Verified live: free plan (limit=2) 200/200/429 on requests 1–3; enterprise (limit=null) never 429s; PATCH edits persist with an updated `updated_at`.

---

## ⏳ Future Tasks (Not Yet Active — Manager Will Assign When Ready)

Nothing new is queued behind BF10 yet. Once it's verified done, the Manager will assign from this list, one at a time:

- **Phase 5 — Distribution channels:** Telegram Bot (Task 12), Discord Bot (Task 13), Embeddable Widget (Task 14). (Firefox Extension, Task 15, is a separate repo and mostly a Frontend Builder concern, but backend may need a lightweight lookup endpoint for it — TBD.)
- **Phase 2 — Wallet Ownership Registry (WOR):** `wallet_ownership` DB table, `POST /api/wallet/register`, `POST /api/report/compromised`, EIP-191 signature verification, `wallet_links` routes tying existing infrastructure into WOR. Ahmad's flagship feature — see `ROADMAP.md` Phase 2 for full context. Does not depend on Phase 1 Gate; can run in parallel with distribution-channel work if Ahmad wants to double-track.
- **Phase 3 — Monetization infrastructure:** self-serve developer portal backend, Pro/Enterprise plan rows in `plan_configs`, Stripe integration, Coinbase Commerce integration.

---

## Keeping This File Updated

You never update either file on your own initiative. Every update — whether marking a task done or adding a new one — happens only when the Manager explicitly tells you to.

**When you complete a task:**
1. Notify the Manager — do not mark anything done yourself
2. Wait for the Manager to review and confirm your work
3. Only when the Manager explicitly tells you to mark it done:
   - Move it to the ✅ Completed Tasks section in this file
   - Mark it ✅ in `TASKS.md` as well (or in `FIXES.md`, if it's a fix, not a task)
4. All your files must always match the Manager's

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
