import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Send, MessageCircle } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { FeedbackModal } from './FeedbackModal'

const FRONTEND_REPO_URL =
  'https://github.com/openflow-OTI/OpenFlow-Trust-Infrastructure-O-T-I-Frontend-'

export function MarketingFooter() {
  const [feedbackOpen, setFeedbackOpen] = useState(false)

  return (
    <footer className="marketing-footer">
      <div className="marketing-container marketing-footer-inner">
        <div className="marketing-footer-brand">
          <Logo size={22} />
          <span>© 2026 OTI</span>
        </div>

        <nav className="marketing-footer-links">
          <Link to="/score" className="marketing-footer-link">Score a Wallet</Link>
          <a href="#" className="marketing-footer-link">API Docs</a>
          <a href={FRONTEND_REPO_URL} target="_blank" rel="noopener noreferrer" className="marketing-footer-link">
            GitHub
          </a>
          <a href="#" className="marketing-footer-link">Privacy Policy</a>
          <a href="#" className="marketing-footer-link">Terms</a>
          <button type="button" className="marketing-footer-link marketing-footer-link--btn" onClick={() => setFeedbackOpen(true)}>
            Send Feedback
          </button>
        </nav>

        <div className="marketing-footer-social">
          <a href="#" aria-label="Twitter / X" className="marketing-social-icon marketing-social-icon--glyph">𝕏</a>
          <a href="#" aria-label="LinkedIn" className="marketing-social-icon marketing-social-icon--glyph">in</a>
          <a href="#" aria-label="Telegram" className="marketing-social-icon"><Send aria-hidden="true" /></a>
          <a href="#" aria-label="Discord" className="marketing-social-icon"><MessageCircle aria-hidden="true" /></a>
        </div>
      </div>

      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </footer>
  )
}
