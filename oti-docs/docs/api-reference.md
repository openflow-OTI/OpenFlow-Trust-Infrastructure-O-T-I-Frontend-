---
id: api-reference
title: API Reference
sidebar_position: 2
---

# API Reference

## Base URL

All requests go to:

```
https://workspaceapi-server-production-5c0c.up.railway.app/api
```

:::tip
`https://workspaceapi-server-production-5c0c.up.railway.app/api` is the official OTI API endpoint. Copy it directly into your code.
:::

All responses are `Content-Type: application/json`.

---

## Authentication

| Method | Header | Daily Limit |
|--------|--------|-------------|
| Anonymous | _(none required)_ | 100 req/day per IP |
| API Key | `x-api-key: oti_<your_key>` | Higher limit depending on plan |

Anonymous access is always available with no setup. Add `x-api-key` when you need higher limits or production use.

---

## Endpoints

### `GET /healthz`

Health check. Returns immediately with no computation.

```bash
curl https://workspaceapi-server-production-5c0c.up.railway.app/api/healthz
```

**Response `200 OK`**

```json
{ "status": "ok" }
```

---

### `GET /chains`

Returns all chains OTI recognizes, with their internal chain identifiers.

```bash
curl https://workspaceapi-server-production-5c0c.up.railway.app/api/chains
```

**Response `200 OK`**

```json
{
  "count": 15,
  "chains": [
    { "name": "ethereum",  "chainId": 1 },
    { "name": "bsc",       "chainId": 56 },
    { "name": "polygon",   "chainId": 137 },
    { "name": "arbitrum",  "chainId": 42161 },
    { "name": "optimism",  "chainId": 10 },
    { "name": "base",      "chainId": 8453 },
    { "name": "avalanche", "chainId": 43114 },
    { "name": "fantom",    "chainId": 146 },
    { "name": "linea",     "chainId": 59144 },
    { "name": "zksync",    "chainId": 324 },
    { "name": "ton",       "chainId": "ton" },
    { "name": "solana",    "chainId": "solana" },
    { "name": "sui",       "chainId": "sui" },
    { "name": "bitcoin",   "chainId": "bitcoin" },
    { "name": "tron",      "chainId": "tron" }
  ]
}
```

:::note
Some chains appear in `/chains` but return `503` when scored — see [Supported Chains](/supported-chains) for current availability.
:::

---

### `GET /score/{address}`

Computes or returns a cached trust score for a wallet address on the specified chain.

Results are cached in memory. The first call fetches live on-chain data; subsequent calls for the same address + chain return `"cached": true` instantly.

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `address` | path | string | Required | Wallet address. EVM addresses are lowercased internally. |
| `chain` | query | string | Required | Chain identifier — see [Supported Chains](/supported-chains). |

**Request**

```bash
curl "https://workspaceapi-server-production-5c0c.up.railway.app/api/score/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045?chain=ethereum"
```

**Response `200 OK` — Normal score**

```json
{
  "address": "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
  "chain": "ethereum",
  "cached": false,
  "compromised": false,
  "score": 87,
  "signals": {
    "walletAge":                 { "score": 100, "weighted": 25, "maxWeight": 25 },
    "transactionCount":          { "score": 100, "weighted": 20, "maxWeight": 20 },
    "tokenHoldingBehavior":      { "score": 90,  "weighted": 18, "maxWeight": 20 },
    "smartContractInteractions": { "score": 85,  "weighted": 17, "maxWeight": 20 },
    "transactionTimingPatterns": { "score": 46,  "weighted": 7,  "maxWeight": 15 }
  }
}
```

**Response `200 OK` — Compromised wallet**

```json
{
  "address": "0xabc...123",
  "chain": "ethereum",
  "compromised": true,
  "reason": "Known phishing wallet — flagged by OpenFlow Security",
  "reported_at": "2026-06-01T12:00:00.000Z",
  "score": null
}
```

:::note
Compromised wallets return **`200`**, not a 4xx. Always check `"compromised": true` before trusting the score. When `compromised` is `true`, `score` is `null`.
:::

