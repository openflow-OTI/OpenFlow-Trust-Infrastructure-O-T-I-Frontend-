# OTI Token — Supply, Sale Structure & Revenue Distribution

> Last updated: July 9, 2026 (session 6) | Maintained by: Development Manager
> **Status: Ahmad-approved design, locked — EXCEPT price and liquidity, which are explicitly out of scope here.** This is OTI's own independent token — it is NOT the OpenFlow "FLOW" ecosystem token discussed in earlier planning. OTI can live with or without OpenFlow, so it has its own token, its own supply, and its own economics. Launch chain: BNB Smart Chain (BSC) first, with cross-chain expansion planned later.
> **Price and liquidity pool design are intentionally NOT covered in this document.** Ahmad decided the team will determine token price and liquidity pool structure later, closer to launch. Do not infer or reconstruct pricing/liquidity numbers from earlier versions of this file — they were removed on purpose.
> Regulatory note: Ahmad has explicitly decided this raise is small enough not to require formal securities/regulatory review at this stage. This decision was flagged to him once by the Manager and is his call to make.

---

## 1. Total Supply

**30,000,000 OTI — fixed supply, no inflation, no mint function after launch.**

Fixed supply is a deliberate trust signal: no bucket can be silently expanded, and total dilution is knowable from day one.

---

## 2. Allocation

| Bucket | % | Tokens | Purpose |
|---|---|---|---|
| Sale (Pre-Listing + Future Discount Sales) | 15% | 4,500,000 | Funds building OTI; sold in one pre-listing round plus later as-needed discounted rounds |
| Team & Founders | 15% | 4,500,000 | Long-term founder ownership (Ahmad + Musty) |
| Ecosystem & Partnerships | 15% | 4,500,000 | Developer grants, integration incentives, protocol/exchange partnerships that drive real API usage |
| Revenue-Backed Rewards Pool | 30% | 9,000,000 | Staking/holder rewards — funded by real OTI API revenue via buyback, not token inflation |
| Liquidity & Market Making | 10% | 3,000,000 | DEX trading pool depth, exchange listing support |
| Treasury / Reserve | 15% | 4,500,000 | Operating costs, security audits, contingency — multisig-controlled |
| **Total** | **100%** | **30,000,000** | |

---

## 3. Vesting

**Universal rule:** every bucket except Liquidity vests linearly over **36 months**, releasing 1/36th each month, starting from that bucket's (or that specific sale's) own release date. No cliff, no lump-sum unlock — a steady monthly drip for 3 years.

- **Liquidity & Market Making — the one exception.** Fully unlocked at listing, with no vesting. Liquidity has to be tradeable from day one; vesting it would leave the token illiquid at launch.
- **Sale round tokens** each get their own independent 36-month clock starting from their own purchase date — the pre-listing round starts at listing; each later discount sale starts its own clock from when that sale happens.
- **Team, Ecosystem, Rewards Pool, Treasury** — all 36-month monthly linear from their respective start dates.
- **Revenue-Backed Rewards Pool** has a second gate on top of vesting: even as tokens vest into availability, actual payout to stakers still depends on real API revenue funding the pool (see Section 6). Vesting caps the *maximum* release rate; revenue availability governs whether a payout actually happens that month.

---

## 4. Token Sale Structure

### 4.1 Pre-Listing Sale Round (the only round before launch)

| | |
|---|---|
| Target raise | $10,000 |
| Tokens sold | 500,000 OTI (≈1.7% of total supply) |
| Vesting | 36-month monthly linear, from listing date |
| Accepted currency | BNB / USDT on BSC |

Price, any TGE unlock %, and liquidity pool structure are **not defined here** — the team will decide these later, closer to launch.

This is a deliberately small, single public round — there is no separate private/KYC'd round, since Ahmad does not currently have private investors lined up. All buyers go through the same public terms.

### 4.2 Post-Listing Discount Sales (as-needed, not scheduled)

These are **not** a second fixed round. They happen only when OTI genuinely needs additional capital, at any point after listing:

- **Price:** to be decided per sale by the team at that time (not defined here)
- **Source:** drawn from the ≈4,000,000 OTI remaining in the Sale bucket after the pre-listing round
- **Vesting:** 36-month monthly linear, starting from that specific sale's own purchase date
- **Transparency:** every future discount sale is logged publicly with its date, amount raised, price, and vesting terms — no ambiguity about how much of the Sale bucket has been used vs. still reserved

**Why this shape:** committing to only one round now, and treating every later raise as need-based rather than calendar-based, avoids selling supply the business doesn't yet need.

---

## 5. Revenue Distribution

Once OTI's paid API tiers (Pro/Enterprise, per the existing Revenue Model in TASKS.md) begin generating real revenue, that revenue is split every month as follows — **starting from day one, immediately after the pre-listing sale round completes** (not gated behind any revenue threshold):

| Category | % | What it's for |
|---|---|---|
| Operating Costs | 40% | Hosting (Railway), any paid data providers/APIs, tools, infra — always covered first |
| Revenue-Backed Rewards Pool (buyback) | 25% | Buys OTI on the open market and routes it into the Rewards Pool for stakers — **only executes when the market is down**; held as cash reserve otherwise, deployed opportunistically |
| Team | 20% | Cash payout to the founders (Ahmad + Musty) — split decided internally between them. This is separate from the Team's fixed token allocation (Section 2), which is equity-like, not cash |
| Treasury/Reserve top-up | 15% | Cash reinvested into growth — marketing, audits, partnerships, legal. Separate from the fixed Treasury token allocation; this is a cash reserve, not tokens |

**Why the buyback is conditional, not automatic:** buying back tokens every month regardless of price would mean routinely overpaying when the market is already strong. Restricting the buyback to down-market conditions makes the Rewards Pool a genuine value-accrual mechanism (buy low) rather than a fixed monthly expense.

---

## 6. Chain & Cross-Chain Plan

- **Launch chain:** BNB Smart Chain (BSC) — chosen for low fees and fast settlement, matching the presale mechanics above (BNB/USDT accepted).
- **Cross-chain expansion:** planned for later, once OTI's token is established on BSC. Not yet designed in detail — when this becomes active work, it should be scoped as its own task (likely via a standard bridging solution such as LayerZero or Wormhole, rather than a custom-built bridge, consistent with the "don't reinvent solved infrastructure" principle applied to vesting).

---

## 7. Explicitly Out of Scope For Now

- **Price and liquidity pool design:** intentionally not part of this document. The team will decide token price and liquidity structure later, closer to launch.
- **Staking/derivative system (e.g., a "locked OTI" derivative used as collateral):** discussed as a future phase, not part of this design. To be scoped separately once OTI has real usage and revenue to build the mechanism around.
- **Governance:** not part of this design. No DAO or voting mechanism defined yet for OTI token holders.
- **Formal legal/securities review:** flagged once to Ahmad; his explicit decision is that the raise is small enough not to require this at this stage.
