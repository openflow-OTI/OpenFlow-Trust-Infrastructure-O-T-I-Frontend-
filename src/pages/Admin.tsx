import { useState, useEffect, useCallback } from 'react'
import {
  getAdminSecret,
  setAdminSecret,
  clearAdminSecret,
  probeAdminSecret,
  registerUnauthorizedHandler,
} from '@/lib/adminClient'
import { Dashboard } from './admin/Dashboard'
import { ApiKeys } from './admin/ApiKeys'
import { QueryHistory } from './admin/QueryHistory'
import { AdminCache } from './admin/AdminCache'
import { PlanConfigs } from './admin/PlanConfigs'

type Screen = 'dashboard' | 'keys' | 'history' | 'cache' | 'plans'

const SCREENS: { id: Screen; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'keys',      label: 'API Keys' },
  { id: 'history',   label: 'Query History' },
  { id: 'cache',     label: 'Cache' },
  { id: 'plans',     label: 'Plan Configs' },
]

export function Admin() {
  const [unlocked, setUnlocked] = useState(false)
  const [input, setInput] = useState('')
  const [denied, setDenied] = useState(false)
  const [probing, setProbing] = useState(false)
  const [screen, setScreen] = useState<Screen>('dashboard')

  const lock = useCallback(() => {
    clearAdminSecret()
    setUnlocked(false)
    setInput('')
    setDenied(false)
  }, [])

  // Register auto-lock handler for any 401 returned during a session
  useEffect(() => {
    registerUnauthorizedHandler(lock)
  }, [lock])

  // If a secret is already in sessionStorage, probe it — don't trust it blindly
  useEffect(() => {
    const stored = getAdminSecret()
    if (!stored) return
    setProbing(true)
    probeAdminSecret(stored).then(ok => {
      if (ok) setUnlocked(true)
      else clearAdminSecret()
      setProbing(false)
    })
  }, [])

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim()) return
    setProbing(true)
    setDenied(false)
    const ok = await probeAdminSecret(input.trim())
    if (ok) {
      setAdminSecret(input.trim())
      setUnlocked(true)
    } else {
      setDenied(true)
      setInput('')
    }
    setProbing(false)
  }

  if (!unlocked) {
    return (
      <div className="admin-gate">
        <h1 className="admin-gate-title">Admin Panel</h1>
        <form className="admin-gate-form" onSubmit={handleUnlock}>
          <input type="text" name="username" autoComplete="username" style={{ display: 'none' }} readOnly value="admin" />
          <input
            className="admin-input"
            type="password"
            placeholder="Enter admin secret"
            autoComplete="current-password"
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={probing}
            autoFocus
          />
          <button className="admin-btn admin-btn--primary" type="submit" disabled={probing}>
            {probing ? 'Checking…' : 'Unlock'}
          </button>
          {denied && <p className="admin-error">Access denied — wrong secret.</p>}
        </form>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <span className="admin-header-title">OTI Admin</span>
        <button className="admin-btn admin-btn--ghost" onClick={lock}>
          Lock
        </button>
      </div>

      <nav className="admin-nav">
        {SCREENS.map(s => (
          <button
            key={s.id}
            className={`admin-nav-btn${screen === s.id ? ' admin-nav-btn--active' : ''}`}
            onClick={() => setScreen(s.id)}
          >
            {s.label}
          </button>
        ))}
      </nav>

      <div className="admin-body">
        {screen === 'dashboard' && <Dashboard />}
        {screen === 'keys'      && <ApiKeys />}
        {screen === 'history'   && <QueryHistory />}
        {screen === 'cache'     && <AdminCache />}
        {screen === 'plans'     && <PlanConfigs />}
      </div>
    </div>
  )
}
