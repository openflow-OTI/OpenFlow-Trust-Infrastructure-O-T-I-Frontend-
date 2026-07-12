import ethereumSvg from '../assets/chain-icons/ethereum.svg?raw'
import bscSvg from '../assets/chain-icons/bsc.svg?raw'
import polygonSvg from '../assets/chain-icons/polygon.svg?raw'
import arbitrumSvg from '../assets/chain-icons/arbitrum.svg?raw'
import optimismSvg from '../assets/chain-icons/optimism.svg?raw'
import baseSvg from '../assets/chain-icons/base.svg?raw'
import avalancheSvg from '../assets/chain-icons/avalanche.svg?raw'
import sonicSvg from '../assets/chain-icons/sonic.svg?raw'
import lineaSvg from '../assets/chain-icons/linea.svg?raw'
import zksyncSvg from '../assets/chain-icons/zksync.svg?raw'
import tonSvg from '../assets/chain-icons/ton.svg?raw'
import solanaSvg from '../assets/chain-icons/solana.svg?raw'
import suiSvg from '../assets/chain-icons/sui.svg?raw'
import bitcoinSvg from '../assets/chain-icons/bitcoin.svg?raw'
import tronSvg from '../assets/chain-icons/tron.svg?raw'

// Icons vendored locally from @web3icons/core (MIT licensed) as static SVG
// markup instead of an npm dependency. The @web3icons/react package installs
// ~11,900 files (all chains/tokens/wallets/exchanges x variants), which
// reliably crashed Vercel's npm install with "Exit handler never called!" -
// a known npm bug triggered by extracting very large numbers of small files.
// We only ever used these 15 network icons, so vendoring just those SVGs
// removes the huge dependency entirely while keeping the same artwork.
// zkSync and Linea use the "mono" (white) variant, matching the previous
// branded/mono switch that kept them visible on the dark UI background.
const CHAIN_ICON_SVGS: Record<string, string> = {
  ethereum: ethereumSvg,
  bsc: bscSvg,
  polygon: polygonSvg,
  arbitrum: arbitrumSvg,
  optimism: optimismSvg,
  base: baseSvg,
  avalanche: avalancheSvg,
  sonic: sonicSvg,
  linea: lineaSvg,
  zksync: zksyncSvg,
  ton: tonSvg,
  solana: solanaSvg,
  sui: suiSvg,
  bitcoin: bitcoinSvg,
  tron: tronSvg,
}

interface ChainIconProps {
  chainId: string
  size?: number
  className?: string
}

export function ChainIcon({ chainId, size = 20, className }: ChainIconProps) {
  const svg = CHAIN_ICON_SVGS[chainId]

  if (!svg) {
    return (
      <span
        className={`chain-icon-fallback ${className ?? ''}`}
        style={{ width: size, height: size }}
        aria-hidden="true"
      />
    )
  }

  return (
    <span
      className={`chain-icon ${className ?? ''}`}
      style={{ width: size, height: size, display: 'inline-flex' }}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
