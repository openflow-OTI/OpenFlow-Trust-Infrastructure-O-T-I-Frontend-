import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminFetch } from '@/lib/adminClient'
import { CopyButton } from './CopyButton'
import { CHAINS } from '@/lib/chains'

interface HistoryEntry {
  address: string
  chain: string
  score: number
  timestamp: string
}

function escapeCsv(val: string | number): string {
  const s = String(val)
  return s.includes(',') || s.includes('"') || s.includes('\n')
    ? `"${s.replace(/"/g, '""')}"`
    : s
}

function downloadCsv(rows: HistoryEntry[], hasFilters: boolean) {
  const header = ['address', 'chain', 'score', 'timestamp']
  const lines  = [
    header.join(','),
    ...rows.map(r =>
      [r.address, r.chain, r.score, new Date(r.timestamp).toISOString()].map(escapeCsv).join(',')
    ),
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  const date = new Date().toISOString().slice(0, 10)
  a.href     = url
  a.download = `oti-query-history${hasFilters ? '-filtered' : ''}-${date}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function QueryHistory() {
  const history = useQuery({
    queryKey: ['admin', 'history'],
    queryFn: () => adminFetch<HistoryEntry[]>('/admin/history'),
    retry: false,
    staleTime: 0,
  })

  // Committed filters — only applied when Search is clicked or Enter is pressed
  const [addrInput,   setAddrInput]   = useState('')
  const [addrFilter,  setAddrFilter]  = useState('')
  const [chainFilter, setChainFilter] = useState('')
  const [dateFrom,    setDateFrom]    = useState('')
  const [dateTo,      setDateTo]      = useState('')


  const filtered = useMemo(() => {
    if (!history.data) return []
    const addr = addrFilter.trim().toLowerCase()
    const from = dateFrom ? new Date(dateFrom).getTime() : null
    const to   = dateTo   ? new Date(dateTo + 'T23:59:59').getTime() : null

    return history.data.filter(r => {
      if (addr        && !r.address.toLowerCase().includes(addr)) return false
      if (chainFilter && r.chain !== chainFilter)                  return false
      const ts = new Date(r.timestamp).getTime()
      if (from && ts < from) return false
      if (to   && ts > to)   return false
      return true
    })
  }, [history.data, addrFilter, chainFilter, dateFrom, dateTo])

  const hasFilters = !!(addrFilter || chainFilter || dateFrom || dateTo)

  function applySearch() {
    setAddrFilter(addrInput)
  }

  function clearFilters() {
    setAddrInput('')
    setAddrFilter('')
    setChainFilter('')
    setDateFrom('')
    setDateTo('')
  }

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2 className="admin-section-title">Query History</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="admin-btn admin-btn--ghost"
            onClick={() => history.refetch()}
            disabled={history.isFetching}
          >
            {history.isFetching ? 'Refreshing…' : '↻ Refresh'}
          </button>
          {history.isSuccess && filtered.length > 0 && (
            <button
              className="admin-btn admin-btn--ghost"
              onClick={() => downloadCsv(filtered, hasFilters)}
            >
              ↓ Export CSV{hasFilters ? ` (${filtered.length.toLocaleString()})` : ''}
            </button>
          )}
        </div>
      </div>

      {history.isLoading && <p className="admin-loading">Loading history…</p>}

      {history.isError && (
        <div className="admin-error-block">
          <p className="admin-error">
            {history.error instanceof Error ? history.error.message : String(history.error)}
          </p>
          <button className="admin-btn admin-btn--ghost" onClick={() => history.refetch()}>
            ↻ Retry
          </button>
        </div>
      )}

      {history.isSuccess && (
        <>
          {/* ── Filter bar ─────────────────────────────────────────── */}
          <div style={{
            display: 'flex',
            gap: '0.6rem',
            flexWrap: 'wrap',
            alignItems: 'flex-end',
            marginBottom: '1rem',
          }}>
            {/* Address — commits on Search button or Enter */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: '1 1 200px', minWidth: 0 }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-dim)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Address
              </label>
              <input
                className="admin-input"
                value={addrInput}
                onChange={e => setAddrInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') applySearch() }}
                placeholder="Search by address…"
                spellCheck={false}
                autoCorrect="off"
                autoCapitalize="off"
                style={{ minWidth: 0 }}
              />
            </div>

            <button
              className="admin-btn admin-btn--primary"
              onClick={applySearch}
              style={{ alignSelf: 'flex-end', whiteSpace: 'nowrap' }}
            >
              Search
            </button>

            {/* Chain — applies immediately */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: '0 0 140px' }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-dim)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Chain
              </label>
              <select
                className="admin-input"
                value={chainFilter}
                onChange={e => setChainFilter(e.target.value)}
              >
                <option value="">All chains</option>
                {CHAINS.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>

            {/* Date range — applies immediately */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: '0 0 140px' }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-dim)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                From
              </label>
              <input
                className="admin-input"
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: '0 0 140px' }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-dim)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                To
              </label>
              <input
                className="admin-input"
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
              />
            </div>

            {(hasFilters || addrInput) && (
              <button
                className="admin-btn admin-btn--ghost"
                onClick={clearFilters}
                style={{ alignSelf: 'flex-end' }}
              >
                ✕ Clear
              </button>
            )}
          </div>

          {/* ── Result count ───────────────────────────────────────── */}
          <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginBottom: '0.6rem' }}>
            {history.data.length === 0
              ? 'No history recorded yet — scores will appear here after wallets are queried.'
              : <>
                  Showing {filtered.length.toLocaleString()} of {history.data.length.toLocaleString()} result{history.data.length !== 1 ? 's' : ''}
                  {hasFilters && filtered.length === 0 && (
                    <span style={{ color: 'var(--danger)', marginLeft: '0.5rem' }}>
                      — no matches. Try a different address or clear the filters.
                    </span>
                  )}
                </>
            }
          </p>

          {/* ── Table ──────────────────────────────────────────────── */}
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Address</th>
                  <th>Chain</th>
                  <th>Score</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={i}>
                    <td className="admin-td-mono">
                      <span className="admin-copy-row">
                        <span>{r.address}</span>
                        <CopyButton value={r.address} />
                      </span>
                    </td>
                    <td>{r.chain}</td>
                    <td>{r.score}</td>
                    <td>{new Date(r.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-dim)' }}>
                      {history.data.length === 0
                        ? 'No history yet.'
                        : hasFilters
                          ? 'No results match the current filters.'
                          : 'No history yet.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
