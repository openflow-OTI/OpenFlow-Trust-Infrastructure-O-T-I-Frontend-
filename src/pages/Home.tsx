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
  const limitQuery = useAnonymousLimit()

  function handleSearch(address: string, selectedChain: string) {
    setSearchParams({ wallet: address, chain: selectedChain })
  }

  function handleClear() {
    setSearchParams({})
  }

  if (!hasQuery) {
    return (
      <div className="home-page">
        <div className="home-intro">
          <h1 className="home-title">Is This Wallet Safe to Trust?</h1>
          <p className="home-subtitle">
            Paste a wallet address, pick a chain, get a 0–100 trust score backed by five
            on-chain signals. Free, no login required.
          </p>
        </div>
        <div className="home-form-card">
          <WalletForm onSubmit={handleSearch} />
        </div>
        <p className="home-rate-note">
          {limitQuery.isSuccess
            ? `Anonymous lookups are limited to ${limitQuery.data} per day. Choose your wallet carefully.`
            : 'Anonymous lookups are limited per day. Choose your wallet carefully.'}
        </p>
      </div>
    )
  }

  return (
    <div className="results-page">
      <button className="results-back" onClick={handleClear}>
        &larr; Score Another Wallet
      </button>

      <div className="results-hero">
        <div className="results-hero-icon-wrap">
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
              <div className="results-score-panel">
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
