import { Link } from 'react-router-dom'
import { MarketingNavbar } from '@/components/marketing/MarketingNavbar'
import { MarketingFooter } from '@/components/marketing/MarketingFooter'
import { ChainIcon } from '@/components/ChainIcon'
import { CopyButton } from '@/components/CopyButton'
import { CHAINS } from '@/lib/chains'

const HERO_CHAIN_IDS = ['ethereum', 'solana', 'bitcoin', 'ton', 'polygon', 'arbitrum', 'sui', 'tron']
const MORE_CHAINS_COUNT = CHAINS.length - HERO_CHAIN_IDS.length

const HOW_IT_WORKS = [
  {
    step: 1,
    title: 'Enter wallet address + select chain',
    body: 'Paste any wallet address and pick from 15 supported chains — EVM and non-EVM alike.',
  },
  {
    step: 2,
    title: 'OTI analyzes 5 on-chain behavioral signals',
    body: 'Wallet age, transaction history, token holdings, contract interactions, and timing patterns — pulled straight from the chain.',
  },
  {
    step: 3,
    title: 'Get a 0–100 trust score with full signal breakdown',
    body: 'A single trust score plus the weighted breakdown behind it, ready to act on or pipe into your own systems.',
  },
]

const TRUST_SIGNALS = [
  { icon: '🕐', label: 'Wallet Age', weight: '25%', body: 'How long this wallet has been active on-chain' },
  { icon: '📊', label: 'Transaction Count', weight: '20%', body: 'Volume and frequency of transactions' },
  { icon: '🪙', label: 'Token Holding Behavior', weight: '20%', body: 'Diversity and quality of tokens held' },
  { icon: '🔗', label: 'Smart Contract Interactions', weight: '20%', body: 'Depth of DeFi and protocol engagement' },
  { icon: '⏱', label: 'Transaction Timing', weight: '15%', body: 'Consistency and naturalness of activity patterns' },
]

const USE_CASES = [
  { icon: '💱', label: 'Exchanges & Gateways', body: 'Flag compromised wallets before processing withdrawals.' },
  { icon: '🏦', label: 'DeFi Protocols', body: 'Risk-adjust lending and collateral requirements based on wallet trust.' },
  { icon: '🖼', label: 'NFT Marketplaces', body: 'Display trust badges next to seller listings.' },
  { icon: '💸', label: 'Payment Processors', body: 'Require a minimum trust score before processing.' },
  { icon: '🎮', label: 'Web3 Gaming', body: 'Prevent fresh-wallet farming in Play-to-Earn.' },
  { icon: '🗳', label: 'DAO Governance', body: 'Weight votes by wallet trust alongside token balance.' },
  { icon: '🔐', label: 'Custody Services', body: 'Score source wallets before crediting accounts.' },
  { icon: '📡', label: 'Bridges & Cross-chain', body: 'Score the source wallet before allowing a bridge transaction.' },
  { icon: '🛠', label: 'Developer Tooling', body: 'One API call. Any chain. No blockchain infrastructure required.' },
]

const FIND_US = [
  { icon: '✈', label: 'Telegram' },
  { icon: '◈', label: 'Discord' },
  { icon: '🌐', label: 'Chrome Extension' },
  { icon: '🦊', label: 'Firefox Extension' },
]

const CURL_EXAMPLE = `curl https://otiscore.vercel.app/api/score \\
  -H "Content-Type: application/json" \\
  -d '{"wallet":"0xde0B...7BAe","chain":"ethereum"}'`

export function Landing() {
  return (
    <div className="marketing-page">
      <MarketingNavbar />

      {/* ─── Hero ─── */}
      <section className="marketing-hero">
        <div className="marketing-hero-watermark" aria-hidden="true" />
        <div className="marketing-container marketing-hero-inner">
          <h1 className="marketing-hero-headline">Know Who You're Transacting With</h1>
          <p className="marketing-hero-sub">
            OTI scores any blockchain wallet 0–100 using five on-chain trust signals. Instant. Free. API-ready.
          </p>
          <div className="marketing-hero-ctas">
            <Link to="/score" className="marketing-btn marketing-btn--primary marketing-btn--lg">
              Try It Free
            </Link>
            <a href="#" className="marketing-btn marketing-btn--ghost marketing-btn--lg">
              View API Docs
            </a>
          </div>
          <div className="marketing-hero-chains">
            {HERO_CHAIN_IDS.map((id) => (
              <div key={id} className="marketing-hero-chain-icon" title={id}>
                <ChainIcon chainId={id} size={22} />
              </div>
            ))}
            <span className="marketing-hero-chain-more">+{MORE_CHAINS_COUNT} more</span>
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="marketing-section">
        <div className="marketing-container">
          <h2 className="marketing-section-heading">How It Works</h2>
          <div className="marketing-steps">
            {HOW_IT_WORKS.map((s) => (
              <div key={s.step} className="marketing-step-card">
                <span className="marketing-step-number">{s.step}</span>
                <h3 className="marketing-step-title">{s.title}</h3>
                <p className="marketing-step-body">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Trust Signals ─── */}
      <section className="marketing-section marketing-section--alt">
        <div className="marketing-container">
          <h2 className="marketing-section-heading">Five Signals, One Score</h2>
          <div className="marketing-signal-grid">
            {TRUST_SIGNALS.map((s) => (
              <div key={s.label} className="marketing-signal-card">
                <span className="marketing-signal-icon" aria-hidden="true">{s.icon}</span>
                <h3 className="marketing-signal-title">{s.label}</h3>
                <span className="marketing-signal-weight">{s.weight}</span>
                <p className="marketing-signal-body">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Use Cases ─── */}
      <section className="marketing-section">
        <div className="marketing-container">
          <h2 className="marketing-section-heading">Built For</h2>
          <div className="marketing-usecase-grid">
            {USE_CASES.map((u) => (
              <div key={u.label} className="marketing-usecase-tile">
                <span className="marketing-usecase-icon" aria-hidden="true">{u.icon}</span>
                <h3 className="marketing-usecase-title">{u.label}</h3>
                <p className="marketing-usecase-body">{u.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Get the API ─── */}
      <section className="marketing-section marketing-section--alt">
        <div className="marketing-container marketing-api-inner">
          <h2 className="marketing-section-heading">Free API Key. No Credit Card.</h2>
          <p className="marketing-api-sub">
            Anonymous: 3 lookups/day. Register free for higher limits.
          </p>
          <div className="marketing-code-block">
            <pre><code>{CURL_EXAMPLE}</code></pre>
            <CopyButton value={CURL_EXAMPLE} className="marketing-code-copy-btn" />
          </div>
          <a href="#" className="marketing-btn marketing-btn--primary">
            Read the Docs
          </a>
        </div>
      </section>

      {/* ─── Find Us ─── */}
      <section className="marketing-section">
        <div className="marketing-container">
          <h2 className="marketing-section-heading">Find Us</h2>
          <div className="marketing-findus-row">
            {FIND_US.map((f) => (
              <a href="#" key={f.label} className="marketing-findus-item">
                <span className="marketing-findus-icon" aria-hidden="true">{f.icon}</span>
                <span>{f.label}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
