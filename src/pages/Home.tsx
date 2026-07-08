import { useSearchParams } from 'react-router-dom'
import { WalletForm } from '@/components/WalletForm'
import { useScore } from '@/hooks/useScore'
import { useAnonymousLimit } from '@/hooks/useAnonymousLimit'
import { getChainInfo } from '@/lib/chains'
import { friendlyErrorMessage } from '@/lib/apiError'
import { formatMetadataLabel } from '@/lib/formatMetadata'
import { ScoreGauge } from '@/components/ScoreGauge'
import { SignalBar } from '@/components/SignalBar'
import { CompromisedBanner } from '@/components/CompromisedBanner'
import { CachedBadge } from '@/components/CachedBadge'
import { ErrorPanel } from '@/components/ErrorPanel'
import { LoadingPanel } from '@/components/LoadingPanel'
import { ShareButton } from '@/components/ShareButton'
import { ChainIcon } from '@/components/ChainIcon'
import { CopyButton } from '@/components/CopyButton'
import { generateScoreCard } from '@/lib/generateScoreCard'

function truncateAddress(addr: string): string {
  if (addr.length <= 13) return addr
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

function scoreTier(score: number): { label: string; color: string } {
  if (score >= 85) return { label: 'HIGHLY TRUSTED', color: 'var(--accent)' }
  if (score >= 65) return { label: 'TRUSTED',        color: '#4ade80' }
  if (score >= 45) return { label: 'CAUTION',        color: '#f59e0b' }
  if (score >= 25) return { label: 'SUSPICIOUS',     color: '#f97316' }
  return               { label: 'HIGH RISK',         color: 'var(--danger)' }
}

export function Home() {
  const [searchParams, setSearchParams] = useSearchParams()
  const wallet = searchParams.get('wallet') ?? ''
  const chain = searchParams.get('chain') ?? ''

  const hasQuery = Boolean(wallet && chain)
  const chainInfo = getChainInfo(chain)

  const scoreQuery = useScore(wallet, chain)
  // Bug 8 fix: only fire this query when the input form is actually visible.
  // While a score result is displayed (!hasQuery is false) the badge is hidden,
  // so a network request would just waste the freshness window.
  const limitQuery = useAnonymousLimit({ enabled: !hasQuery })

  function handleSearch(address: string, selectedChain: string) {
    setSearchParams({ wallet: address, chain: selectedChain })
  }

  function handleClear() {
    setSearchParams({})
  }

  if (!hasQuery) {
    return (
      <div className="home-page">
        {/* Faint spiral watermark — CSS only, opacity 0.04 */}
        <div className="home-watermark" aria-hidden="true" />

        <div className="home-intro">
          <div className="home-logo-wrap">
            <img
              src="/logo.svg"
              alt=""
              width={84}
              height={84}
              className="home-logo-spin"
              aria-hidden="true"
            />
          </div>
          <h1 className="home-title">OTI</h1>
          <p className="home-wordmark-sub">OpenFlow Trust Infrastructure</p>
          <p className="home-tagline">On-chain trust scoring for any wallet, any chain</p>
        </div>

        <div className="home-form-card-wrap">
          {/* Decorative-only ring layer, kept as a sibling (not an ancestor)
              of the actual card content: it needs its own overflow:hidden to
              clip its rotating square into a true circular ring, but the
              card's chain dropdown needs to pop out past the card's edges
              without being clipped. Keeping them as siblings means the
              dropdown never lives inside an overflow:hidden ancestor. */}
          <div className="home-form-card-ring" aria-hidden="true" />
          <div className="home-form-card">
            <WalletForm onSubmit={handleSearch} />
            <div className="home-example-wrap">
              <a
                href="#"
                className="home-example-link"
                onClick={(e) => {
                  e.preventDefault()
                  handleSearch('0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe', 'ethereum')
                }}
              >
                Try an example →
              </a>
            </div>
          </div>
        </div>

        <div className="home-rate-badge-wrap">
          <span className="home-rate-pill">
            {limitQuery.isSuccess
              ? limitQuery.data === null
                ? 'Unlimited free lookups / day'
                : `${limitQuery.data} free lookups / day`
              : 'Free · No login required'}
          </span>
        </div>

        <div className="home-wor-links">
          <a href="#" className="home-wor-link">🔒 Own this wallet? Register it</a>
          <a href="#" className="home-report-badge">
            <span className="home-report-badge-icon">⚑</span>
            <span>Report a compromised wallet</span>
          </a>
        </div>

        <footer className="home-footer">
          <a
            href="https://otiscore.vercel.app"
            className="home-footer-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            otiscore.vercel.app
          </a>
          {' · '}OTI Trust Score
        </footer>
      </div>
    )
  }

  return (
    <div className="results-page">
      <button className="results-back" onClick={handleClear}>
        &larr; Score Another Wallet
      </button>

      <div className="results-hero">
        <div
          className="results-hero-icon-wrap"
          style={{ '--chain-color': chainInfo?.color ?? 'var(--border)' } as React.CSSProperties}
        >
          <ChainIcon chainId={chain} size={44} />
        </div>
        <div className="results-hero-address-row">
          <p className="results-hero-address">{truncateAddress(wallet)}</p>
          <CopyButton value={wallet} className="results-copy-btn" />
        </div>
        {chainInfo && <span className="results-hero-chain">{chainInfo.label}</span>}
      </div>

      {scoreQuery.isLoading && <LoadingPanel label="Computing trust score…" />}

      {scoreQuery.isError &&
        (() => {
          const { title, message } = friendlyErrorMessage(scoreQuery.error)
          return <ErrorPanel title={title} message={message} />
        })()}

      {scoreQuery.isSuccess && scoreQuery.data && (
        <div className="results-body">
          {scoreQuery.data.compromised ? (
            <CompromisedBanner
              reason={scoreQuery.data.reason}
              reportedAt={scoreQuery.data.reported_at}
            />
          ) : (
            <>
              <div
                className="results-score-panel"
                style={{ '--chain-color': chainInfo?.color ?? 'var(--accent)' } as React.CSSProperties}
              >
                <ScoreGauge score={scoreQuery.data.score} ringColor={chainInfo?.color} />
                {(() => {
                  const tier = scoreTier(scoreQuery.data.score)
                  return (
                    <span className="results-tier-label" style={{ color: tier.color }}>
                      {tier.label}
                    </span>
                  )
                })()}
                {scoreQuery.data.cached && <CachedBadge />}
              </div>

              <div className="results-signals-panel">
                <h2 className="results-signals-heading">Trust Signals</h2>
                <div className="results-signals">
                  {Object.entries(scoreQuery.data.signals).map(([key, value]) => (
                    <SignalBar
                      key={key}
                      signalKey={key}
                      value={value as { score: number; weighted: number; maxWeight: number }}
                      metadataLabel={
                        scoreQuery.data &&
                        !scoreQuery.data.compromised &&
                        scoreQuery.data.metadata
                          ? formatMetadataLabel(key, scoreQuery.data.metadata)
                          : undefined
                      }
                    />
                  ))}
                </div>
                <a href="#" className="results-report-link">⚑ Report this wallet</a>
              </div>

              <div className="results-share-wrap">
                <ShareButton chain={chain} wallet={wallet} />
                <button
                  className="share-btn"
                  onClick={() => {
                    const d = scoreQuery.data
                    if (!d || d.compromised) return
                    generateScoreCard({
                      score: d.score,
                      signals: d.signals,
                      metadata: d.metadata,
                      chain,
                      wallet,
                    })
                  }}
                  aria-label="Save score card as image"
                >
                  <span className="share-btn-icon">⬇</span>
                  Save as Image
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <footer className="results-footer">
        © 2026{' '}
        <a href="https://otiscore.vercel.app" className="results-footer-link" target="_blank" rel="noopener noreferrer">
          OTI-Score
        </a>
      </footer>
    </div>
  )
}
