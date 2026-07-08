import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from '@/components/Logo'

export function MarketingNavbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="marketing-navbar">
      <div className="marketing-navbar-inner">
        <Link to="/" className="marketing-navbar-brand" onClick={() => setOpen(false)}>
          <Logo size={34} className="marketing-navbar-logo" />
          <span className="marketing-navbar-wordmark">OTI</span>
        </Link>

        <nav className="marketing-navbar-links marketing-navbar-links--desktop">
          <a href="#" className="marketing-navbar-link">API Docs</a>
          <Link to="/score" className="marketing-btn marketing-btn--outline marketing-btn--sm">
            Score a Wallet
          </Link>
        </nav>

        <button
          className="marketing-navbar-burger"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {open && (
        <nav className="marketing-navbar-links marketing-navbar-links--mobile">
          <a href="#" className="marketing-navbar-link" onClick={() => setOpen(false)}>
            API Docs
          </a>
          <Link
            to="/score"
            className="marketing-btn marketing-btn--outline marketing-btn--sm"
            onClick={() => setOpen(false)}
          >
            Score a Wallet
          </Link>
        </nav>
      )}
    </header>
  )
}
