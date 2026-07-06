import type { ScoreMetadata } from './types'

export function formatMetadataLabel(signalKey: string, metadata: ScoreMetadata): string {
  const n = (v: number) => v.toLocaleString()
  switch (signalKey) {
    case 'walletAge':
      return `${n(metadata.walletAgedays)} days`
    case 'transactionCount':
      return metadata.txCount >= 1000
        ? '1,000+ transactions'
        : `${n(metadata.txCount)} transactions`
    case 'tokenHoldingBehavior':
      return `${n(metadata.uniqueTokens)} unique tokens`
    case 'smartContractInteractions':
      return `${n(metadata.contractInteractions)} smart-contract transactions`
    case 'transactionTimingPatterns':
      return `${n(metadata.internalTxCount)} internal transactions`
    default:
      return ''
  }
}