**Response fields**

| Field | Type | Description |
|-------|------|-------------|
| `address` | string | Wallet address (EVM lowercased) |
| `chain` | string | Chain the score was computed on |
| `cached` | boolean | `true` if result came from cache |
| `compromised` | boolean | `true` if the wallet is on the denylist |
| `score` | number \| null | Overall trust score 0–100, or `null` if compromised |
| `signals` | object | Five weighted signal scores — see below |

**WeightedSignal shape** (each entry in `signals`)

| Field | Type | Description |
|-------|------|-------------|
| `score` | number | Raw signal score 0–100 |
| `weighted` | number | Points contributed to the overall score |
| `maxWeight` | number | Maximum points this signal can contribute |

---

### `POST /score`

Same as `GET /score/{address}` but accepts `address` and `chain` in the JSON body instead of the path and query string. Behaviour, caching, and response shapes are identical.

**Request body**

```json
{
  "address": "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
  "chain": "ethereum"
}
```

**Request**

```bash
curl -X POST https://workspaceapi-server-production-5c0c.up.railway.app/api/score \
  -H "Content-Type: application/json" \
  -d '{"address":"0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045","chain":"ethereum"}'
```

---

### `GET /score/{address}/history`

Returns the 50 most recent persisted score records for a wallet, ordered most-recent first.

`?chain=` is optional. When omitted, history is returned across all chains in the same address family (e.g. all EVM chains for an EVM address).

**Parameters**

| Name | In | Type | Required | Description |
|------|----|------|----------|-------------|
| `address` | path | string | Required | Wallet address |
| `chain` | query | string | Optional | Filter to a specific chain |

**Request**

```bash
curl "https://workspaceapi-server-production-5c0c.up.railway.app/api/score/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045/history?chain=ethereum"
```

**Response `200 OK`**

```json
{
  "address": "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
  "chain": "ethereum",
  "count": 1,
  "history": [
    {
      "score": 87,
      "signals": {
        "walletAge": 100,
        "transactionCount": 100,
        "tokenHoldingBehavior": 90,
        "smartContractInteractions": 85,
        "transactionTimingPatterns": 46
      },
      "chain": "ethereum",
      "address": "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
      "timestamp": "2026-07-08T14:22:10.000Z"
    }
  ]
}
```

:::info
History `signals` contain **raw scores only** (not weighted), as recorded at the time the score was first computed. This differs from `/score` which returns the full `WeightedSignal` shape.
:::

**Response fields**

| Field | Type | Description |
|-------|------|-------------|
| `address` | string | Wallet address |
| `chain` | string \| null | Chain filter applied, or `null` if not filtered |
| `count` | number | Number of records returned (max 50) |
| `history[]` | array | Score history entries, newest first |
| `history[].score` | number | Overall score at time of recording |
| `history[].signals` | object | Raw signal scores (not weighted) |
| `history[].chain` | string | Chain this record was computed on |
| `history[].timestamp` | string | ISO 8601 UTC timestamp |

---

## Error Reference

| Status | When | Body |
|--------|------|------|
| `400 Bad Request` | Invalid address, unknown chain, malformed body | `{ "error": string, "details": string[] \| string }` |
| `404 Not Found` | Resource not found | `{ "error": string }` |
| `429` (daily) | Daily request limit exceeded | `{ "error": "Daily rate limit exceeded", "limit": number, "reset": string }` |
| `429` (burst) | Short-window IP burst limit | `{ "error": "Too many requests", "details": string }` |
| `500 Internal Server Error` | Unexpected server error | `{ "error": string }` |
| `503 Service Unavailable` | Chain temporarily unavailable | `{ "error": string }` |

**Example 400**

```json
{
  "error": "Invalid request",
  "details": ["Must be a valid Ethereum wallet address (0x followed by 40 hex characters)"]
}
```

**Example 429 daily limit**

```json
{
  "error": "Daily rate limit exceeded",
  "limit": 100,
  "reset": "2026-07-10T00:00:00.000Z"
}
```
