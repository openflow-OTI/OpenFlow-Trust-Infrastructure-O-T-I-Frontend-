import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminFetch } from '@/lib/adminClient'
import { CHAINS } from '@/lib/chains'

interface StatsResponse {
  total_keys: number
  total_compromised: number
  today_requests: number
  requests_by_plan: { plan_name: string; req_count: number }[]
}

interface SignalDetail {
  score: number
  weighted: number
  maxWeight: number
}

interface ScoreResult {
  address: string
  chain: string
  score: number
  cached: boolean
  compromised: boolean
  reason?: string
  reported_at?: string
  signals?: Record<string, SignalDetail>
  metadata?: Record<string, number | string | boolean>
}

const SIGNAL_LABELS: Record<string, string> = {
  walletAge:                 'Wallet Age',
  transactionCount:          'Transaction Count',
  tokenHoldingBehavior:      'Token Holding',
  smartContractInteractions: 'Contract Interactions',
  transactionTimingPatterns: 'Timing Patterns',
}

const META_LABELS: Record<string, string> = {
  txCount:              'Transactions',
  walletAgedays:        'Wallet age (days)',
  uniqueTokens:         'Unique tokens',
  contractInteractions: 'Contract interactions',
  internalTxCount:      'Internal txns',
}

const SCORE_TIERS = [
  { min: 80, label: 'HIGHLY TRUSTED', color: '#00e5a0' },
  { min: 60, label: 'TRUSTED',        color: '#4ade80' },
  { min: 40, label: 'CAUTION',        color: '#facc15' },
  { min: 20, label: 'SUSPICIOUS',     color: '#fb923c' },
  { min: 0,  label: 'HIGH RISK',      color: '#f87171' },
]

function getTier(score: number) {
  return SCORE_TIERS.find(t => score >= t.min) ?? SCORE_TIERS[SCORE_TIERS.length - 1]
}

