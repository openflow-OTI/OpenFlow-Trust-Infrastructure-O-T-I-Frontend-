import {
  NetworkEthereum,
  NetworkBinanceSmartChain,
  NetworkPolygon,
  NetworkArbitrumOne,
  NetworkOptimism,
  NetworkBase,
  NetworkAvalanche,
  NetworkFantom,
  NetworkLinea,
  NetworkZksync,
  NetworkTon,
  NetworkSolana,
  NetworkSui,
  NetworkBitcoin,
  NetworkTron,
} from '@web3icons/react'
import type { ComponentType } from 'react'
import type { IconComponentProps } from '@web3icons/react'

const CHAIN_ICON_MAP: Record<string, ComponentType<IconComponentProps>> = {
  ethereum: NetworkEthereum,
  bsc: NetworkBinanceSmartChain,
  polygon: NetworkPolygon,
  arbitrum: NetworkArbitrumOne,
  optimism: NetworkOptimism,
  base: NetworkBase,
  avalanche: NetworkAvalanche,
  fantom: NetworkFantom,
  linea: NetworkLinea,
  zksync: NetworkZksync,
  ton: NetworkTon,
  solana: NetworkSolana,
  sui: NetworkSui,
  bitcoin: NetworkBitcoin,
  tron: NetworkTron,
}

interface ChainIconProps {
  chainId: string
  size?: number
  className?: string
}

export function ChainIcon({ chainId, size = 20, className }: ChainIconProps) {
  const Icon = CHAIN_ICON_MAP[chainId]

  if (!Icon) {
    return (
      <span
        className={`chain-icon-fallback ${className ?? ''}`}
        style={{ width: size, height: size }}
        aria-hidden="true"
      />
    )
  }

  return <Icon variant="branded" size={size} className={className} />
}
