# OTI Docs — Who Reads What

> Quick reference for Ahmad, Managers, and Builders.

---

## By Role

### 🧑‍💼 Manager (reads on first day of new account)
| File | When |
|---|---|
| `MANAGER_HANDOVER.md` | First — current state, decisions, next 3 things |
| `ARCHITECTURE.md` | Second — what everything in the codebase is |
| `ROADMAP.md` | Third — the full strategic picture |
| `TASKS.md` | Fourth — what to assign right now |

### 🛠️ Frontend Builder (reads on first day)
| File | When |
|---|---|
| `BUILDER_ONBOARDING.md` | First — how the team works, rules, sacred files |
| `ARCHITECTURE.md` | Second — what everything is before touching anything |
| `FRONTEND_TASKS.md` | Then — your dedicated task list with full prompts and context |
| `ROADMAP.md` | Optional — useful context but not required before building |

### 🛠️ Backend Builder (reads on first day)
| File | When |
|---|---|
| `BUILDER_ONBOARDING.md` | First — how the team works, rules, sacred files |
| `ARCHITECTURE.md` | Second — what everything is before touching anything |
| `BACKEND_TASKS.md` | Then — your dedicated task list with full prompts and context |
| `ROADMAP.md` | Optional — useful context but not required before building |

---

## What Gets Updated and When

| File | Updated by | When to update |
|---|---|---|
| `MANAGER_HANDOVER.md` | Manager | Before EVERY Manager session ends (especially before credits run out) |
| `TASKS.md` | Manager (adds new tasks) + Builder (marks ✅ or adds new task — only when Manager explicitly says so) | Every time a task status changes or a new task is assigned |
| `BACKEND_TASKS.md` | Backend Builder — only when Manager explicitly tells them to | Marking a task done OR adding a new task — never without Manager instruction |
| `FRONTEND_TASKS.md` | Frontend Builder — only when Manager explicitly tells them to | Marking a task done OR adding a new task — never without Manager instruction |
| `ROADMAP.md` | Manager | When major scope decisions change, new phases added, MVP criteria change |
| `ARCHITECTURE.md` | Manager | When new infrastructure is added or a table/component's purpose changes |
| `BUILDER_ONBOARDING.md` | Manager | Only when the team structure or process changes (rare) |
| `READING_GUIDE.md` | Manager | Only when new files are added to docs/ |

---

## Which File Has What?

**`TASKS.md`** — the master task list. Every task across both roles, all phases, full context. The Manager adds new tasks here first. Builders also update this file — but only when the Manager explicitly tells them to (marking a task ✅ or adding a newly assigned task).

**`BACKEND_TASKS.md`** — the Backend Builder's task list. Only backend tasks, in order, with the "why" explained. This is the Backend Builder's working document.

**`FRONTEND_TASKS.md`** — the Frontend Builder's task list. Only frontend tasks, in order, with the "why" explained. This is the Frontend Builder's working document.

**`ROADMAP.md`** — the strategic context (why we're building it, the phases, the business goals). The map. TASKS.md is the turn-by-turn directions.