export function Dashboard() {
  const stats = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminFetch<StatsResponse>('/admin/stats'),
    retry: false,
  })

  // ── Live scorer ───────────────────────────────────────────────────────────
  const [scoreAddr,   setScoreAddr]   = useState('')
  const [scoreChain,  setScoreChain]  = useState('ethereum')
  const [scoring,     setScoring]     = useState(false)
  const [scoreResult, setScoreResult] = useState<ScoreResult | null>(null)
  const [scoreErr,    setScoreErr]    = useState<string | null>(null)

  async function handleScore(e: React.FormEvent) {
    e.preventDefault()
    const addr = scoreAddr.trim()
    if (!addr) return
    setScoring(true)
    setScoreResult(null)
    setScoreErr(null)
    try {
      const data = await adminFetch<ScoreResult>(
        `/score/${encodeURIComponent(addr)}?chain=${scoreChain}`
      )
      setScoreResult(data)
    } catch (err) {
      setScoreErr(err instanceof Error ? err.message : String(err))
    } finally {
      setScoring(false)
    }
  }

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">Dashboard</h2>

      {/* ── Platform stats ────────────────────────────────────────────── */}
      {stats.isLoading && <p className="admin-loading">Loading stats…</p>}

      {stats.isError && (
        <div className="admin-error-block">
          <p className="admin-error">
            {stats.error instanceof Error ? stats.error.message : String(stats.error)}
          </p>
          <button className="admin-btn admin-btn--ghost" onClick={() => stats.refetch()}>
            ↻ Retry
          </button>
        </div>
      )}

      {stats.isSuccess && (
        <>
          <div className="admin-stat-grid">
            <div className="admin-stat-card">
              <span className="admin-stat-value">{(stats.data.today_requests ?? 0).toLocaleString()}</span>
              <span className="admin-stat-label">Requests today</span>
            </div>
            <div className="admin-stat-card">
              <span className="admin-stat-value">{(stats.data.total_keys ?? 0).toLocaleString()}</span>
              <span className="admin-stat-label">Active API keys</span>
            </div>
            <div className="admin-stat-card">
              <span className="admin-stat-value">{(stats.data.total_compromised ?? 0).toLocaleString()}</span>
              <span className="admin-stat-label">Flagged wallets (DB total)</span>
            </div>
          </div>

          {stats.data.requests_by_plan.length > 0 && (
            <>
              <h3 className="admin-subsection-title">Requests by plan (today)</h3>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Plan</th>
                      <th>Requests</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.data.requests_by_plan.map(row => (
                      <tr key={row.plan_name}>
                        <td>{row.plan_name}</td>
                        <td>{(row.req_count ?? 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}

      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '2rem 0' }} />

      {/* ── Live wallet scorer ────────────────────────────────────────── */}
      <h3 className="admin-subsection-title">Score a wallet</h3>
      <p className="admin-section-desc">
        Look up a live trust score for any wallet address across all supported chains.
      </p>

      <form className="admin-form" onSubmit={handleScore} style={{ maxWidth: 480 }}>
        <div className="admin-form-row">
          <label>Wallet address</label>
          <input
            className="admin-input"
            value={scoreAddr}
            onChange={e => { setScoreAddr(e.target.value); setScoreResult(null); setScoreErr(null) }}
            placeholder="0x… or base58…"
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
          />
        </div>
        <div className="admin-form-row">
          <label>Chain</label>
          <select
            className="admin-input"
            value={scoreChain}
            onChange={e => { setScoreChain(e.target.value); setScoreResult(null); setScoreErr(null) }}
          >
            {CHAINS.map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>
        <button
          className="admin-btn admin-btn--primary"
          type="submit"
          disabled={scoring || !scoreAddr.trim()}
        >
          {scoring ? 'Scoring…' : '▶ Score now'}
        </button>

        {scoreErr && (
          <p className="admin-error" style={{ marginTop: '0.6rem' }}>{scoreErr}</p>
        )}

        {scoreResult && !scoreResult.compromised && (() => {
          const tier = getTier(scoreResult.score)
          return (
            <div style={{
              marginTop: '0.75rem',
              background: 'rgba(0,229,160,0.03)',
              border: `1px solid ${tier.color}33`,
              borderRadius: 8,
              overflow: 'hidden',
            }}>
              {/* Score header */}
              <div style={{ padding: '0.9rem 1.1rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '2.4rem', fontWeight: 700, color: tier.color, lineHeight: 1 }}>
                  {scoreResult.score}
                </span>
                <div>
                  <span style={{
                    fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em',
                    color: tier.color, border: `1px solid ${tier.color}`, borderRadius: 4,
                    padding: '2px 8px', display: 'inline-block',
                  }}>
                    {tier.label}
                  </span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: 4 }}>
                    {scoreResult.chain} · {scoreResult.address}
                    {scoreResult.cached && (
                      <span style={{ marginLeft: 6, opacity: 0.6 }}>(cached)</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Signals breakdown */}
              {scoreResult.signals && Object.keys(scoreResult.signals).length > 0 && (
                <div style={{ padding: '0.75rem 1.1rem', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>
                    Signal Breakdown
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '3px 12px', alignItems: 'center', fontSize: '0.78rem' }}>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Signal</span>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Score</span>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Weight</span>
                    {Object.entries(scoreResult.signals).map(([key, val]) => (
                      <>
                        <span key={`${key}-label`} style={{ color: 'var(--text)', paddingTop: '4px' }}>
                          {SIGNAL_LABELS[key] ?? key}
                        </span>
                        <span key={`${key}-score`} style={{ color: tier.color, textAlign: 'right', fontWeight: 600, paddingTop: '4px' }}>
                          {val.score}
                        </span>
                        <span key={`${key}-weight`} style={{ color: 'var(--text-dim)', textAlign: 'right', paddingTop: '4px' }}>
                          {val.weighted}/{val.maxWeight}
                        </span>
                      </>
                    ))}
                  </div>
                </div>
              )}

              {/* Metadata */}
              {scoreResult.metadata && Object.keys(scoreResult.metadata).length > 0 && (
                <div style={{ padding: '0.75rem 1.1rem' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>
                    On-chain Metadata
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem 1.2rem' }}>
                    {Object.entries(scoreResult.metadata).map(([key, val]) => (
                      <span key={key} style={{ fontSize: '0.76rem', color: 'var(--text-dim)' }}>
                        <span style={{ color: 'var(--text)' }}>{META_LABELS[key] ?? key}:</span>{' '}
                        <span style={{ color: 'var(--mint)', fontWeight: 600 }}>
                          {typeof val === 'number' ? val.toLocaleString() : String(val)}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })()}

        {scoreResult?.compromised && (
          <div style={{
            marginTop: '0.75rem',
            padding: '0.9rem 1.1rem',
            background: 'rgba(248,113,113,0.08)',
            border: '1px solid #f87171',
            borderRadius: 8,
            color: '#fca5a5',
            fontSize: '0.85rem',
          }}>
            <strong>⚠ Compromised wallet</strong>
            {scoreResult.reason && <div style={{ marginTop: 4, opacity: 0.8 }}>{scoreResult.reason}</div>}
            {scoreResult.reported_at && (
              <div style={{ marginTop: 4, fontSize: '0.75rem', opacity: 0.7 }}>
                Reported: {new Date(scoreResult.reported_at).toLocaleString()}
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  )
}
