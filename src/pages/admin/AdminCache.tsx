import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminFetch } from '@/lib/adminClient'

interface CacheStats {
  cacheEnabled: boolean
  rescoreWindowDays: number
  totalCachedWallets: number
  oldestScore: string | null
  newestScore: string | null
}

function fmt(ts: string | null | undefined) {
  if (!ts) return '—'
  return new Date(ts).toLocaleString()
}

export function AdminCache() {
  const qc = useQueryClient()

  // ── Stats ────────────────────────────────────────────────────────────────
  const stats = useQuery({
    queryKey: ['admin', 'cache', 'stats'],
    queryFn: () => adminFetch<CacheStats>('/admin/cache/stats'),
    retry: false,
  })

  // ── Toggle ───────────────────────────────────────────────────────────────
  const toggleMutation = useMutation({
    mutationFn: (enabled: boolean) =>
      adminFetch<{ success: boolean; cacheEnabled: boolean }>('/admin/cache/toggle', {
        method: 'PATCH',
        body: JSON.stringify({ enabled }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'cache', 'stats'] }),
  })

  function handleToggle() {
    if (!stats.data) return
    const current = stats.data.cacheEnabled
    if (current) {
      if (!confirm('Turn cache OFF?\n\nLive chain data only while disabled. No results will be cached.')) return
    }
    toggleMutation.mutate(!current)
  }

  // ── Rescore window ───────────────────────────────────────────────────────
  const [windowDays, setWindowDays] = useState<number | ''>('')
  const [windowMsg, setWindowMsg]   = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    if (stats.data && windowDays === '') {
      setWindowDays(stats.data.rescoreWindowDays)
    }
  }, [stats.data])

  const windowMutation = useMutation({
    mutationFn: (days: number) =>
      adminFetch<{ success: boolean; rescoreWindowDays: number }>('/admin/rescore-window', {
        method: 'PATCH',
        body: JSON.stringify({ days }),
      }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['admin', 'cache', 'stats'] })
      setWindowMsg({ ok: true, text: `Rescore window set to ${data.rescoreWindowDays} days.` })
    },
    onError: (err) => {
      setWindowMsg({ ok: false, text: err instanceof Error ? err.message : String(err) })
    },
  })

  function handleWindowSave(e: React.FormEvent) {
    e.preventDefault()
    setWindowMsg(null)
    const days = Number(windowDays)
    if (!days || days < 1) { setWindowMsg({ ok: false, text: 'Enter a valid number of days (≥ 1).' }); return }
    windowMutation.mutate(days)
  }

  // ── Clear single wallet ──────────────────────────────────────────────────
  const [clearAddr, setClearAddr]   = useState('')
  const [clearMsg, setClearMsg]     = useState<{ ok: boolean; text: string } | null>(null)

  const clearOneMutation = useMutation({
    mutationFn: (address: string) =>
      adminFetch<{ success: boolean }>(`/admin/cache/${encodeURIComponent(address)}`, {
        method: 'DELETE',
      }),
    onSuccess: (_, address) => {
      qc.invalidateQueries({ queryKey: ['admin', 'cache', 'stats'] })
      setClearMsg({ ok: true, text: `Cache cleared for ${address}.` })
      setClearAddr('')
    },
    onError: (err) => {
      setClearMsg({ ok: false, text: err instanceof Error ? err.message : String(err) })
    },
  })

  function handleClearOne(e: React.FormEvent) {
    e.preventDefault()
    setClearMsg(null)
    const addr = clearAddr.trim()
    if (!addr) { setClearMsg({ ok: false, text: 'Enter a wallet address.' }); return }
    if (!confirm(`This will force a fresh score for ${addr} on next request.`)) return
    clearOneMutation.mutate(addr)
  }

  // ── Clear all ────────────────────────────────────────────────────────────
  const [clearAllMsg, setClearAllMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const clearAllMutation = useMutation({
    mutationFn: () =>
      adminFetch<{ success: boolean; deletedRows: number }>('/admin/cache', {
        method: 'DELETE',
      }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['admin', 'cache', 'stats'] })
      setClearAllMsg({ ok: true, text: `All cache cleared — ${data.deletedRows} row${data.deletedRows !== 1 ? 's' : ''} deleted.` })
    },
    onError: (err) => {
      setClearAllMsg({ ok: false, text: err instanceof Error ? err.message : String(err) })
    },
  })

  function handleClearAll() {
    setClearAllMsg(null)
    const count = stats.data?.totalCachedWallets ?? 0
    if (!confirm(`This will wipe all ${count} cached score${count !== 1 ? 's' : ''}.\nEvery wallet will be rescored on next request.`)) return
    clearAllMutation.mutate()
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="admin-section">
      <h2 className="admin-section-title">Cache</h2>

      {/* ── Stats row ─────────────────────────────────────────────────── */}
      <div className="admin-section-header" style={{ marginBottom: '1rem' }}>
        <h3 className="admin-subsection-title" style={{ marginBottom: 0 }}>Stats</h3>
        <button
          className="admin-btn admin-btn--ghost"
          onClick={() => stats.refetch()}
          disabled={stats.isFetching}
        >
          {stats.isFetching ? 'Refreshing…' : '↻ Refresh stats'}
        </button>
      </div>

      {stats.isLoading && <p className="admin-loading">Loading cache stats…</p>}

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
        <div className="admin-stat-grid" style={{ marginBottom: '2rem' }}>
          <div className="admin-stat-card">
            <span
              className="admin-stat-value"
              style={{ color: stats.data.cacheEnabled ? 'var(--mint)' : 'var(--danger)' }}
            >
              {stats.data.cacheEnabled ? 'ON' : 'OFF'}
            </span>
            <span className="admin-stat-label">Cache enabled</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-value">{stats.data.rescoreWindowDays}d</span>
            <span className="admin-stat-label">Rescore window</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-value">{stats.data.totalCachedWallets.toLocaleString()}</span>
            <span className="admin-stat-label">Wallets cached</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-value" style={{ fontSize: '0.95rem' }}>{fmt(stats.data.oldestScore)}</span>
            <span className="admin-stat-label">Oldest score</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-value" style={{ fontSize: '0.95rem' }}>{fmt(stats.data.newestScore)}</span>
            <span className="admin-stat-label">Newest score</span>
          </div>
        </div>
      )}

      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', marginBottom: '2rem' }} />

      {/* ── Cache toggle ──────────────────────────────────────────────── */}
      <h3 className="admin-subsection-title">Cache toggle</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button
          className={`admin-btn ${stats.data?.cacheEnabled ? 'admin-btn--danger' : 'admin-btn--primary'}`}
          onClick={handleToggle}
          disabled={toggleMutation.isPending || !stats.isSuccess}
        >
          {toggleMutation.isPending
            ? 'Updating…'
            : stats.data?.cacheEnabled
              ? 'Turn cache OFF'
              : 'Turn cache ON'}
        </button>
        {stats.isSuccess && (
          <span style={{ fontSize: '0.83rem', color: 'var(--text-dim)' }}>
            Current state: <strong style={{ color: stats.data.cacheEnabled ? 'var(--mint)' : 'var(--danger)' }}>
              {stats.data.cacheEnabled ? 'ON' : 'OFF'}
            </strong>
          </span>
        )}
      </div>
      {toggleMutation.isError && (
        <p className="admin-error" style={{ marginBottom: '1.5rem' }}>
          {toggleMutation.error instanceof Error ? toggleMutation.error.message : String(toggleMutation.error)}
        </p>
      )}

      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', marginBottom: '2rem' }} />

      {/* ── Rescore window ────────────────────────────────────────────── */}
      <h3 className="admin-subsection-title">Rescore window</h3>
      <p className="admin-section-desc">
        Wallets scored more recently than this window will be served from cache. Wallets older than the window are rescored live.
      </p>
      <form className="admin-form" onSubmit={handleWindowSave} style={{ maxWidth: 320 }}>
        <div className="admin-form-row">
          <label>Window (days)</label>
          <input
            className="admin-input"
            type="number"
            min={1}
            value={windowDays}
            onChange={e => { setWindowDays(e.target.value === '' ? '' : Number(e.target.value)); setWindowMsg(null) }}
            placeholder="e.g. 7"
          />
        </div>
        <button
          className="admin-btn admin-btn--primary"
          type="submit"
          disabled={windowMutation.isPending}
        >
          {windowMutation.isPending ? 'Saving…' : 'Save'}
        </button>
        {windowMsg && (
          <p className={windowMsg.ok ? 'admin-success' : 'admin-error'} style={{ marginTop: '0.5rem' }}>
            {windowMsg.text}
          </p>
        )}
      </form>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '2rem 0' }} />

      {/* ── Clear single wallet ───────────────────────────────────────── */}
      <h3 className="admin-subsection-title">Clear single wallet</h3>
      <p className="admin-section-desc">
        Force a fresh live score for one wallet address on its next request.
      </p>
      <form className="admin-form" onSubmit={handleClearOne} style={{ maxWidth: 480 }}>
        <div className="admin-form-row">
          <label>Wallet address</label>
          <input
            className="admin-input"
            value={clearAddr}
            onChange={e => { setClearAddr(e.target.value); setClearMsg(null) }}
            placeholder="0x… or base58…"
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
          />
        </div>
        <button
          className="admin-btn admin-btn--danger"
          type="submit"
          disabled={clearOneMutation.isPending}
        >
          {clearOneMutation.isPending ? 'Clearing…' : 'Clear wallet cache'}
        </button>
        {clearMsg && (
          <p className={clearMsg.ok ? 'admin-success' : 'admin-error'} style={{ marginTop: '0.5rem' }}>
            {clearMsg.text}
          </p>
        )}
      </form>

      <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '2rem 0' }} />

      {/* ── Clear all ─────────────────────────────────────────────────── */}
      <h3 className="admin-subsection-title">Clear all cache</h3>
      <p className="admin-section-desc">
        Wipe every cached score. All wallets will be rescored live on their next request.
      </p>
      <button
        className="admin-btn admin-btn--danger admin-btn--lg"
        onClick={handleClearAll}
        disabled={clearAllMutation.isPending || !stats.isSuccess}
      >
        {clearAllMutation.isPending ? 'Clearing…' : 'Clear all cache'}
      </button>
      {clearAllMsg && (
        <p className={clearAllMsg.ok ? 'admin-success' : 'admin-error'} style={{ marginTop: '0.75rem' }}>
          {clearAllMsg.text}
        </p>
      )}
    </div>
  )
}
