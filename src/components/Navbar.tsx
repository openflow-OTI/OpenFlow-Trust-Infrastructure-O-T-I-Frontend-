import { Link } from 'react-router-dom'
import { Logo } from './Logo'

export function Navbar() {
  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand">
        <div className="navbar-top-row">
          <Logo size={44} />
          <strong className="navbar-title">OTI</strong>
        </div>
        <span className="navbar-subtitle">OpenFlow Trust Infrastructure</span>
      </Link>
    </header>
  )
}
