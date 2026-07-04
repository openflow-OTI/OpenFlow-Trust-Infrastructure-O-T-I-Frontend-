import { Link, useParams } from 'react-router-dom'
import { useScore } from '@/hooks/useScore'
import { useScoreHistory } from '@/hooks/useScoreHistory'
import { getChainInfo } from '@/lib/chains'
import { friendlyErrorMessage } from '@/lib/apiError'
import type { ScoreMetadata } from '@/lib/types'
import { ScoreGauge } from '@/components/ScoreGauge'
import { SignalBar } from '@/components/SignalBar'
import { CompromisedBanner } from '@/components/CompromisedBanner'
import { CachedBadge } from '@/components/CachedBadge'
import { HistorySection } from '@/components/HistorySection'
import { ErrorPanel } from '@/components/ErrorPanel'
import { LoadingPanel } from '@/components/LoadingPanel'

function formatMetadataLabel(signalKey: string, metadata: ScoreMetadata): string {
  const n = (v: number) => v.toLocaleString()
  switch (signalKey) {
    case 'walletAge':
      return `${n(metadata.walletAgedays)} days`
    case 'transactionCount':
      return `${n(metadata.txCount)} transactions`
    case 'tokenHoldingBehavior':
      return `${n(metadata.uniqueTokens)} unique tokens`
    case 'smartContractInteractions':
      return metadata.contractInteractions > 0
        ? `interacted with contracts`
        : 'no contract interactions'
    case 'transactionTimingPatterns':
      return `${n(metadata.internalTxCount)} internal txs`
    default:
      return ''
  }
}

export function Results() {
  const { address = '', chain = '' } = useParams<{ address: string; chain: string }>()
  const chainInfo = getChainInfo(chain)

  const scoreQuery = useScore(address, chain)
  const isCompromised = scoreQuery.data?.compromised === true
  const historyQuery = useScoreHistory(address, chain, scoreQuery.isSuccess && !isCompromised)

  return (
    <div className="results-page">
      <div className="results-header">
        <Link to="/" className="results-back">
          &larr; Score another wallet
        </Link>
        <div className="results-target">
          <span className="results-address">{address}</span>
          <span className="results-chain">{chainInfo?.label ?? chain}</span>
        </div>
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
              <div className="results-score-card">
                <ScoreGauge score={scoreQuery.data.score} />
                {scoreQuery.data.cached && <CachedBadge />}
              </div>

              <div className="results-signals">
                {Object.entries(scoreQuery.data.signals).map(([key, value]) => (
                  <SignalBar
                    key={key}
                    signalKey={key}
                    value={value as number}
                    metadataLabel={
                      scoreQuery.data && !scoreQuery.data.compromised && scoreQuery.data.metadata
                        ? formatMetadataLabel(key, scoreQuery.data.metadata)
                        : undefined
                    }
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {!isCompromised && scoreQuery.isSuccess && (
        <section className="history-section">
          <h2 className="history-title">Score history</h2>

          {historyQuery.isLoading && <LoadingPanel label="Loading history…" />}

          {historyQuery.isError &&
            (() => {
              const { title, message } = friendlyErrorMessage(historyQuery.error)
              return <ErrorPanel title={title} message={message} tone="warning" />
            })()}

          {historyQuery.isSuccess && historyQuery.data && (
            <HistorySection history={historyQuery.data.history} />
          )}
        </section>
      )}
    </div>
  )
}
