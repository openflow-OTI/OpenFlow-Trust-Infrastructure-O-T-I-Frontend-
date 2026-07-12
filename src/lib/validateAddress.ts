import { getChainInfo } from './chains'

const PATTERNS: Record<string, RegExp> = {
  evm: /^0x[0-9a-fA-F]{40}$/,
  ton: /^(EQ|UQ)[A-Za-z0-9+/=_-]{46}$/,
  solana: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
  sui: /^0x[0-9a-fA-F]{64}$/,
  bitcoin: /^(1[a-km-zA-HJ-NP-Z1-9]{25,34}|3[a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[ac-hj-np-z02-9]{25,90})$/,
  tron: /^T[1-9A-HJ-NP-Za-km-z]{33}$/,
}

const FORMAT_HINTS: Record<string, string> = {
  evm: '0x followed by 40 hex characters',
  ton: 'starts with EQ or UQ, 48 characters total',
  solana: 'base58 string, 32-44 characters',
  sui: '0x followed by 64 hex characters',
  bitcoin: 'legacy (1...), script (3...), or bech32 (bc1...) format',
  tron: 'starts with T, 34 base58 characters',
}

export function validateAddress(address: string, chainId: string): string | null {
  const trimmed = address.trim()

  if (!trimmed) {
    return 'Enter a wallet address'
  }

  const chain = getChainInfo(chainId)
  if (!chain) {
    return 'Select a supported chain'
  }

  const pattern = PATTERNS[chain.family]
  if (pattern && !pattern.test(trimmed)) {
    return `Doesn't look like a valid ${chain.label} address (${FORMAT_HINTS[chain.family]})`
  }

  return null
}
