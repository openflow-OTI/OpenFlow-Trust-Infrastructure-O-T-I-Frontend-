import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { adminFetch } from '@/lib/adminClient'

export type WORSubView = 'registry' | 'compromised' | 'override'

interface WORRegistration {
  id?: string
  address: string
  chain_family: string
  registered_at: string
  last_verified_at?: string
  status: string
}

interface WORRegistrationsResponse {
  registrations?: WORRegistration[]
  data?: WORRegistration[]
  total?: number
  page?: number
  limit?: number
}

function fmt(ts?: string) {
  if (!ts) return '—'
  return new Date(ts).toLocaleString()
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'compromised') {
    return (
      <span className="wor-status-badge wor-status-badge--compromised">
        <span className="wor-status-dot" />compromised
      </span>
    )
  }
  if (status === 'active') {
    return (
      <span className="wor-status-badge wor-status-badge--active">
        <span className="wor-status-dot" />active
      </span>
    )
  }
  return <span className="wor-status-badge">{status}</span>
}

// ── Shared registry table ────────────────────────────────────────────────────
function RegistryTable({
  statusFilter,
  allowRemove,
}: {
  statusFilter: 'all' | 'active' | 'compromised'
  allowRemove?: boolean
}) {
  const qc                          = useQueryClient()
  const [search, setSearch]         = useState('')
  const [status, setStatus]         = useState<'all' | 'active' | 'compromised'>(statusFilter)
  const [page, setPage]             = useState(1)
  const [removing, setRemoving]     = useState<string | null>(null)
  const limit                       = 20

  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...(search ? { search } : {}),
    ...(status !== 'all' ? { status } : {}),
  })

  const query = useQuery({
    queryKey: ['admin', 'wor', 'registrations', page, limit, search, status],
    queryFn: () => adminFetch<WORRegistrationsResponse>(`/admin/wor/registrations?${params}`),
    retry: false,
  })

  const rows: WORRegistration[] = query.data?.registrations ?? query.data?.data ?? []
  const total = query.data?.total ?? rows.length

  async function handleRemove(addr: string) {
    if (!confirm(`Remove the compromised flag from "${addr}"?\n\nScoring will resume normally.`)) return
    setRemoving(addr)
    try {
      await adminFetch(`/admin/wor/flag/${encodeURIComponent(addr)}`, { method: 'DELETE' })
      qc.invalidateQueries({ queryKey: ['admin', 'wor'] })
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to remove flag.')
    } finally {
      setRemoving(null)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Filter bar */}
      <div className="wor-admin-filters">
        <input
          className="admin-input"
          style={{ maxWidth: 260 }}
          placeholder="Search by address…"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          onKeyDown={e => { if (e.key === 'Enter') query.refetch() }}
        />
        {statusFilter === 'all' && (
          <select
            className="admin-input"
            style={{ maxWidth: 160 }}
            value={status}
            onChange={e => { setStatus(e.target.value as typeof status); setPage(1) }}
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="compromised">Compromised</option>
          </select>
        )}
        <button className="admin-btn admin-btn--ghost" onClick={() => query.refetch()}>
          ↻ Refresh
        </button>
        {(search || (statusFilter === 'all' && status !== 'all')) && (
          <button
            className="admin-btn admin-btn--ghost"
            onClick={() => { setSearch(''); setStatus(statusFilter); setPage(1) }}
          >
            ✕ Clear
          </button>
        )}
      </div>

      {query.isLoading && <p className="admin-loading">Loading registrations…</p>}

      {query.isError && (
        <div className="admin-error-block">
          <p className="admin-error">
            {query.error instanceof Error ? query.error.message : String(query.error)}
          </p>
          <button className="admin-btn admin-btn--ghost" onClick={() => query.refetch()}>↻ Retry</button>
        </div>
      )}

      {query.isSuccess && (
        <>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Address</th>
                  <th>Chain</th>
                  <th>Status</th>
                  <th>Registered</th>
                  <th>Last Verified</th>
                  {allowRemove && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.id ?? `${r.address}-${i}`}>
                    <td className="admin-td-mono">{r.address}</td>
                    <td>{r.chain_family}</td>
                    <td><StatusBadge status={r.status} /></td>
                    <td>{fmt(r.registered_at)}</td>
                    <td>{fmt(r.last_verified_at)}</td>
                    {allowRemove && (
                      <td>
                        <button
                          className="admin-btn admin-btn--ghost"
                          style={{ fontSize: '0.72rem', padding: '0.3rem 0.65rem' }}
                          disabled={removing === r.address}
                          onClick={() => handleRemove(r.address)}
                        >
                          {removing === r.address ? 'Removing…' : '✕ Remove Flag'}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={allowRemove ? 6 : 5} style={{ textAlign: 'center', color: 'var(--text-dim)', padding: '2rem 1rem' }}>
                      No registrations found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="wor-admin-pagination">
            <span className="wor-admin-page-info">
              {rows.length > 0
                ? `Showing ${(page - 1) * limit + 1}–${(page - 1) * limit + rows.length}${total ? ` of ${total}` : ''}`
                : '0 results'}
            </span>
            <div className="admin-action-group">
              <button className="admin-btn admin-btn--ghost" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                ← Prev
              </button>
              <button className="admin-btn admin-btn--ghost" disabled={rows.length < limit} onClick={() => setPage(p => p + 1)}>
                Next →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ── Manual Override ──────────────────────────────────────────────────────────
function ManualOverride() {
  const qc                                       = useQueryClient()
  const [flagAddr, setFlagAddr]                  = useState('')
  const [unflagAddr, setUnflagAddr]              = useState('')
  const [flagLoading, setFlagLoading]            = useState(false)
  const [unflagLoading, setUnflagLoading]        = useState(false)
  const [flagMsg, setFlagMsg]                    = useState<{ ok: boolean; text: string } | null>(null)
  const [unflagMsg, setUnflagMsg]                = useState<{ ok: boolean; text: string } | null>(null)

  async function handleFlag(e: React.FormEvent) {
    e.preventDefault()
    const addr = flagAddr.trim()
    if (!addr) return
    if (!confirm(`Flag "${addr}" as compromised?\n\nThis will show a warning on all future score checks for this address.`)) return
    setFlagLoading(true)
    setFlagMsg(null)
    try {
      const res = await adminFetch<{ message?: string }>('/admin/wor/flag', {
        method: 'POST',
        body: JSON.stringify({ address: addr }),
      })
      setFlagMsg({ ok: true, text: (res as { message?: string }).message ?? 'Wallet flagged successfully.' })
      setFlagAddr('')
      qc.invalidateQueries({ queryKey: ['admin', 'wor'] })
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
    } catch (err) {
      setFlagMsg({ ok: false, text: err instanceof Error ? err.message : 'Flag failed.' })
    } finally {
      setFlagLoading(false)
    }
  }

  async function handleUnflag(e: React.FormEvent) {
    e.preventDefault()
    const addr = unflagAddr.trim()
    if (!addr) return
    if (!confirm(`Remove the compromised flag from "${addr}"?\n\nScoring will resume normally.`)) return
    setUnflagLoading(true)
    setUnflagMsg(null)
    try {
      const res = await adminFetch<{ message?: string }>(
        `/admin/wor/flag/${encodeURIComponent(addr)}`,
        { method: 'DELETE' }
      )
      setUnflagMsg({ ok: true, text: (res as { message?: string }).message ?? 'Flag removed successfully.' })
      setUnflagAddr('')
      qc.invalidateQueries({ queryKey: ['admin', 'wor'] })
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
    } catch (err) {
      setUnflagMsg({ ok: false, text: err instanceof Error ? err.message : 'Unflag failed.' })
    } finally {
      setUnflagLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="wor-override-warn">
        <span className="wor-override-warn-icon">⚠</span>
        <span>These actions take effect immediately and are visible to all users. Use with care.</span>
      </div>

      {/* Flag */}
      <div className="admin-form">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span style={{ color: 'var(--danger)', fontSize: '1rem' }}>⚑</span>
          <h3 className="admin-subsection-title" style={{ margin: 0 }}>Flag as Compromised</h3>
        </div>
        <p className="admin-section-desc">
          Immediately marks a wallet as compromised. All future score checks will show a red warning.
        </p>
        <form onSubmit={handleFlag}>
          <div className="admin-form-row">
            <label>Address</label>
            <input
              className="admin-input"
              placeholder="0x… or wallet address"
              value={flagAddr}
              onChange={e => { setFlagAddr(e.target.value); setFlagMsg(null) }}
              spellCheck={false}
              autoCorrect="off"
              required
            />
            <button className="admin-btn admin-btn--danger" type="submit" disabled={flagLoading}>
              {flagLoading ? 'Flagging…' : '⚑ Flag'}
            </button>
          </div>
          {flagMsg && (
            <p className={flagMsg.ok ? 'admin-success' : 'admin-error'} style={{ marginTop: '0.5rem' }}>
              {flagMsg.text}
            </p>
          )}
        </form>
      </div>

      {/* Unflag */}
      <div className="admin-form">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span style={{ color: 'var(--accent)', fontSize: '1rem' }}>✓</span>
          <h3 className="admin-subsection-title" style={{ margin: 0 }}>Remove Flag</h3>
        </div>
        <p className="admin-section-desc">
          Removes the compromised flag. Scoring resumes immediately — the wallet is treated as uncompromised.
        </p>
        <form onSubmit={handleUnflag}>
          <div className="admin-form-row">
            <label>Address</label>
            <input
              className="admin-input"
              placeholder="0x… or wallet address"
              value={unflagAddr}
              onChange={e => { setUnflagAddr(e.target.value); setUnflagMsg(null) }}
              spellCheck={false}
              autoCorrect="off"
              required
            />
            <button className="admin-btn admin-btn--ghost" type="submit" disabled={unflagLoading}>
              {unflagLoading ? 'Removing…' : '✕ Remove Flag'}
            </button>
          </div>
          {unflagMsg && (
            <p className={unflagMsg.ok ? 'admin-success' : 'admin-error'} style={{ marginTop: '0.5rem' }}>
              {unflagMsg.text}
            </p>
          )}
        </form>
      </div>
    </div>
  )
}

// ── Main WOR tab ─────────────────────────────────────────────────────────────
interface WORProps {
  subView: WORSubView
  onSubViewChange: (v: WORSubView) => void
}

export function WOR({ subView, onSubViewChange }: WORProps) {
  const SUB_VIEWS: { id: WORSubView; label: string }[] = [
    { id: 'registry',    label: 'Registry'        },
    { id: 'compromised', label: 'Compromised'      },
    { id: 'override',    label: 'Manual Override'  },
  ]

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2 className="admin-section-title">Wallet Ownership Registry</h2>
      </div>
      <p className="admin-section-desc">
        Wallets registered via EVM ownership verification. Compromised wallets show a warning
        on all future score checks.
      </p>

      <div className="wor-admin-seg">
        {SUB_VIEWS.map(s => (
          <button
            key={s.id}
            className={`wor-admin-seg-btn${subView === s.id ? ' wor-admin-seg-btn--active' : ''}`}
            onClick={() => onSubViewChange(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {subView === 'registry'    && <RegistryTable statusFilter="all" />}
      {subView === 'compromised' && <RegistryTable statusFilter="compromised" allowRemove />}
      {subView === 'override'    && <ManualOverride />}
    </div>
  )
}
