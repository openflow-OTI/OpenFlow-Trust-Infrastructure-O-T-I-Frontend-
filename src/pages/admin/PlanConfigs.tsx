import React, { useState, Component, type ReactNode } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminFetch } from '@/lib/adminClient'

// Error boundary — prevents a crash here from blanking the whole admin page
class PlanConfigsErrorBoundary extends Component<{ children: ReactNode }, { error: string | null }> {
  state = { error: null }
  static getDerivedStateFromError(e: Error) { return { error: e.message } }
  render() {
    if (this.state.error) return <p className="admin-error">Failed to render Plan Configs: {this.state.error}</p>
    return this.props.children
  }
}

// Schema: snake_case throughout (matches schema.gen.ts PlanConfig)
interface PlanConfig {
  id: string
  plan_name: 'anonymous' | 'free' | 'pro' | 'enterprise'
  daily_limit: number | null
  description: string
  updated_at: string
}

function fmtLimit(limit: number | null | undefined) {
  if (limit == null) return 'Unlimited'
  return limit.toLocaleString()
}

function fmt(ts: string | null | undefined) {
  if (!ts) return '—'
  return new Date(ts).toLocaleString()
}

export function PlanConfigs() {
  return <PlanConfigsErrorBoundary><PlanConfigsInner /></PlanConfigsErrorBoundary>
}

function PlanConfigsInner() {
  const qc = useQueryClient()

  const configs = useQuery({
    queryKey: ['admin', 'plan-configs'],
    queryFn: () => adminFetch<PlanConfig[]>('/admin/plan-configs'),
    retry: false,
  })

  const [editPlan, setEditPlan] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<{ daily_limit: string; description: string }>({
    daily_limit: '',
    description: '',
  })
  const [inputError, setInputError] = useState<string | null>(null)

  const editMutation = useMutation({
    // PATCH /admin/plan-configs/{plan_name} — uses plan name, not UUID
    mutationFn: ({ plan_name, body }: { plan_name: string; body: { daily_limit?: number | null; description?: string } }) =>
      adminFetch<PlanConfig>(`/admin/plan-configs/${plan_name}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'plan-configs'] })
      setEditPlan(null)
    },
  })

  function startEdit(cfg: PlanConfig) {
    setEditPlan(cfg.plan_name)
    setInputError(null)
    editMutation.reset()
    setEditForm({
      daily_limit: cfg.daily_limit !== null ? String(cfg.daily_limit) : '',
      description: cfg.description ?? '',
    })
  }

  function cancelEdit() {
    setEditPlan(null)
    setInputError(null)
    editMutation.reset()
  }

  function handleSave(e: React.FormEvent, plan_name: string) {
    e.preventDefault()
    setInputError(null)
    const raw = editForm.daily_limit.trim()
    let daily_limit: number | null = null
    if (raw !== '') {
      const n = Number(raw)
      if (!Number.isFinite(n) || n < 0 || !Number.isInteger(n)) {
        setInputError('Daily limit must be a whole number ≥ 0, or left blank for Unlimited.')
        return
      }
      daily_limit = n
    }
    editMutation.mutate({ plan_name, body: { daily_limit, description: editForm.description } })
  }

  if (configs.isLoading) return <p className="admin-loading">Loading plan configs…</p>
  if (configs.isError)
    return <p className="admin-error">Failed to load plan configs: {String(configs.error)}</p>

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2 className="admin-section-title">Plan Configs</h2>
      </div>
      <p className="admin-section-desc">
        Edit rate limits and descriptions for each plan. Leave Daily Limit blank to set it to
        Unlimited.
      </p>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Plan</th>
            <th>Daily Limit</th>
            <th>Description</th>
            <th>Last Updated</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {configs.data!.map(cfg => (
            <React.Fragment key={cfg.id}>
              <tr>
                <td className="admin-td-mono" style={{ maxWidth: 'unset' }}>{cfg.plan_name}</td>
                <td>{fmtLimit(cfg.daily_limit)}</td>
                <td style={{ color: cfg.description ? 'var(--text)' : 'var(--text-dim)' }}>
                  {cfg.description || '—'}
                </td>
                <td>{fmt(cfg.updated_at)}</td>
                <td>
                  <button
                    className="admin-btn admin-btn--ghost"
                    onClick={() => editPlan === cfg.plan_name ? cancelEdit() : startEdit(cfg)}
                  >
                    {editPlan === cfg.plan_name ? 'Cancel' : 'Edit'}
                  </button>
                </td>
              </tr>

              {editPlan === cfg.plan_name && (
                <tr key={`${cfg.id}-edit`} className="admin-edit-row">
                  <td colSpan={5}>
                    <form
                      className="admin-form admin-form--inline"
                      onSubmit={e => handleSave(e, cfg.plan_name)}
                    >
                      <div className="admin-form-row">
                        <label>Daily Limit</label>
                        <input
                          className="admin-input"
                          type="number"
                          min={0}
                          step={1}
                          placeholder="Unlimited (leave blank)"
                          value={editForm.daily_limit}
                          onChange={e => setEditForm(f => ({ ...f, daily_limit: e.target.value }))}
                        />
                      </div>
                      <div className="admin-form-row">
                        <label>Description</label>
                        <input
                          className="admin-input"
                          type="text"
                          placeholder="e.g. Anonymous users"
                          value={editForm.description}
                          onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                        />
                      </div>
                      <div className="admin-form-row">
                        <button
                          className="admin-btn admin-btn--primary"
                          type="submit"
                          disabled={editMutation.isPending}
                        >
                          {editMutation.isPending ? 'Saving…' : 'Save'}
                        </button>
                        <button
                          className="admin-btn admin-btn--ghost"
                          type="button"
                          onClick={cancelEdit}
                        >
                          Cancel
                        </button>
                      </div>
                      {inputError && <p className="admin-error">{inputError}</p>}
                      {editMutation.isError && (
                        <p className="admin-error">{String(editMutation.error)}</p>
                      )}
                      {editMutation.isSuccess && (
                        <p className="admin-success">Saved.</p>
                      )}
                    </form>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
          {configs.data!.length === 0 && (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-dim)' }}>
                No plan configs found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
