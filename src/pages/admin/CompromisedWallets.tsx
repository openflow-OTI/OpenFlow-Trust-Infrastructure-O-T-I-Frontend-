import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminFetch } from '@/lib/adminClient'

interface CompromisedWallet {
  id: string
  address: string
  chain_family: string
  reason: string
  reported_at: string
}

const CHAINS = [
  'ethereum', 'bsc', 'polygon', 'arbitrum', 'optimism',
  'base', 'avalanche', 'fantom', 'linea', 'zksync',
  'ton', 'solana', 'sui', 'bitcoin', 'tron',
]

function fmt(ts: string) {
  if (!ts) return '—'
  return new Date(ts).toLocaleString()
}

const EMPTY_FORM = { address: '', chain: 'ethereum', reason: '' }

export function CompromisedWallets() {
  const qc = useQueryClient()

  const list = useQuery({
    queryKey: ['admin', 'compromised'],
    queryFn: () => adminFetch<CompromisedWallet[]>('/admin/compromised'),
    retry: false,
  })

  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  const addMutation = useMutation({
    mutationFn: () =>
      adminFetch<CompromisedWallet>('/admin/compromised', {
        method: 'POST',
        body: JSON.stringify({
          address: form.address.trim(),
          chain: form.chain,
          reason: form.reason.trim(),
        }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'compromised'] })
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
      setForm(EMPTY_FORM)
      setShowAdd(false)
    },
  })

  const removeMutation = useMutation({
    mutationFn: (id: string) =>
      adminFetch(`/admin/compromised/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'compromised'] })
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
    },
  })

  if (list.isLoading) return <p className="admin-loading">Loading flagged wallets…</p>
  if (list.isError)
    return <p className="admin-error">Failed to load: {String(list.error)}</p>

  return (
    <div className="admin-section">
      <div className="admin-section-header">
        <h2 className="admin-section-title">Flagged Wallets</h2>
        <button
          className="admin-btn admin-btn--primary"
          onClick={() => setShowAdd(v => !v)}
        >
          {showAdd ? 'Cancel' : '+ Flag wallet'}
        </button>
      </div>
      <p className="admin-section-desc">
        Wallets on this list return <code>compromised: true</code> on every score
        request — no score is computed. Removing a wallet unfreezes it immediately.
      </p>

      {showAdd && (
        <form
          className="admin-form"
          onSubmit={e => { e.preventDefault(); addMutation.mutate() }}
        >
          <h3 className="admin-subsection-title">Flag a wallet</h3>
          <div className="admin-form-row">
            <label>Address</label>
            <input
              className="admin-input"
              placeholder="0x… or wallet address"
              value={form.address}
              onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              required
            />
          </div>
          <div className="admin-form-row">
            <label>Chain</label>
            <select
              className="admin-input"
              value={form.chain}
              onChange={e => setForm(f => ({ ...f, chain: e.target.value }))}
            >
              {CHAINS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="admin-form-row">
            <label>Reason</label>
            <input
              className="admin-input"
              placeholder="e.g. Linked to Lazarus Group"
              value={form.reason}
              onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
              required
            />
          </div>
          <button
            className="admin-btn admin-btn--primary"
            type="submit"
            disabled={addMutation.isPending}
          >
            {addMutation.isPending ? 'Flagging…' : 'Flag wallet'}
          </button>
          {addMutation.isError && (
            <p className="admin-error">{String(addMutation.error)}</p>
          )}
        </form>
      )}

      <table className="admin-table">
        <thead>
          <tr>
            <th>Address</th>
            <th>Chain family</th>
            <th>Reason</th>
            <th>Flagged</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {list.data!.map(w => (
            <React.Fragment key={w.id}>
              <tr>
                <td className="admin-td-mono">{w.address}</td>
                <td>{w.chain_family}</td>
                <td>{w.reason}</td>
                <td>{fmt(w.reported_at)}</td>
                <td>
                  <button
                    className="admin-btn admin-btn--danger"
                    disabled={removeMutation.isPending}
                    onClick={() => {
                      if (confirm(`Remove ${w.address} from the denylist?`))
                        removeMutation.mutate(w.id)
                    }}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            </React.Fragment>
          ))}
          {list.data!.length === 0 && (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-dim)' }}>
                No flagged wallets.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
