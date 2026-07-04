const SIGNAL_LABELS: Record<string, string> = {
  walletAge: 'Wallet Age',
  transactionCount: 'Transaction Count',
  tokenHoldingBehavior: 'Token Holding Behavior',
  smartContractInteractions: 'Smart Contract Interactions',
  transactionTimingPatterns: 'Transaction Timing Patterns',
}

function signalColor(value: number): string {
  if (value >= 70) return 'var(--accent)'
  if (value >= 40) return 'var(--warning)'
  return 'var(--danger)'
}

interface SignalBarProps {
  signalKey: string
  value: number
  metadataLabel?: string
}

export function SignalBar({ signalKey, value, metadataLabel }: SignalBarProps) {
  const color = signalColor(value)
  return (
    <div className="signal-bar">
      <div className="signal-bar-header">
        <div className="signal-bar-label-group">
          <span className="signal-bar-label">{SIGNAL_LABELS[signalKey] ?? signalKey}</span>
          {metadataLabel && (
            <span className="signal-bar-meta">{metadataLabel}</span>
          )}
        </div>
        <span className="signal-bar-value" style={{ color }}>
          {value}
        </span>
      </div>
      <div className="signal-bar-track">
        <div
          className="signal-bar-fill"
          style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color }}
        />
      </div>
    </div>
  )
}
