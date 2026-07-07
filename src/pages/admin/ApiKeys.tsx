import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminFetch } from '@/lib/adminClient'
import { CopyButton } from './CopyButton'

interface ApiKey {
  id: string
  owner_address: string
  plan: string
  last4: string
  expires_at?: string | null
  created_at: string
  updated_at?: string | null
}

interface ApiKeyCreated extends ApiKey {
  apiKey: string
}

function fmt(ts?: string | null) {
  if (!ts) return '—'
  return new Date(ts).toLocaleString()
}


export function ApiKeys() {
  const qc = useQueryClient()

  const keys = useQuery({
    queryKey: ['admin', 'keys'],
    queryFn: () => adminFetch<ApiKey[]>('/admin/keys'),
    retry: false,
  })

  // Create form state
  const [showCreate, setShowCreate] = useState(false)
  const [createForm, setCreateForm] = useState({ owner_address: '', plan: 'free', expires_at: '' })
  const [newKeySecret, setNewKeySecret] = useState<string | null>(null)

  // Edit state
  const [editId, setEditId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ plan: 'free', expires_at: '' })

  const createMutation = useMutation({
    mutationFn: () =>
      adminFetch<ApiKeyCreated>('/admin/keys', {
        method: 'POST',
        body: JSON.stringify({
          owner_address: createForm.owner_address,
          plan: createForm.plan,
          expires_at: createForm.expires_at || null,
        }),
      }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['admin', 'keys'] })
      setNewKeySecret(JSON.stringify(data))
      setCreateForm({ owner_address: '', plan: 'free', expires_at: '' })
      setShowCreate(false)
    },
  })

  const editMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: object }) =>
      adminFetch<ApiKey>(`/admin/keys/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'keys'] })
      setEditId(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      adminFetch(`/admin/keys/${id}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'keys'] }),
  })

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2 className="admin-section-title">API Keys</h2>
        <button className="admin-btn admin-btn--primary" onClick={() => setShowCreate(v => !v)}>
          {showCreate ? 'Cancel' : '+ New Key'}
        </button>
      </div>

      {newKeySecret && (
        <div className="key-modal-overlay">
          <div className="key-modal">
            <h3 className="key-modal-title">Your New API Key</h3>
            <p className="key-modal-warning">
              ⚠ Save this key now — it will never be shown again.
            </p>
            <code className="key-modal-value">{newKeySecret}</code>
            <CopyButton value={newKeySecret} label="Copy Key" className="key-modal-copy-btn" />
            <button
              className="admin-btn admin-btn--ghost key-modal-dismiss"
              onClick={() => setNewKeySecret(null)}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {showCreate && (
        <form
          className="admin-form"
          onSubmit={e => { e.preventDefault(); createMutation.mutate() }}
        >
          <h3 className="admin-subsection-title">Issue new key</h3>
          <div className="admin-form-row">
            <label>Owner address / email</label>
            <input
              className="admin-input"
              value={createForm.owner_address}
              onChange={e => setCreateForm(f => ({ ...f, owner_address: e.target.value }))}
              placeholder="0x… or email"
              required
            />
          </div>
          <div className="admin-form-row">
            <label>Plan</label>
            <select
              className="admin-input"
              value={createForm.plan}
              onChange={e => setCreateForm(f => ({ ...f, plan: e.target.value }))}
            >
              <option value="free">free</option>
              <option value="pro">pro</option>
              <option value="enterprise">enterprise</option>
            </select>
          </div>
          <div className="admin-form-row">
            <label>Expires at (optional)</label>
            <input
              className="admin-input"
              type="datetime-local"
              value={createForm.expires_at}
              onChange={e => setCreateForm(f => ({ ...f, expires_at: e.target.value }))}
            />
          </div>
          <button
            className="admin-btn admin-btn--primary"
            type="submit"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? 'Creating…' : 'Create key'}
          </button>
          {createMutation.isError && (
            <p className="admin-error">{createMutation.error instanceof Error ? createMutation.error.message : String(createMutation.error)}</p>
          )}
        </form>
      )}

      {keys.isLoading && <p className="admin-loading">Loading keys…</p>}

      {keys.isError && (
        <div className="admin-error-block">
          <p className="admin-error">
            {keys.error instanceof Error ? keys.error.message : String(keys.error)}
          </p>
          <button
            className="admin-btn admin-btn--ghost"
            onClick={() => keys.refetch()}
          >
            ↻ Retry
          </button>
        </div>
      )}

      {keys.isSuccess && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Owner</th>
                <th>Plan</th>
                <th>Last 4</th>
                <th>Created</th>
                <th>Expires</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {keys.data.map(k => (
                <React.Fragment key={k.id}>
                  <tr>
                    <td className="admin-td-mono">
                      {k.owner_address ? (
                        <span className="admin-copy-row">
                          <span>{k.owner_address}</span>
                          <CopyButton value={k.owner_address} />
                        </span>
                      ) : '—'}
                    </td>
                    <td>{k.plan}</td>
                    <td className="admin-td-mono">…{k.last4}</td>
                    <td>{fmt(k.created_at)}</td>
                    <td>{fmt(k.expires_at)}</td>
                    <td>
                      <div className="admin-action-group">
                        <button
                          className="admin-btn admin-btn--ghost"
                          onClick={() => {
                            setEditId(editId === k.id ? null : k.id)
                            setEditForm({ plan: k.plan, expires_at: k.expires_at ?? '' })
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="admin-btn admin-btn--danger"
                          disabled={deleteMutation.isPending}
                          onClick={() => {
                            if (confirm(`Delete key …${k.last4}?`)) deleteMutation.mutate(k.id)
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                  {editId === k.id && (
                    <tr key={`${k.id}-edit`} className="admin-edit-row">
                      <td colSpan={6}>
                        <form
                          className="admin-form admin-form--inline"
                          onSubmit={e => {
                            e.preventDefault()
                            editMutation.mutate({
                              id: k.id,
                              body: {
                                plan: editForm.plan,
                                expires_at: editForm.expires_at || null,
                              },
                            })
                          }}
                        >
                          <div className="admin-form-row">
                            <label>Plan</label>
                            <select
                              className="admin-input"
                              value={editForm.plan}
                              onChange={e => setEditForm(f => ({ ...f, plan: e.target.value }))}
                            >
                              <option value="free">free</option>
                              <option value="pro">pro</option>
                              <option value="enterprise">enterprise</option>
                            </select>
                          </div>
                          <div className="admin-form-row">
                            <label>Expires at</label>
                            <input
                              className="admin-input"
                              type="datetime-local"
                              value={editForm.expires_at ?? ''}
                              onChange={e => setEditForm(f => ({ ...f, expires_at: e.target.value }))}
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
                              onClick={() => setEditId(null)}
                            >
                              Cancel
                            </button>
                          </div>
                          {editMutation.isError && (
                            <p className="admin-error">{editMutation.error instanceof Error ? editMutation.error.message : String(editMutation.error)}</p>
                          )}
                        </form>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              {keys.data.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-dim)' }}>
                    No keys issued yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
