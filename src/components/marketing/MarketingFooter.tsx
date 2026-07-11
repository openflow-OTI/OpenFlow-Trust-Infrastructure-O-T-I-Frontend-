import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaXTwitter, FaTelegram, FaDiscord } from 'react-icons/fa6'
import { Logo } from '@/components/Logo'
import { FeedbackModal } from './FeedbackModal'
import { useComingSoon } from '@/components/ComingSoon'

const FRONTEND_REPO_URL =
  'https://github.com/openflow-OTI/OpenFlow-Trust-Infrastructure-O-T-I-Frontend-'

export function MarketingFooter() {
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const showComingSoon = useComingSoon()

  return (
    <footer className="marketing-footer">
      <div className="marketing-container marketing-footer-inner">
        <div className="marketing-footer-brand">
          <Logo size={22} />
          <span>© OTI</span>
        </div>

        <nav className="marketing-footer-links">
          <Link to="/score" className="marketing-footer-link">Score a Wallet</Link>
          <a href="/docs/" className="marketing-footer-link">API Docs</a>
          <a href={FRONTEND_REPO_URL} target="_blank" rel="noopener noreferrer" className="marketing-footer-link">
            GitHub
          </a>
          <a
            href="#"
            className="marketing-footer-link"
            onClick={(e) => {
              e.preventDefault()
              showComingSoon('Privacy Policy')
            }}
          >
            Privacy Policy
          </a>
          <a
            href="#"
            className="marketing-footer-link"
            onClick={(e) => {
              e.preventDefault()
              showComingSoon('Terms')
            }}
          >
            Terms
          </a>
          <button type="button" className="marketing-footer-link marketing-footer-link--btn" onClick={() => setFeedbackOpen(true)}>
            Send Feedback
          </button>
        </nav>

        <div className="marketing-footer-social">
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
      </div>

      <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
    </footer>
  )
}
