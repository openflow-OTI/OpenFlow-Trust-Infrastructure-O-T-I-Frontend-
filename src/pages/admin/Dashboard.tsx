import { useQuery } from '@tanstack/react-query'
import { adminFetch } from '@/lib/adminClient'

interface StatsResponse {
  total_keys: number
  total_compromised: number
  today_requests: number
  requests_by_plan: { plan_name: string; req_count: number }[]
}

export function Dashboard() {
  const stats = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminFetch<StatsResponse>('/admin/stats'),
    retry: false,
  })

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">Dashboard</h2>

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
    </div>
  )
}
