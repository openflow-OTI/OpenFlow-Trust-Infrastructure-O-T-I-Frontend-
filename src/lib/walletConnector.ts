/**
 * Multi-wallet connector — zero API keys, zero native dependencies.
 *
 * Strategy:
 *  1. EIP-6963  — auto-discovers every installed browser-extension wallet
 *                 (MetaMask, Rainbow, Coinbase ext, Brave, Trust ext, etc.)
 *  2. Mobile deep-links — opens the current page inside a wallet's built-in
 *                         browser when no extension is present on mobile
 *
 * No WalletConnect project ID and no Coinbase Wallet SDK needed.
 * Coinbase Wallet extension is detected automatically via EIP-6963.
 * On mobile, Coinbase Wallet (and others) are reached via deep-link.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WalletProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
}

export interface DiscoveredWallet {
  id: string
  name: string
  icon: string          // data-URI SVG/PNG supplied by the wallet itself
  provider: WalletProvider
  kind: 'eip6963' | 'deeplink'
  href?: string         // only for deep-link entries
}

// ---------------------------------------------------------------------------
// EIP-6963 — discovers every installed wallet extension automatically
// ---------------------------------------------------------------------------

export async function discoverEIP6963Wallets(): Promise<DiscoveredWallet[]> {
  const found: DiscoveredWallet[] = []
  const seen = new Set<string>()

  const handler = (event: Event) => {
    const e = event as CustomEvent<{
      info: { uuid: string; name: string; icon: string; rdns: string }
      provider: WalletProvider
    }>
    const { info, provider } = e.detail
    if (!seen.has(info.uuid)) {
      seen.add(info.uuid)
      found.push({ id: info.uuid, name: info.name, icon: info.icon, provider, kind: 'eip6963' })
    }
  }

  window.addEventListener('eip6963:announceProvider', handler as EventListener)
  window.dispatchEvent(new Event('eip6963:requestProvider'))
  await new Promise(resolve => setTimeout(resolve, 200))
  window.removeEventListener('eip6963:announceProvider', handler as EventListener)

  return found
}

// ---------------------------------------------------------------------------
// Mobile deep-links — open dapp inside a wallet's built-in browser
// No SDK or API key required.
// ---------------------------------------------------------------------------

export function isMobile(): boolean {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
}

// Placeholder icon for wallets without a logo in the deep-link list
function letterIcon(letter: string, bg: string): string {
  const svg = `<svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="50" fill="${bg}"/><text x="50" y="56" text-anchor="middle" fill="white" font-size="44" font-family="sans-serif" font-weight="bold">${letter}</text></svg>`
  return `data:image/svg+xml;base64,${btoa(svg)}`
}

export function getMobileDeepLinks(): DiscoveredWallet[] {
  const raw = window.location.href
  const host = window.location.hostname + window.location.pathname + window.location.search
  const enc = encodeURIComponent(raw)

  return [
    {
      id: 'dl-metamask',
      name: 'MetaMask',
      icon: letterIcon('M', '#F6851B'),
      provider: null as unknown as WalletProvider,
      kind: 'deeplink',
      href: `https://metamask.app.link/dapp/${host}`,
    },
    {
      id: 'dl-coinbase',
      name: 'Coinbase Wallet',
      icon: letterIcon('C', '#0052FF'),
      provider: null as unknown as WalletProvider,
      kind: 'deeplink',
      href: `https://go.cb-wallet.io/wsegue?uri=ethereum-${enc}`,
    },
    {
      id: 'dl-rainbow',
      name: 'Rainbow',
      icon: letterIcon('R', '#774EF0'),
      provider: null as unknown as WalletProvider,
      kind: 'deeplink',
      href: `https://rnbwapp.com/dapp?url=${enc}`,
    },
    {
      id: 'dl-trust',
      name: 'Trust Wallet',
      icon: letterIcon('T', '#3375BB'),
      provider: null as unknown as WalletProvider,
      kind: 'deeplink',
      href: `https://link.trustwallet.com/open_url?coin_id=60&url=${enc}`,
    },
  ]
}

// ---------------------------------------------------------------------------
// Sign a message with any EIP-1193 provider
// ---------------------------------------------------------------------------

export async function signWithProvider(
  provider: WalletProvider,
  message: string
): Promise<{ signature: string; address: string }> {
  const accounts = (await provider.request({ method: 'eth_requestAccounts' })) as string[]
  if (!accounts?.length) throw new Error('No accounts returned from wallet.')
  const address = accounts[0]
  const signature = (await provider.request({
    method: 'personal_sign',
    params: [message, address],
  })) as string
  return { signature, address }
}
