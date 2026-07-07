# OTI Project Task Log

## Legend
- ✅ Done (Manager verified)
- 🔄 In Progress
- ⬜ Pending
- 🔵 Backend task

---

## Completed Tasks

### ✅ Admin Panel — Plan Configs Tab
Implemented the Plan Configs tab in the admin panel. Allows editing `daily_limit` and `description` per plan tier (anonymous, free, pro, enterprise) via PATCH /admin/plan-configs/{plan_name}.

### ✅ Admin Panel — Desktop Layout Fix
Root cause: `Layout.tsx` wraps all routes including `/admin` in `.app-main` (max-width 720px). Fixed using CSS `:has()` selector so `.app-main:has(.admin-shell)` expands to full width with no padding constraints.

### ✅ useAnonymousLimit Hook Fix
Hook was calling the admin-protected GET /admin/plan-configs endpoint (requires x-admin-secret) on the public homepage — always failing silently. Fixed to call the correct public endpoint GET /api/config/anonymous-limit. Falls back to architectural default of 3 when DB returns null.

### ✅ Homepage Scrollbar + Layout Fix
Switched from inner-div scroll to browser-level scroll. html/body/root use `min-height`, `.app-shell` has no `overflow: hidden`, `.app-main` has no `overflow-y: auto`, navbar is `position: sticky; top: 0`. Rate-note pinned to bottom via `margin-top: auto`.

### ✅ Task 7C — Dynamic Rate Limit Display
Homepage now shows "Anonymous lookups are limited to 20 per day." (or current DB value) dynamically from the live backend. Confirmed working live by Manager.

---

## Active Tasks

### 🔄 Task 8 — Professional Results Page Redesign
Full spec in FRONTEND_TASKS.md. Frontend Builder actively working on this.

---

## Pending Tasks

### ⬜ 🔵 Task 9C — Plan Limit Enforcement Verification (Backend task, Frontend aware)
Backend Builder is verifying that `daily_limit` changes made via Admin Panel → Plan Configs are correctly enforced by the API for all plan types (free, pro, enterprise). No frontend changes needed.
