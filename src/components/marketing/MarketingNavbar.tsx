import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaXTwitter, FaTelegram, FaDiscord } from 'react-icons/fa6'
import { Logo } from '@/components/Logo'
import { useComingSoon } from '@/components/ComingSoon'

export function MarketingNavbar() {
  const [open, setOpen] = useState(false)
  const showComingSoon = useComingSoon()

  const socials = (
    <div className="marketing-navbar-social">
      <a
        href="#"
        aria-label="Twitter / X"
        className="marketing-social-icon"
        onClick={(e) => {
          e.preventDefault()
          showComingSoon('Twitter / X')
        }}
      >
        <FaXTwitter aria-hidden="true" />
      </a>
      <a
        href="#"
        aria-label="Telegram"
        className="marketing-social-icon"
        onClick={(e) => {
          e.preventDefault()
          showComingSoon('Telegram')
        }}
      >
        <FaTelegram aria-hidden="true" />
      </a>
      <a
        href="#"
        aria-label="Discord"
        className="marketing-social-icon"
        onClick={(e) => {
          e.preventDefault()
          showComingSoon('Discord')
        }}
      >
        <FaDiscord aria-hidden="true" />
      </a>
    </div>
  )

  return (
    <header className="marketing-navbar">
      <div className="marketing-navbar-inner">
        <Link to="/" className="marketing-navbar-brand" onClick={() => setOpen(false)}>
          <Logo size={34} className="marketing-navbar-logo" />
          <span className="marketing-navbar-wordmark">OTI</span>
        </Link>

        <nav className="marketing-navbar-links marketing-navbar-links--desktop">
          <Link to="/score" className="marketing-btn marketing-btn--outline marketing-btn--sm">
            Score a Wallet
          </Link>
          <Link to="/register" className="marketing-btn marketing-btn--primary marketing-btn--sm">
            Register Wallet
          </Link>
          <a href="/docs/" className="marketing-navbar-link">API Docs</a>
          <Link to="/whitepaper" className="marketing-navbar-link">Whitepaper</Link>
          {socials}
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
          <Link
            to="/score"
            className="marketing-btn marketing-btn--outline marketing-btn--sm"
            onClick={() => setOpen(false)}
          >
            Score a Wallet
          </Link>
          <Link
            to="/register"
            className="marketing-btn marketing-btn--primary marketing-btn--sm"
            onClick={() => setOpen(false)}
          >
            Register Wallet
          </Link>
          <a href="/docs/" className="marketing-navbar-link" onClick={() => setOpen(false)}>
            API Docs
          </a>
          <Link to="/whitepaper" className="marketing-navbar-link" onClick={() => setOpen(false)}>
            Whitepaper
          </Link>
          {socials}
        </nav>
      )}
    </header>
  )
}
