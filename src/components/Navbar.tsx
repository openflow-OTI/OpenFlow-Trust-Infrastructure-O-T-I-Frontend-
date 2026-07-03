import { Link } from 'react-router-dom'
import { Logo } from './Logo'

export function Navbar() {
  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand">
        <Logo size={34} />
        <span className="navbar-title">
          <strong>OTI</strong>
          <span className="navbar-subtitle">OpenFlow Trust Infrastructure</span>
        </span>
      </Link>
    </header>
  )
}
