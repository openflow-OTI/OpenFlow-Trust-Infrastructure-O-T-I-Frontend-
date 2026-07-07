import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminFetch } from '@/lib/adminClient'

interface UsageRow {
  id: string
  key_ref: string
  usage_date: string
  req_count: number
  plan_name: string
}

function todayUTC() {
  return new Date().toISOString().slice(0, 10)
}

export function Usage() {
  const [date, setDate] = useState(todayUTC())
  const [keyRef, setKeyRef] = useState('')
  const [submitted, setSubmitted] = useState({ date: todayUTC(), keyRef: '' })

  const usage = useQuery({
    queryKey: ['admin', 'usage', submitted.date, submitted.keyRef],
    queryFn: () => {
      const params = new URLSearchParams()
      if (submitted.date)   params.set('date', submitted.date)
      if (submitted.keyRef) params.set('key_ref', submitted.keyRef)
      const qs = params.toString()
      return adminFetch<UsageRow[]>(`/admin/usage${qs ? `?${qs}` : ''}`)
    },
    retry: false,
  })

  function handleFilter(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted({ date, keyRef })
  }

  const total = usage.data?.reduce((s, r) => s + r.req_count, 0) ?? 0

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2 className="admin-section-title">Usage</h2>
      </div>
      <p className="admin-section-desc">
        Daily request counts per API key or anonymous IP. Filter by date and/or key reference.
      </p>

      <form className="admin-form" onSubmit={handleFilter}>
        <div className="admin-form-row">
          <label>Date (UTC)</label>
          <input
            className="admin-input"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
          <button
            type="button"
            className="admin-btn admin-btn--ghost"
            onClick={() => { setDate(todayUTC()); setSubmitted(s => ({ ...s, date: todayUTC() })) }}
          >
            Today
          </button>
        </div>
        <div className="admin-form-row">
          <label>Key / IP filter</label>
          <input
            className="admin-input"
            placeholder="anon:203.0.113.42 or oti_abc…"
            value={keyRef}
            onChange={e => setKeyRef(e.target.value)}
          />
        </div>
        <div className="admin-form-row">
          <button className="admin-btn admin-btn--primary" type="submit">
            Apply
          </button>
          <button
            className="admin-btn admin-btn--ghost"
            type="button"
            onClick={() => {
              setDate(todayUTC())
              setKeyRef('')
              setSubmitted({ date: todayUTC(), keyRef: '' })
            }}
          >
            Reset
          </button>
        </div>
      </form>

      {usage.isLoading && <p className="admin-loading">Loading usage…</p>}
      {usage.isError && (
        <div className="admin-error-block">
          <p className="admin-error">
            {usage.error instanceof Error ? usage.error.message : String(usage.error)}
          </p>
          <button className="admin-btn admin-btn--ghost" onClick={() => usage.refetch()}>
            ↻ Retry
          </button>
        </div>
      )}

      {usage.data && (
        <>
          <p className="admin-section-desc" style={{ marginTop: '0.25rem' }}>
            {usage.data.length} rows — {total.toLocaleString()} total requests
          </p>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Key / IP</th>
                  <th>Plan</th>
                  <th>Date</th>
                  <th>Requests</th>
                </tr>
              </thead>
              <tbody>
                {usage.data.map(row => (
                  <tr key={row.id}>
                    <td className="admin-td-mono">{row.key_ref}</td>
                    <td>{row.plan_name}</td>
                    <td>{row.usage_date}</td>
                    <td>{(row.req_count ?? 0).toLocaleString()}</td>
                  </tr>
                ))}
                {usage.data.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-dim)' }}>
                      No usage data for these filters.
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
