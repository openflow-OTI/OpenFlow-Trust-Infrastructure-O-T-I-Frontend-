import { useState, useEffect, useCallback, Component, type ReactNode } from 'react'
import {
  getAdminSecret,
  setAdminSecret,
  clearAdminSecret,
  probeAdminSecret,
  registerUnauthorizedHandler,
} from '@/lib/adminClient'
import { Dashboard }          from './admin/Dashboard'
import { ApiKeys }            from './admin/ApiKeys'
import { Usage }              from './admin/Usage'
import { QueryHistory }       from './admin/QueryHistory'
import { AdminCache }         from './admin/AdminCache'
import { PlanConfigs }        from './admin/PlanConfigs'
import { CompromisedWallets } from './admin/CompromisedWallets'
import { ConfigSync }         from './admin/ConfigSync'
import { WOR, type WORSubView } from './admin/WOR'

class AdminErrorBoundary extends Component<
  { children: ReactNode; onReset: () => void },
  { error: string | null }
> {
  state = { error: null }

  static getDerivedStateFromError(e: Error) {
    return { error: e.message }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="admin-gate">
          <div className="admin-gate-logo" style={{ color: 'var(--danger)' }}>Admin Error</div>
          <p className="admin-gate-sub" style={{ color: 'var(--text-dim)', maxWidth: 480, textAlign: 'center' }}>
            {this.state.error}
          </p>
          <button
            className="admin-btn admin-btn--ghost"
            style={{ marginTop: '1.5rem' }}
            onClick={() => {
              this.setState({ error: null })
              this.props.onReset()
            }}
          >
            ← Back to login
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

type Screen = 'dashboard' | 'keys' | 'usage' | 'history' | 'cache' | 'plans' | 'flagged' | 'sync' | 'wor'

const SCREENS: { id: Screen; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Dashboard',       icon: '▦' },
  { id: 'keys',      label: 'API Keys',         icon: '⚿' },
  { id: 'usage',     label: 'Usage',            icon: '◈' },
  { id: 'history',   label: 'Query History',    icon: '◷' },
  { id: 'cache',     label: 'Cache',            icon: '⟳' },
  { id: 'plans',     label: 'Plan Configs',     icon: '◧' },
  { id: 'flagged',   label: 'Flagged Wallets',  icon: '⚑' },
  { id: 'sync',      label: 'Config Sync',      icon: '⟐' },
  { id: 'wor',       label: 'WOR',              icon: '◉' },
]

export function Admin() {
  const [unlocked, setUnlocked] = useState(false)
  const [input,    setInput]    = useState('')
  const [denied,   setDenied]   = useState(false)
  const [probing,  setProbing]  = useState(false)
  const [screen,      setScreen]      = useState<Screen>('dashboard')
  const [navOpen,     setNavOpen]     = useState(false)
  const [worSubView,  setWorSubView]  = useState<WORSubView>('registry')

  const lock = useCallback(() => {
    clearAdminSecret()
    setUnlocked(false)
    setInput('')
    setDenied(false)
  }, [])

  useEffect(() => { registerUnauthorizedHandler(lock) }, [lock])

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

  function navigate(id: Screen, worView?: WORSubView) {
    setScreen(id)
    if (worView) setWorSubView(worView)
    setNavOpen(false)
  }

  if (!unlocked) {
    return (
      <div className="admin-gate">
        <div className="admin-gate-logo">OTI Admin</div>
        <p className="admin-gate-sub">OpenFlow Trust Infrastructure</p>
        <form className="admin-gate-form" onSubmit={handleUnlock}>
          <input type="text" name="username" autoComplete="username"
            style={{ display: 'none' }} readOnly value="admin" />
          <div className="admin-gate-field">
            <label className="admin-gate-label">Admin Secret</label>
            <input
              className="admin-input"
              type="password"
              placeholder="Enter your admin secret…"
              autoComplete="current-password"
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={probing}
              autoFocus
            />
          </div>
          <button className="admin-btn admin-btn--primary admin-btn--lg"
            type="submit" disabled={probing}>
            {probing ? 'Verifying…' : 'Unlock panel'}
          </button>
          {denied && <p className="admin-error admin-gate-error">Wrong secret — access denied.</p>}
        </form>
      </div>
    )
  }

  const current = SCREENS.find(s => s.id === screen) ?? SCREENS[0]

  return (
    <AdminErrorBoundary onReset={lock}>
    <div className="admin-shell">

      {/* Mobile overlay */}
      {navOpen && <div className="admin-overlay" onClick={() => setNavOpen(false)} />}

      {/* Sidebar */}
      <aside className={`admin-sidebar${navOpen ? ' admin-sidebar--open' : ''}`}>
        <div className="admin-sidebar-brand">
          <span className="admin-sidebar-brand-name">OTI Admin</span>
          <span className="admin-sidebar-brand-sub">OpenFlow Trust Infrastructure</span>
        </div>

        <nav className="admin-sidebar-nav">
          {SCREENS.map(s => (
            <button
              key={s.id}
              className={`admin-nav-item${screen === s.id ? ' admin-nav-item--active' : ''}`}
              onClick={() => navigate(s.id)}
            >
              <span className="admin-nav-icon">{s.icon}</span>
              <span>{s.label}</span>
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <button className="admin-btn admin-btn--ghost admin-btn--lock" onClick={lock}>
            🔒 Lock panel
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="admin-main">

        {/* Mobile topbar */}
        <header className="admin-topbar">
          <button className="admin-hamburger" onClick={() => setNavOpen(v => !v)}
            aria-label="Toggle navigation">
            <span /><span /><span />
          </button>
          <span className="admin-topbar-title">{current.label}</span>
          <button className="admin-topbar-lock" onClick={lock} aria-label="Lock panel">🔒</button>
        </header>

        {/* Desktop page header */}
        <div className="admin-page-header">
          <div>
            <h1 className="admin-page-title">{current.label}</h1>
            <p className="admin-page-breadcrumb">OTI Admin / {current.label}</p>
          </div>
        </div>

        <div className="admin-content">
          {screen === 'dashboard' && <Dashboard onNavigateToWor={() => navigate('wor', 'compromised')} />}
          {screen === 'keys'      && <ApiKeys />}
          {screen === 'usage'     && <Usage />}
          {screen === 'history'   && <QueryHistory />}
          {screen === 'cache'     && <AdminCache />}
          {screen === 'plans'     && <PlanConfigs />}
          {screen === 'flagged'   && <CompromisedWallets />}
          {screen === 'sync'      && <ConfigSync />}
          {screen === 'wor'       && <WOR subView={worSubView} onSubViewChange={setWorSubView} />}
        </div>
      </div>
    </div>
    </AdminErrorBoundary>
  )
}
