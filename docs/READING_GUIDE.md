# OTI Docs — Who Reads What

> Quick reference for Ahmad, Managers, and Builders.

---

## ⚠️ Builders keep their own separate copies — nothing auto-syncs

Frontend Builder and Backend Builder each work in their own Replit account, against their own GitHub checkout. When they extract the OTI docs zip, they get their OWN physical copies of `TASKS.md`, `FRONTEND_TASKS.md`/`BACKEND_TASKS.md`, etc. — these are separate files from the Manager's copies, not shared/live documents.

**This means:** the Manager marking a task ✅ in the Manager's own `TASKS.md` (or `FRONTEND_TASKS.md`/`BACKEND_TASKS.md`) does absolutely nothing to the Builder's copy. Every time a task is confirmed done, or a new task is added, the Manager must send the Builder an explicit instruction telling them to update their own copy of the relevant file(s). Never assume a Builder's file is in sync just because the Manager's file says so.

---

## By Role

### 🧑‍💼 Manager (reads on first day of new account)
| File | When |
|---|---|
| `MANAGER_HANDOVER.md` | First — current state, decisions, next 3 things |
| `ARCHITECTURE.md` | Second — what everything in the codebase is |
| `ROADMAP.md` | Third — the full strategic picture |
| `TASKS.md` | Fourth — genuine new-build tasks, what to assign right now |
| `FIXES.md` | Fifth — open/in-progress bug fixes and cleanup, per Builder |

### 🛠️ Frontend Builder (reads on first day)
| File | When |
|---|---|
| `BUILDER_ONBOARDING.md` | First — how the team works, rules, sacred files |
| `ARCHITECTURE.md` | Second — what everything is before touching anything |
| `FRONTEND_TASKS.md` | Then — your dedicated new-build task list with full prompts and context |
| `FIXES.md` | Then — check the Frontend Fixes section for your current active item, if any |
| `ROADMAP.md` | Optional — useful context but not required before building |

### 🛠️ Backend Builder (reads on first day)
| File | When |
|---|---|
| `BUILDER_ONBOARDING.md` | First — how the team works, rules, sacred files |
| `ARCHITECTURE.md` | Second — what everything is before touching anything |
| `BACKEND_TASKS.md` | Then — your dedicated new-build task list with full prompts and context |
| `FIXES.md` | Then — check the Backend Fixes section for your current active item, if any |
| `ROADMAP.md` | Optional — useful context but not required before building |

---

## What Gets Updated and When

| File | Updated by | When to update |
|---|---|---|
| `MANAGER_HANDOVER.md` | Manager | Before EVERY Manager session ends (especially before credits run out) |
| `TASKS.md` | Manager (adds new tasks) + Builder (marks ✅ or adds new task — only when Manager explicitly says so) | Every time a new-build task's status changes or a new one is assigned |
| `FIXES.md` | Manager (adds new fixes) + Builder (marks ✅ or adds new fix — only when Manager explicitly says so) | Every time a fix's status changes or a new one is raised |
| `BACKEND_TASKS.md` | Backend Builder — only when Manager explicitly tells them to | Marking a task done OR adding a new task — never without Manager instruction |
| `FRONTEND_TASKS.md` | Frontend Builder — only when Manager explicitly tells them to | Marking a task done OR adding a new task — never without Manager instruction |
| `ROADMAP.md` | Manager | When major scope decisions change, new phases added, MVP criteria change |
| `ARCHITECTURE.md` | Manager | When new infrastructure is added or a table/component's purpose changes |
| `BUILDER_ONBOARDING.md` | Manager | Only when the team structure or process changes (rare) |
| `READING_GUIDE.md` | Manager | Only when new files are added to docs/ |

---

## Which File Has What?

**`TASKS.md`** — the master list of genuine new-build tasks: new pages, new systems, new features. Every task across both roles, all phases, full context. The Manager adds new tasks here first. Builders also update this file — but only when the Manager explicitly tells them to (marking a task ✅ or adding a newly assigned task).

**`FIXES.md`** — the master list of bug fixes, corrections, hardening passes, and cleanup/polish work — anything that repairs or refines something already built, rather than building something new. Split into a Backend section and a Frontend section, each numbered smallest/quickest fix first. Kept deliberately separate from `TASKS.md` so the task list only shows forward-building work.

**`BACKEND_TASKS.md`** — the Backend Builder's new-build task list. Only backend tasks, in order, with the "why" explained. This is the Backend Builder's working document — check `FIXES.md` too for anything assigned to them there.

**`FRONTEND_TASKS.md`** — the Frontend Builder's new-build task list. Only frontend tasks, in order, with the "why" explained. This is the Frontend Builder's working document — check `FIXES.md` too for anything assigned to them there.

**`ROADMAP.md`** — the strategic context (why we're building it, the phases, the business goals). The map. `TASKS.md` is the turn-by-turn directions; `FIXES.md` is the maintenance log.
