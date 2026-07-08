import { Component, type ReactNode } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { adminFetch } from '@/lib/adminClient'

// ── Types ─────────────────────────────────────────────────────────────────────

interface PlanSyncDetail {
  planName: string
  inSync: boolean
  dbValue?: number | null
  apiValue?: number | null
}

interface ConfigSyncHealth {
  lastCheckedAt: string | null
  lastError: string | null
  publicCheck: {
    inSync: boolean
    dbValue?: number | null
    apiValue?: number | null
  } | null
  adminCheck: {
    checked: boolean
    plans: PlanSyncDetail[]
  } | null
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtTs(ts: string | null | undefined): string {
  if (!ts) return '—'
  return new Date(ts).toLocaleString()
}

function fmtLimit(v: number | null | undefined): string {
  if (v === undefined) return '—'
  if (v === null) return 'Unlimited'
  return v.toLocaleString()
}

function SyncChip({ ok, label }: { ok: boolean | null; label?: string }) {
  if (ok === null)
    return <span className="sync-chip sync-chip--unknown">{label ?? 'Unknown'}</span>
  return ok
    ? <span className="sync-chip sync-chip--ok">✓ {label ?? 'In sync'}</span>
    : <span className="sync-chip sync-chip--fail">✗ {label ?? 'Mismatch'}</span>
}

// ── Error boundary ────────────────────────────────────────────────────────────

class ConfigSyncErrorBoundary extends Component<
  { children: ReactNode },
  { error: string | null }
> {
  state = { error: null }
  static getDerivedStateFromError(e: Error) { return { error: e.message } }
  render() {
    if (this.state.error)
      return <p className="admin-error">Failed to render Config Sync: {this.state.error}</p>
    return this.props.children
  }
}

// ── Public export ─────────────────────────────────────────────────────────────

export function ConfigSync() {
  return (
    <ConfigSyncErrorBoundary>
      <ConfigSyncInner />
    </ConfigSyncErrorBoundary>
  )
}

// ── Inner component ───────────────────────────────────────────────────────────

function ConfigSyncInner() {
  const qc = useQueryClient()

  const health = useQuery({
    queryKey: ['admin', 'config-sync-health'],
    queryFn: () => adminFetch<ConfigSyncHealth>('/admin/health/config-sync'),
    // Re-check every 60s — backend monitor runs every 5 min, this just keeps
    // the panel fresh without hammering the endpoint.
    refetchInterval: 60_000,
    retry: 1,
  })

  const publicOk   = health.data?.publicCheck?.inSync ?? null
  const allPlansOk = health.data?.adminCheck?.plans.every(p => p.inSync) ?? null
  const hasError   = Boolean(health.data?.lastError)
  const overallOk  = !hasError && publicOk === true && allPlansOk === true

  return (
    <div className="admin-section">

      {/* ── Header ── */}
      <div className="admin-section-header">
        <h2 className="admin-section-title">Config Sync Health</h2>
        <button
          className="admin-btn admin-btn--ghost"
          onClick={() => qc.invalidateQueries({ queryKey: ['admin', 'config-sync-health'] })}
          disabled={health.isFetching}
        >
          {health.isFetching ? '↻ Checking…' : '↻ Refresh'}
        </button>
      </div>

      <p className="admin-section-desc">
        Automated backend monitor — compares the public &amp; admin endpoints against DB
        values every 5 minutes. Last checked:{' '}
        <strong>{fmtTs(health.data?.lastCheckedAt)}</strong>
      </p>

      {/* ── Loading ── */}
      {health.isLoading && <p className="admin-loading">Loading sync status…</p>}

      {/* ── Error fetching the health endpoint itself ── */}
      {health.isError && (
        <div className="admin-error-block">
          <p className="admin-error">
            {health.error instanceof Error ? health.error.message : String(health.error)}
          </p>
          <button className="admin-btn admin-btn--ghost" onClick={() => health.refetch()}>
            ↻ Retry
          </button>
        </div>
      )}

      {/* ── Data ── */}
      {health.isSuccess && (
        <>
          {/* Overall pill */}
          <div className="sync-overview">
            <SyncChip
              ok={hasError ? false : overallOk ? true : allPlansOk === null ? null : false}
              label={
                hasError        ? 'Monitor error'        :
                overallOk       ? 'All systems in sync'  :
                allPlansOk === null ? 'Awaiting first check' :
                'Mismatch detected'
              }
            />
            {health.data.lastError && (
              <p className="admin-error" style={{ marginTop: '0.5rem' }}>
                Monitor error: {health.data.lastError}
              </p>
            )}
          </div>

          {/* ── Public endpoint ── */}
          <div className="sync-sub-header">
            <span className="sync-sub-label">
              Public — <code>GET /api/config/anonymous-limit</code>
            </span>
          </div>

          {health.data.publicCheck ? (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>DB value</th>
                    <th>API value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><SyncChip ok={health.data.publicCheck.inSync} /></td>
                    <td>{fmtLimit(health.data.publicCheck.dbValue)}</td>
                    <td>{fmtLimit(health.data.publicCheck.apiValue)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <p className="admin-loading" style={{ padding: '0.75rem 0' }}>
              No public check data yet — waiting for first monitor run.
            </p>
          )}

          {/* ── Per-plan admin check ── */}
          <div className="sync-sub-header" style={{ marginTop: '1.5rem' }}>
            <span className="sync-sub-label">
              Admin — <code>GET /api/admin/plan-configs</code> vs DB
            </span>
          </div>

          {health.data.adminCheck?.plans?.length ? (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Plan</th>
                    <th>Status</th>
                    <th>DB value</th>
                    <th>API value</th>
                  </tr>
                </thead>
                <tbody>
                  {health.data.adminCheck.plans.map(plan => (
                    <tr key={plan.planName}>
                      <td className="admin-td-mono" style={{ maxWidth: 'unset' }}>
                        {plan.planName}
                      </td>
                      <td><SyncChip ok={plan.inSync} /></td>
                      <td>{fmtLimit(plan.dbValue)}</td>
                      <td>{fmtLimit(plan.apiValue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="admin-loading" style={{ padding: '0.75rem 0' }}>
              {health.data.adminCheck?.checked === false
                ? 'Admin check was skipped on last run.'
                : 'No plan data yet — waiting for first monitor run.'}
            </p>
          )}
        </>
      )}
    </div>
  )
}
