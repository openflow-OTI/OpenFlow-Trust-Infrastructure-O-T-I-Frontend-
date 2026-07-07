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

  if (stats.isLoading) return <p className="admin-loading">Loading stats…</p>
  if (stats.isError)
    return <p className="admin-error">Failed to load stats: {String(stats.error)}</p>

  const s = stats.data!

  return (
    <div className="admin-section">
      <h2 className="admin-section-title">Dashboard</h2>

      <div className="admin-stat-grid">
        <div className="admin-stat-card">
          <span className="admin-stat-value">{s.today_requests.toLocaleString()}</span>
          <span className="admin-stat-label">Requests today</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-value">{s.total_keys.toLocaleString()}</span>
          <span className="admin-stat-label">Active API keys</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-value">{s.total_compromised.toLocaleString()}</span>
          <span className="admin-stat-label">Flagged wallets (DB total)</span>
        </div>
      </div>

      {s.requests_by_plan.length > 0 && (
        <>
          <h3 className="admin-subsection-title">Requests by plan (today)</h3>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Plan</th>
                <th>Requests</th>
              </tr>
            </thead>
            <tbody>
              {s.requests_by_plan.map(row => (
                <tr key={row.plan_name}>
                  <td>{row.plan_name}</td>
                  <td>{row.req_count.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}
