export type ChainFamily = 'evm' | 'ton' | 'solana' | 'sui' | 'bitcoin' | 'tron'

export interface ChainInfo {
  id: string
  label: string
  family: ChainFamily
  color: string
}

// Ordered by real-world popularity (market cap / usage / mindshare) rather
// than grouped by EVM vs non-EVM. Bitcoin first, Ethereum second, then the
// rest ranked by overall prominence. See FRONTEND_TASKS.md for the task
// that introduced this ordering and the reasoning behind it.
export const CHAINS: ChainInfo[] = [
  { id: 'bitcoin',   label: 'Bitcoin',          family: 'bitcoin', color: '#F7931A' },
  { id: 'ethereum',  label: 'Ethereum',        family: 'evm',     color: '#627EEA' },
  { id: 'solana',    label: 'Solana',           family: 'solana',  color: '#9945FF' },
  { id: 'bsc',       label: 'BNB Smart Chain',  family: 'evm',     color: '#F3BA2F' },
  { id: 'tron',      label: 'Tron',             family: 'tron',    color: '#FF060A' },
  { id: 'ton',       label: 'TON',              family: 'ton',     color: '#0098EA' },
  { id: 'avalanche', label: 'Avalanche',        family: 'evm',     color: '#E84142' },
  { id: 'polygon',   label: 'Polygon',          family: 'evm',     color: '#8247E5' },
  { id: 'arbitrum',  label: 'Arbitrum',         family: 'evm',     color: '#28A0F0' },
  { id: 'optimism',  label: 'Optimism',         family: 'evm',     color: '#FF0420' },
  { id: 'base',      label: 'Base',             family: 'evm',     color: '#0052FF' },
  { id: 'sui',       label: 'Sui',              family: 'sui',     color: '#4DA2FF' },
  { id: 'fantom',    label: 'Fantom',           family: 'evm',     color: '#1969FF' },
  { id: 'linea',     label: 'Linea',            family: 'evm',     color: '#61DFFF' },
  { id: 'zksync',    label: 'zkSync',           family: 'evm',     color: '#4E529A' },
]

export function getChainInfo(id: string): ChainInfo | undefined {
  return CHAINS.find((c) => c.id === id)
}

export function isKnownChain(id: string): boolean {
  return CHAINS.some((c) => c.id === id)
}
