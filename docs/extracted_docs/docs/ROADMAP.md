# OTI — Product Roadmap
> Last updated: July 5, 2026 | Maintained by: Development Manager
> Source document: OTI Full Distribution & Technical Development Strategy (Founder's Playbook, July 2026)

---

## The Core Thesis (from the Playbook)
> "OTI is not a wallet checker website. It is on-chain behavioral intelligence as a service — the infrastructure layer for trust in Web3. The website is the demo. The API is the product."

**Who buys this:**
- 🏦 Exchanges & Gateways — screen withdrawal destinations, detect compromised wallets (enterprise sale, highest value)
- ⚡ DeFi Protocols — risk-adjust lending/collateral based on wallet trust (API integration)
- 🖼️ NFT Marketplaces — seller trust badges, filter bad actors (API integration)
- 💸 Payment Processors — gate crypto payments behind minimum trust score (API integration)

**Three goals (from Playbook):**
- 🎯 90 days after distribution launches: 1,000 active API users via bots + widget
- 🏗️ 6 months: 3 paying business API integrations
- 🏦 12 months: first enterprise exchange contract

---

## MVP Definition

**MVP = the core product is secure, correct, and presentable to potential partners.**

MVP is complete when:
1. ✅ 15 chains scoring correctly
2. ✅ API key + quota system working
3. ✅ Score sharing (PNG card) working
4. ⬜ Admin endpoints are secured (security — blocker)
5. ⬜ Score history served from database, not memory (correctness)
6. ⬜ Signal scores return weighted values in API response (correctness)
7. ⬜ Signal bars display weighted contributions on frontend (correctness)
8. ⬜ Results page redesigned to professional standard (presentability)

---

## PHASE 0 — SECURITY 🔴 MUST SHIP FIRST
**Owner: Backend Builder | Status: Not started**

| Task | Description |
|---|---|
| Admin auth | Add `ADMIN_SECRET` header check to ALL `/api/admin/*` routes. Anyone on the internet can currently create/delete API keys and flag wallets. This blocks everything else. |

---

## PHASE 1 — BUG FIXES 🔴
**Owner: Backend Builder + Frontend Builder | Status: Not started**

| Task | Owner | Description |
|---|---|---|
| History → DB | Backend | `GET /api/score/:address/history` must query `chain_scores` table, not in-memory store. **Urgent: bots will generate real query volume — losing that history is a business intelligence loss.** |
| Signal scores → weighted | Backend | API response `signals` object must include `score`, `weighted`, `maxWeight` per signal. Required by frontend fix, bots, and any developer integration. |
| Signal bars → weighted display | Frontend | Update bars to use `weighted/maxWeight` for fill width and display `weighted/maxWeight` as label. Depends on backend change. |
| subscriptions updatedAt | Backend | Add `updated_at` column to `subscriptions` table via migration. Required before Admin UI ships. |
| Bitcoin wallet age fix | Backend | Fix timestamp parsing bug in `bitcoin.ts` — returns `walletAgedays: 5` instead of correct value. |
| txCount cap indicator | Frontend | Display "1,000+" when `txCount >= 1000`. |

---

## PHASE 2 — OPERATIONAL (Partially Done)
**Owner: Frontend Builder | Status: 🟡 Tasks 1–2 complete**

| Task | Status | Description |
|---|---|---|
| Task 1 — UI polish | ✅ Done | Homepage title, back button, chain icons, dead CSS, isKnownChain guard |
| Task 2 — Logo fix | ✅ Done | Logo.tsx → img tag, generateScoreCard uses loadImage() |
| Admin panel UI | 🔴 Not started | `/admin` route, URL-only. Needs: key management, plan configs, usage stats, cache flush, query history. Secured by ADMIN_SECRET. **Required before bots launch.** |
| Dynamic rate limit display | 🔴 Not started | Replace hardcoded "3 per day" with live API value |
| API health status dot | 🔴 Not started | Connect existing `useHealth` hook to navbar status indicator |

---

## PHASE 3 — FRONTEND REDESIGN 🔴 MVP Requirement
**Owner: Frontend Builder | Status: Not started**

Ahmad loves: black + mint color scheme, chain selector. Everything else needs redesign.

**Results page (priority):**
- Wallet address: truncate middle with copy button (`0xAb58...eC9B`)
- Score tier label below gauge (see tiers below)
- Signal bars: `weighted/maxWeight` fill + `weighted/maxWeight` label (e.g. "25/25", "4/20")
- Visual separation between sections — card/panel structure
- Share button: larger, more prominent
- "Report this wallet" placeholder link (for WOR system, Phase 5)
- Footer

**Homepage:**
- Better use of space below the form card
- Logo: higher-res asset (current JPG at 34px is blurry)
- Footer

**Score tier labels:**
| Score | Label | Color |
|---|---|---|
| 85–100 | HIGHLY TRUSTED | Mint green |
| 65–84 | TRUSTED | Light green |
| 45–64 | CAUTION | Amber |
| 25–44 | SUSPICIOUS | Orange |
| 0–24 | HIGH RISK | Red |

---

## PHASE 4 — PRE-DISTRIBUTION REQUIREMENTS
**Owner: Both Builders | Status: Not started — must complete before any distribution channel launches**

These are prerequisites. Every bot reply, widget badge, and extension popup links back to OTI. Without a front door and a docs page, that traffic converts to nothing.

### 4A — Marketing Homepage (front door — first priority)
**Not a separate site.** The existing Vercel app becomes the front door. The current scoring tool moves to `/score`. The homepage at `/` becomes a professional marketing page. One URL, one Vercel project, two purposes.

Domain is already live at `otiscore.vercel.app` ✅ (confirmed July 5, 2026). `oti.vercel.app` was already claimed by another Vercel project. Medium-term: point a real domain at this project when acquired.

| Section | Content |
|---|---|
| Hero | What OTI is + "Try It Now" CTA → scoring app |
| How It Works | 5 signals, 15 chains, 0–100 score explained simply |
| Use Cases | Exchanges, DeFi, NFT marketplaces, payment processors |
| Get the API | Free tier CTA + link to developer docs |
| Integrations | Telegram bot invite, Discord server link, browser extension store badges |
| Social links | Twitter/X, LinkedIn, Telegram community, Discord — in footer |
| Chat support | Crisp.chat (free tier — live chat widget embedded in site, async inbox) |
| Feedback form | Tally.so (free — "Report a bug / Request a feature / Contact sales") |

Platform: Static site (Next.js or plain HTML + Tailwind). Deploy to Vercel free tier. Custom domain: `oti.app` if Ahmad owns it, otherwise Vercel subdomain until domain is confirmed.

### 4B — Developer Docs Site
Docusaurus on Vercel. Every bot/widget links to `oti.app/api` or `docs.oti.app`. Without this, developer curiosity hits a dead end.

Covers: Getting Started, API Reference (with weighted signal shape from Task 5), Score Explanation, Supported Chains, Rate Limits, Code Examples (JS + Python + cURL).

### 4C — Operational Keys (Ahmad does this, not a Builder)
- Create internal bot API key via admin panel (high daily limit, not the anonymous key)
- Create widget shared key with a `widget` plan tier
- CORS is already open globally — no changes needed

| Task | Owner | Why it's blocking |
|---|---|---|
| Marketing website | Frontend Builder | All distribution channels point here. Without it, the bots link to the scoring app which has no marketing context. |
| Developer docs site | Frontend Builder | Every bot reply links to the docs. Without docs, zero developer conversions. |
| Bot key + widget key | Ahmad (via admin panel) | Bots and widget need dedicated high-limit keys before launch. |

---

## PHASE 5 — DISTRIBUTION CHANNELS
**Owner: Backend Builder (bots + widget) + separate repo (extension) | Status: Not started — begins after Phase 4**

Source: OTI Full Distribution & Technical Development Strategy (Founder's Playbook)

### Channel 1 — Telegram Bot
- Library: Telegraf (Node.js) — free
- Lives in: `/bots/telegram/` inside backend repo
- Railway deployment: second process alongside API server
- Commands: `/score [address] [chain]`, `/help`, `/about`
- Group mode = viral lever: bot added to a crypto group, replies are public
- **Railway free tier warning:** API + Telegram + Discord = ~720 hours/month. May need Railway Hobby ($5/mo).
- Env vars needed: `TELEGRAM_BOT_TOKEN`, `OTI_BOT_API_KEY`

### Channel 2 — Discord Bot
- Library: discord.js (Node.js) — free
- Lives in: `/bots/discord/` inside backend repo
- Railway deployment: third process
- Slash commands: `/score`, `/help`
- Rich embed responses (color, fields, thumbnail)
- Env vars needed: `DISCORD_BOT_TOKEN`, `DISCORD_CLIENT_ID`, `OTI_BOT_API_KEY`

### Channel 3 — Embeddable Widget
- Vanilla JS, zero dependencies, served from Railway at `GET /widget.js`
- One-line integration for site owners: `<div data-oti-wallet="0x..." data-oti-chain="ethereum"></div><script src="...widget.js" async></script>`
- Uses shared widget API key internally
- Target sites: NFT marketplaces, on-chain portfolio trackers, P2P OTC platforms

### Channel 4 — Firefox Extension (then Chrome)
- Separate GitHub repo: `oti-firefox-extension`
- Content script: auto-detects `0x[a-fA-F0-9]{40}` addresses on Etherscan, OpenSea, BscScan
- Injects score badge next to each address
- Firefox first (free to publish) → Chrome after first revenue ($5 one-time fee)
- No backend changes required

**Distribution funnel:**
```
Community user sees bot reply → Shares score card (OTI branding)
→ Developer discovers OTI → Visits dev docs → Gets free API key → Integrates
→ Business sees API usage → Reaches out for enterprise contract
```

---

## PHASE 6 — WALLET OWNERSHIP REGISTRY (WOR)
**Owner: Backend Builder + Frontend Builder | Status: Not started — post-distribution**

Ahmad's flagship trust feature. Users pre-register wallet ownership via off-chain EIP-191 signing + passkey. If wallet is compromised, owner connects wallet + enters passkey → instant 0-score flag. No admin review. No blockchain. Fully automated.

Even if the attacker has the private keys, they don't have the pre-registered passkey. This is the differentiator.

**What needs to be built:**
| Component | Owner |
|---|---|
| `wallet_ownership` DB table | Backend |
| `POST /api/wallet/register` | Backend |
| `POST /api/report/compromised` | Backend |
| EIP-191 signature verification | Backend |
| Registration UI (wallet connect + sign + passkey) | Frontend |
| Report UI (wallet connect + passkey + submit) | Frontend |
| `wallet_links` routes (links existing table to WOR) | Backend |

---

## PHASE 7 — MONETIZATION INFRASTRUCTURE
**Owner: Both Builders | Status: Planned — infrastructure partially ready**

| Feature | Notes |
|---|---|
| Developer self-serve portal | Sign up, get API key, choose plan — no Ahmad needed |
| Pro/Enterprise plan tiers | `plan_configs` table ready, needs new rows + payment checkout |
| BSC/Base/Optimism unlock | $49/mo Etherscan Lite — Ahmad's decision |

---

## PHASE 8 — GROWTH FEATURES
**Status: Future**

| Feature | Notes |
|---|---|
| Score history UI | DB accumulating data, endpoint needs Phase 1 fix first |
| Multi-chain wallet comparison | Same wallet scored across multiple chains |
| Wallet portfolio view | `wallet_links` table infrastructure already built |
| Webhook alerts | Notify integrators when a watched wallet is compromised |
| Enterprise exchange path | Compliance screening, withdrawal risk scoring — see Playbook Section 16 |

---

## Revenue Milestones (from Playbook)
| Milestone | Target |
|---|---|
| 1,000 active API users | 90 days after distribution launches |
| 3 paying business integrations | 6 months after distribution |
| First enterprise exchange contract | 12 months after distribution |
