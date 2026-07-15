/**
 * Multi-wallet connector — zero API keys, zero native dependencies.
 *
 * EIP-6963 auto-discovers every installed browser-extension wallet.
 * Mobile deep-links open the dapp inside a wallet's built-in browser.
 */

export interface WalletProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
}

export interface DiscoveredWallet {
  id: string
  name: string
  icon: string
  provider: WalletProvider
  kind: 'eip6963' | 'deeplink'
  href?: string
}

// ── EIP-6963 discovery ────────────────────────────────────────────────────

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
  await new Promise(resolve => setTimeout(resolve, 220))
  window.removeEventListener('eip6963:announceProvider', handler as EventListener)
  return found
}

// ── Branded deep-link icons (SVG data-URIs) ───────────────────────────────

const METAMASK_ICON = `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="10" fill="#1A1A2E"/><polygon points="32,8 22,14 24,10" fill="#E2761B" stroke="#E2761B" stroke-width="0.3"/><polygon points="8,8 17.8,14.1 16,10" fill="#E4761B" stroke="#E4761B" stroke-width="0.3"/><polygon points="28.2,27 25.5,31.2 31.4,32.9 33.2,27.1" fill="#E4761B" stroke="#E4761B" stroke-width="0.3"/><polygon points="6.8,27.1 8.6,32.9 14.5,31.2 11.8,27" fill="#E4761B" stroke="#E4761B" stroke-width="0.3"/><polygon points="14.2,18.8 12.5,21.4 18.3,21.7 18.1,15.5" fill="#E4761B" stroke="#E4761B" stroke-width="0.3"/><polygon points="25.8,18.8 21.8,15.4 21.7,21.7 27.5,21.4" fill="#E4761B" stroke="#E4761B" stroke-width="0.3"/><polygon points="14.5,31.2 17.9,29.4 14.9,27.1" fill="#E4761B" stroke="#E4761B" stroke-width="0.3"/><polygon points="22.1,29.4 25.5,31.2 25.1,27.1" fill="#E4761B" stroke="#E4761B" stroke-width="0.3"/></svg>`)}`

const COINBASE_ICON = `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="10" fill="#0052FF"/><circle cx="20" cy="20" r="11" fill="white"/><rect x="15.5" y="17.5" width="9" height="5" rx="2.5" fill="#0052FF"/></svg>`)}`

const RAINBOW_ICON = `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="10" fill="#1A1A2E"/><path d="M6 26 Q6 14 20 14 Q34 14 34 26" stroke="#FF6B6B" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M9 26 Q9 17 20 17 Q31 17 31 26" stroke="#FF9F43" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M12 26 Q12 20 20 20 Q28 20 28 26" stroke="#F9CA24" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M15 26 Q15 23 20 23 Q25 23 25 26" stroke="#6AB04C" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M18 26 Q18 25 20 25 Q22 25 22 26" stroke="#4834D4" stroke-width="3.5" fill="none" stroke-linecap="round"/></svg>`)}`

const TRUST_ICON = `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="10" fill="#3375BB"/><path d="M20 8 L30 12 L30 20 C30 25.5 25.5 30.5 20 32 C14.5 30.5 10 25.5 10 20 L10 12 Z" fill="white" opacity="0.9"/><path d="M15 20 L18.5 23.5 L25 16.5" stroke="#3375BB" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`)}`

const PHANTOM_ICON = `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="10" fill="#551BF9"/><ellipse cx="20" cy="18" rx="10" ry="9" fill="white"/><ellipse cx="16" cy="17" rx="2.5" ry="3" fill="#551BF9"/><ellipse cx="24" cy="17" rx="2.5" ry="3" fill="#551BF9"/><path d="M12 22 Q12 30 20 30 Q26 30 28 25" stroke="white" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`)}`

export function getMobileDeepLinks(): DiscoveredWallet[] {
  const raw = window.location.href
  const host = window.location.hostname + window.location.pathname + window.location.search
  const enc = encodeURIComponent(raw)

  return [
    { id: 'dl-metamask',  name: 'MetaMask',        icon: METAMASK_ICON,  provider: null as unknown as WalletProvider, kind: 'deeplink', href: `https://metamask.app.link/dapp/${host}` },
    { id: 'dl-coinbase',  name: 'Coinbase Wallet',  icon: COINBASE_ICON,  provider: null as unknown as WalletProvider, kind: 'deeplink', href: `https://go.cb-wallet.io/wsegue?uri=ethereum-${enc}` },
    { id: 'dl-rainbow',   name: 'Rainbow',          icon: RAINBOW_ICON,   provider: null as unknown as WalletProvider, kind: 'deeplink', href: `https://rnbwapp.com/dapp?url=${enc}` },
    { id: 'dl-trust',     name: 'Trust Wallet',     icon: TRUST_ICON,     provider: null as unknown as WalletProvider, kind: 'deeplink', href: `https://link.trustwallet.com/open_url?coin_id=60&url=${enc}` },
    { id: 'dl-phantom',   name: 'Phantom',           icon: PHANTOM_ICON,   provider: null as unknown as WalletProvider, kind: 'deeplink', href: `https://phantom.app/ul/browse/${enc}` },
  ]
}

export function isMobile(): boolean {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
}

// ── Sign with any EIP-1193 provider ──────────────────────────────────────

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
