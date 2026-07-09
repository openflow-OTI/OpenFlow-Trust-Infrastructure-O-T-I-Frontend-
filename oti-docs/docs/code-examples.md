---
id: code-examples
title: Code Examples
sidebar_position: 6
---

# Code Examples

All examples score the same Ethereum wallet (`0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045`) anonymously — no API key needed. Replace the address, chain, and optionally add `x-api-key` to use your own key.

**API base URL:** `https://api.otiscore.io/api`

---

## cURL

### Score a wallet (GET)

```bash
curl "https://api.otiscore.io/api/score/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045?chain=ethereum"
```

### Score a wallet (POST)

```bash
curl -X POST "https://api.otiscore.io/api/score" \
  -H "Content-Type: application/json" \
  -d '{"address":"0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045","chain":"ethereum"}'
```

### Score with an API key

```bash
curl "https://api.otiscore.io/api/score/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045?chain=ethereum" \
  -H "x-api-key: oti_your_key_here"
```

### Get score history

```bash
curl "https://api.otiscore.io/api/score/0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045/history?chain=ethereum"
```

### List supported chains

```bash
curl "https://api.otiscore.io/api/chains"
```

---

## JavaScript (fetch)

### Score a wallet

```javascript
const BASE_URL = 'https://api.otiscore.io/api';

async function scoreWallet(address, chain, apiKey = null) {
  const url = `${BASE_URL}/score/${encodeURIComponent(address)}?chain=${chain}`;
  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) headers['x-api-key'] = apiKey;

  const res = await fetch(url, { headers });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json();
}

// Usage
scoreWallet('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', 'ethereum')
  .then((data) => {
    if (data.compromised) {
      console.log('Wallet is compromised:', data.reason);
      return;
    }
    console.log(`Score: ${data.score}/100`);
    console.log('Signals:', data.signals);
  })
  .catch(console.error);
```

### Score via POST

```javascript
const BASE_URL = 'https://api.otiscore.io/api';

async function scoreWalletPost(address, chain, apiKey = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) headers['x-api-key'] = apiKey;

  const res = await fetch(`${BASE_URL}/score`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ address, chain }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json();
}
```

### Get score history

```javascript
async function getHistory(address, chain = null) {
  const params = chain ? `?chain=${chain}` : '';
  const url = `${BASE_URL}/score/${encodeURIComponent(address)}/history${params}`;
  const res = await fetch(url);
  return res.json();
}

getHistory('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', 'ethereum')
  .then((data) => console.log(`${data.count} history entries`, data.history))
  .catch(console.error);
```

### Handle rate limits gracefully

```javascript
async function scoreWithRetry(address, chain, apiKey = null, maxRetries = 3) {
  const url = `${BASE_URL}/score/${encodeURIComponent(address)}?chain=${chain}`;
  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) headers['x-api-key'] = apiKey;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const res = await fetch(url, { headers });

    if (res.status === 429) {
      const body = await res.json();
      if (body.error === 'Daily rate limit exceeded') {
        const reset = new Date(body.reset);
        throw new Error(`Daily limit hit. Resets at ${reset.toUTCString()}`);
      }
      // IP burst — wait and retry
      await new Promise((r) => setTimeout(r, (attempt + 1) * 2000));
      continue;
    }

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  throw new Error('Max retries exceeded');
}
```

---

## Python (requests)

### Score a wallet

```python
import requests

BASE_URL = "https://api.otiscore.io/api"

def score_wallet(address: str, chain: str, api_key: str = None) -> dict:
    url = f"{BASE_URL}/score/{address}"
    params = {"chain": chain}
    headers = {}
    if api_key:
        headers["x-api-key"] = api_key

    resp = requests.get(url, params=params, headers=headers)
    resp.raise_for_status()
    return resp.json()


# Usage
data = score_wallet(
    "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    "ethereum"
)

if data.get("compromised"):
    print(f"Wallet is compromised: {data['reason']}")
else:
    print(f"Score: {data['score']}/100")
    for signal, values in data["signals"].items():
        print(
            f"  {signal}: {values['score']}/100 "
            f"(contributes {values['weighted']}/{values['maxWeight']})"
        )
```

### Score via POST

```python
def score_wallet_post(address: str, chain: str, api_key: str = None) -> dict:
    url = f"{BASE_URL}/score"
    headers = {"Content-Type": "application/json"}
    if api_key:
        headers["x-api-key"] = api_key

    resp = requests.post(
        url,
        json={"address": address, "chain": chain},
        headers=headers
    )
    resp.raise_for_status()
    return resp.json()
```

### Handle rate limits

```python
import time

def score_with_retry(address: str, chain: str, api_key: str = None, max_retries: int = 3) -> dict:
    url = f"{BASE_URL}/score/{address}"
    params = {"chain": chain}
    headers = {"x-api-key": api_key} if api_key else {}

    for attempt in range(max_retries):
        resp = requests.get(url, params=params, headers=headers)

        if resp.status_code == 429:
            body = resp.json()
            if body.get("error") == "Daily rate limit exceeded":
                raise Exception(f"Daily limit hit. Resets at {body['reset']}")
            # IP burst — back off and retry
            time.sleep((attempt + 1) * 2)
            continue

        resp.raise_for_status()
        return resp.json()

    raise Exception("Max retries exceeded")
```

### Get score history

```python
def get_history(address: str, chain: str = None) -> dict:
    url = f"{BASE_URL}/score/{address}/history"
    params = {}
    if chain:
        params["chain"] = chain

    resp = requests.get(url, params=params)
    resp.raise_for_status()
    return resp.json()

history = get_history(
    "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
    chain="ethereum"
)
print(f"{history['count']} history entries")
for entry in history["history"]:
    print(f"  {entry['timestamp']}: score {entry['score']}")
```

---

## Interpreting the Response

```javascript
function getTierLabel(score) {
  if (score >= 80) return 'HIGHLY TRUSTED';
  if (score >= 60) return 'TRUSTED';
  if (score >= 40) return 'CAUTION';
  if (score >= 20) return 'SUSPICIOUS';
  return 'HIGH RISK';
}

// After scoring:
const { score, signals } = data;
console.log(`${score}/100 — ${getTierLabel(score)}`);

// Largest contributor
const topSignal = Object.entries(signals)
  .sort(([, a], [, b]) => b.weighted - a.weighted)[0];
console.log(`Top signal: ${topSignal[0]} (${topSignal[1].weighted}/${topSignal[1].maxWeight} pts)`);
```
