---
id: rate-limits
title: Rate Limits & Plans
sidebar_position: 5
---

# Rate Limits & Plans

OTI enforces two independent rate limits:

1. **Daily limit** — maximum requests per UTC calendar day, per plan tier
2. **IP burst limit** — short-window burst protection applied to all requests regardless of plan

---

## Plan Tiers

| Plan | Daily Limit | API Key | Best For |
|------|-------------|---------|----------|
| **Anonymous** | 100 req/day | Not required | Evaluation, prototyping, demos |
| **Free** | Higher limit | Required | Low-volume production |
| **Pro** | Higher limit | Required | Mid-volume integrations |
| **Enterprise** | Unlimited | Required | High-volume, SLA-backed |

:::tip Start immediately — no key needed
Anonymous access gives you **100 requests per day** per IP with zero setup. This resets at midnight UTC and is enough to build and test a complete integration before requesting a key.
:::

---

## Anonymous Limit

The current anonymous daily limit can always be checked live:

```bash
curl https://workspaceapi-server-production-5c0c.up.railway.app/api/config/anonymous-limit
```

```json
{ "daily_limit": 100 }
```

This value is configurable by OpenFlow Labs and the above endpoint always reflects the current live value.

---

## Daily Limit Behavior

- Limits reset at **midnight UTC**.
- Anonymous requests are tracked by IP address.
- Keyed requests are tracked per API key.
- When the daily limit is exceeded, the API returns `429` with the exact reset timestamp:

```json
{
  "error": "Daily rate limit exceeded",
  "limit": 100,
  "reset": "2026-07-10T00:00:00.000Z"
}
```

Parse `reset` (ISO 8601 UTC) to tell your users exactly when they can try again.

---

## IP Burst Limit

All requests (anonymous and keyed) are subject to a short-window burst limit per IP. This guards against sudden spikes. When triggered, the API returns `429` with:

```json
{
  "error": "Too many requests",
  "details": "IP rate limit exceeded — slow down and retry"
}
```

Unlike the daily limit, burst protection is temporary. Back off for a few seconds and retry.

---

## Passing Your API Key

Include your key in the `x-api-key` header on every request:

```bash
curl "https://workspaceapi-server-production-5c0c.up.railway.app/api/score/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045?chain=ethereum" \
  -H "x-api-key: oti_your_key_here"
```

Keys follow the format `oti_<32 hex chars>`. The full key is shown **only once** at creation — store it immediately.

---

## How to Get a Key

Visit [openflowlabs.io](https://openflowlabs.io) to request an API key. Free-tier keys are available for evaluation and low-volume production.

---

## Upgrading Your Plan

Contact the OpenFlow Labs team at [openflowlabs.io](https://openflowlabs.io) with your current API key and the tier you need.
