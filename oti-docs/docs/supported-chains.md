---
id: supported-chains
title: Supported Chains
sidebar_position: 4
---

# Supported Chains

OTI supports **15 blockchains** across EVM, Bitcoin, Solana, TON, Sui, and Tron chain families.

Use the chain's **identifier string** (e.g. `"ethereum"`, `"solana"`) as the value of the `?chain=` query parameter or the `chain` field in POST request bodies.

---

## Chain Table

| Chain | Identifier | Chain ID | Family | Status |
|-------|-----------|----------|--------|--------|
| Bitcoin | `bitcoin` | _(non-EVM)_ | bitcoin | Available |
| Ethereum | `ethereum` | 1 | EVM | Available |
| Solana | `solana` | _(non-EVM)_ | solana | Available |
| BNB Smart Chain | `bsc` | 56 | EVM | Temporarily unavailable |
| Tron | `tron` | _(non-EVM)_ | tron | Available |
| TON | `ton` | _(non-EVM)_ | ton | Available |
| Avalanche | `avalanche` | 43114 | EVM | Available |
| Polygon | `polygon` | 137 | EVM | Available |
| Arbitrum | `arbitrum` | 42161 | EVM | Available |
| Optimism | `optimism` | 10 | EVM | Temporarily unavailable |
| Base | `base` | 8453 | EVM | Temporarily unavailable |
| Sui | `sui` | _(non-EVM)_ | sui | Available |
| Sonic | `sonic` | 146 | EVM | Available |
| Linea | `linea` | 59144 | EVM | Available |
| zkSync | `zksync` | 324 | EVM | Available |

---

## Known Limitations

### Temporarily Unavailable Chains

**BSC, Base, and Optimism** currently return `503 Service Unavailable`. These chains are recognized by the API (they appear in `/chains`) but the underlying data sources are not yet active. Attempting to score a wallet on these chains will return:

```json
{
  "error": "Chain temporarily unavailable"
}
```

This is a known status and will be resolved in a future release.

### Transaction Count Cap

For **all EVM chains**, the transaction count signal is capped at **1,000 transactions**. Wallets with more than 1,000 transactions receive the maximum score for that signal, but the raw count beyond 1,000 is not differentiated. This cap is a deliberate scoring boundary, not a data limitation.

### EVM Address Ambiguity

The same wallet address (e.g. `0xd8dA...96045`) exists identically on all 10 EVM chains. When calling `/score/{address}/history` without a `?chain=` filter, OTI returns history across all EVM chains for that address family. Always supply `?chain=` when you need results for a specific chain.

---

## Chain Families and Compromised Wallet Blocking

Wallets are blocked by **chain family**, not by individual chain. If a wallet is flagged as compromised on `ethereum`, it is blocked across all EVM chains (ethereum, polygon, arbitrum, etc.) because the address is the same across all EVM chains. Non-EVM chains (bitcoin, solana, ton, sui, tron) each have their own independent namespace.

---

## Checking Available Chains Programmatically

```bash
curl https://workspaceapi-server-production-5c0c.up.railway.app/api/chains
```

This always returns the live list of recognized chains.
