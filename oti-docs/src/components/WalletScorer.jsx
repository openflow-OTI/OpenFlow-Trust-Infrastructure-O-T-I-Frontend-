import { useState } from 'react';

// ─── API endpoint ────────────────────────────────────────────────────────────
const API_BASE = 'https://workspaceapi-server-production-5c0c.up.railway.app/api';

const CHAINS = [
  { id: 'ethereum',  label: 'Ethereum',  example: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', hint: 'Vitalik Buterin' },
  { id: 'bitcoin',   label: 'Bitcoin',   example: '34xp4vRoCGJym3xR7yCVPFHoCNxv4Twseo',        hint: 'Binance cold wallet' },
  { id: 'solana',    label: 'Solana',    example: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', hint: 'Binance hot wallet' },
  { id: 'tron',      label: 'Tron',      example: 'TVj7RNVHy6thbM7BWdSe9G6gXwKhjhdNZS',        hint: 'Binance hot wallet' },
  { id: 'ton',       label: 'TON',       example: 'EQD2NmD_lH5f5u1Kj3KfGyTvhZSX0Eg6qp2a5IQUKXxOG3f', hint: 'Known TON whale' },
  { id: 'polygon',   label: 'Polygon',   example: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', hint: 'Vitalik Buterin (EVM)' },
  { id: 'arbitrum',  label: 'Arbitrum',  example: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', hint: 'Vitalik Buterin (EVM)' },
  { id: 'avalanche', label: 'Avalanche', example: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', hint: 'Vitalik Buterin (EVM)' },
  { id: 'fantom',    label: 'Fantom',    example: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', hint: 'Vitalik Buterin (EVM)' },
  { id: 'linea',     label: 'Linea',     example: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', hint: 'Vitalik Buterin (EVM)' },
  { id: 'zksync',    label: 'zkSync',    example: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', hint: 'Vitalik Buterin (EVM)' },
  { id: 'sui',       label: 'Sui',       example: '0x06864a6f921804860930db6ddbe2e16acdf8504495ea7481637a1c8b9a8fe54b', hint: 'Sui system address' },
];

const TIERS = [
  { min: 80, label: 'HIGHLY TRUSTED', color: '#00e5a0' },
  { min: 60, label: 'TRUSTED',        color: '#4ade80' },
  { min: 40, label: 'CAUTION',        color: '#facc15' },
  { min: 20, label: 'SUSPICIOUS',     color: '#fb923c' },
  { min: 0,  label: 'HIGH RISK',      color: '#f87171' },
];

function getTier(score) {
  return TIERS.find((t) => score >= t.min) || TIERS[TIERS.length - 1];
}

const SIGNAL_LABELS = {
  walletAge:                 'Wallet Age',
  transactionCount:          'Transaction Count',
  tokenHoldingBehavior:      'Token Holding',
  smartContractInteractions: 'Contract Interactions',
  transactionTimingPatterns: 'Timing Patterns',
};

const s = {
  wrap: {
    border: '1px solid #1c2535',
    borderRadius: 10,
    background: '#0b0f1a',
    padding: '1.25rem',
    marginBottom: '2rem',
    fontFamily: "'JetBrains Mono', monospace",
  },
  label: {
    display: 'block',
    fontSize: 11,
    color: '#7a8fa8',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  hint: {
    fontSize: 10,
    color: '#7a8fa8',
    marginBottom: 10,
    fontStyle: 'italic',
  },
  col: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    marginBottom: 6,
  },
  row: {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
  },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    background: '#05080f',
    border: '1px solid #1c2535',
    borderRadius: 6,
    color: '#e8f4ff',
    padding: '9px 12px',
    fontSize: 13,
    fontFamily: "'JetBrains Mono', monospace",
    outline: 'none',
  },
  select: {
    flex: '1 1 130px',
    background: '#05080f',
    border: '1px solid #1c2535',
    borderRadius: 6,
    color: '#e8f4ff',
    padding: '9px 12px',
    fontSize: 13,
    fontFamily: "'JetBrains Mono', monospace",
    cursor: 'pointer',
    minWidth: 0,
  },
  btn: {
    flex: '0 0 auto',
    background: '#00e5a0',
    color: '#001a0e',
    border: 'none',
    borderRadius: 6,
    padding: '9px 22px',
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    fontFamily: "'JetBrains Mono', monospace",
    whiteSpace: 'nowrap',
  },
  btnLoading: {
    background: '#008f63',
    color: '#001a0e',
    cursor: 'not-allowed',
  },
  errorBox: {
    background: 'rgba(248,113,113,0.08)',
    border: '1px solid #f87171',
    borderRadius: 6,
    padding: '12px 14px',
    color: '#fca5a5',
    fontSize: 13,
    marginTop: 8,
  },
  scoreRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
    flexWrap: 'wrap',
    marginTop: 12,
  },
  scoreNum: {
    fontSize: 44,
    fontWeight: 700,
    lineHeight: 1,
  },
  tierBadge: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.1em',
    padding: '3px 10px',
    borderRadius: 4,
    background: 'rgba(0,0,0,0.3)',
  },
  compromisedBox: {
    background: 'rgba(248,113,113,0.08)',
    border: '1px solid #f87171',
    borderRadius: 6,
    padding: '12px 14px',
    color: '#fca5a5',
    marginTop: 8,
  },
  signalRow: {
    display: 'grid',
    gridTemplateColumns: '1fr auto auto',
    gap: '4px 16px',
    alignItems: 'center',
    padding: '6px 0',
    borderBottom: '1px solid #1c2535',
    fontSize: 12,
  },
  barWrap: {
    width: 80,
    height: 6,
    background: '#1c2535',
    borderRadius: 3,
    overflow: 'hidden',
  },
  cachedBadge: {
    display: 'inline-block',
    fontSize: 10,
    color: '#7a8fa8',
    border: '1px solid #1c2535',
    borderRadius: 4,
    padding: '1px 6px',
    marginLeft: 8,
  },
  jsonPre: {
    background: '#05080f',
    border: '1px solid #1c2535',
    borderRadius: 6,
    padding: 12,
    fontSize: 11,
    color: '#e8f4ff',
    overflowX: 'auto',
    marginTop: 14,
    maxHeight: 260,
    overflowY: 'auto',
  },
};

export default function WalletScorer() {
  const defaultChain = CHAINS[0];
  const [chain, setChain] = useState(defaultChain.id);
  const [address, setAddress] = useState(defaultChain.example);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showRaw, setShowRaw] = useState(false);

  const currentChain = CHAINS.find((c) => c.id === chain) || CHAINS[0];

  function handleChainChange(e) {
    const newId = e.target.value;
    setChain(newId);
    const found = CHAINS.find((c) => c.id === newId);
    if (found) setAddress(found.example);
    setResult(null);
    setError(null);
  }

  async function handleScore(e) {
    e.preventDefault();
    if (!address.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const url = `${API_BASE}/score/${encodeURIComponent(address.trim())}?chain=${chain}`;
      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429) {
          if (data.error === 'Daily rate limit exceeded') {
            const reset = new Date(data.reset);
            setError(`Daily limit reached (${data.limit}/day). Resets at ${reset.toUTCString()}.`);
          } else {
            setError(`Rate limit: ${data.details || data.error}. Wait a moment and retry.`);
          }
        } else if (res.status === 503) {
          setError(`${currentChain.label} is temporarily unavailable on this endpoint.`);
        } else if (res.status === 400) {
          const detail = Array.isArray(data.details) ? data.details[0] : (data.details || data.error);
          setError(`Bad request: ${detail}`);
        } else {
          setError(data.error || `HTTP ${res.status}`);
        }
        return;
      }

      setResult(data);
    } catch (err) {
      setError('Network error — check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  const tier = result && !result.compromised ? getTier(result.score) : null;

  return (
    <div style={s.wrap}>
      <form onSubmit={handleScore}>
        <label style={s.label}>Wallet address</label>
        <div style={s.col}>
          <input
            style={s.input}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter a wallet address…"
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
          />
          <div style={s.row}>
            <select style={s.select} value={chain} onChange={handleChainChange}>
              {CHAINS.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
            <button
              type="submit"
              style={loading ? { ...s.btn, ...s.btnLoading } : s.btn}
              disabled={loading}
            >
              {loading ? 'Scoring…' : '▶ Score'}
            </button>
          </div>
          <div style={s.hint}>
            Example pre-filled: {currentChain.hint} — switching chain auto-fills a new address
          </div>
        </div>
      </form>

      {error && <div style={s.errorBox}>⚠ {error}</div>}

      {result && result.compromised && (
        <div style={s.compromisedBox}>
          <strong>⚠ Compromised wallet</strong>
          <div style={{ marginTop: 4, fontSize: 12 }}>{result.reason}</div>
          <div style={{ marginTop: 4, fontSize: 11, color: '#7a8fa8' }}>
            Reported: {new Date(result.reported_at).toUTCString()}
          </div>
        </div>
      )}

      {result && !result.compromised && tier && (
        <div>
          <div style={s.scoreRow}>
            <span style={{ ...s.scoreNum, color: tier.color }}>{result.score}</span>
            <div>
              <span style={{ ...s.tierBadge, color: tier.color, border: `1px solid ${tier.color}` }}>
                {tier.label}
              </span>
              {result.cached && <span style={s.cachedBadge}>cached</span>}
              <div style={{ fontSize: 11, color: '#7a8fa8', marginTop: 4 }}>
                {result.chain} · {result.address.slice(0, 14)}…
              </div>
            </div>
          </div>

          <div>
            <div style={{ ...s.signalRow, color: '#7a8fa8', fontWeight: 700, borderBottom: '1px solid #1c2535' }}>
              <span>Signal</span>
              <span>Score</span>
              <span>Weight</span>
            </div>
            {Object.entries(result.signals).map(([key, val]) => (
              <div key={key} style={s.signalRow}>
                <span style={{ color: '#e8f4ff' }}>{SIGNAL_LABELS[key] || key}</span>
                <span style={{ color: '#00e5a0', textAlign: 'right' }}>{val.score}</span>
                <div>
                  <div style={{ fontSize: 10, color: '#7a8fa8', textAlign: 'right' }}>
                    {val.weighted}/{val.maxWeight}
                  </div>
                  <div style={s.barWrap}>
                    <div style={{
                      height: '100%',
                      width: `${(val.weighted / val.maxWeight) * 100}%`,
                      background: '#00e5a0',
                      borderRadius: 3,
                      transition: 'width 0.4s ease',
                    }} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 12 }}>
            <button
              onClick={() => setShowRaw((v) => !v)}
              style={{ background: 'none', border: 'none', color: '#7a8fa8', cursor: 'pointer', fontSize: 11, padding: 0, fontFamily: "'JetBrains Mono', monospace" }}
            >
              {showRaw ? '▲ Hide raw JSON' : '▼ Show raw JSON'}
            </button>
            {showRaw && (
              <pre style={s.jsonPre}>{JSON.stringify(result, null, 2)}</pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
