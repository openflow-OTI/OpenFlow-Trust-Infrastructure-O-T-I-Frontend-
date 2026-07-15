/**
 * Multi-wallet connector — zero API keys required.
 *
 * Strategy:
 *  1. EIP-6963  — auto-discovers every installed browser-extension wallet
 *                 (MetaMask, Rainbow, Coinbase ext, Brave, etc.)
 *  2. Coinbase Wallet SDK v4 — free, no project ID, works on mobile Chrome
 *                              via deep-link / QR to the Coinbase Wallet app
 *  3. Mobile deep-links — fallback links that open the page inside a wallet's
 *                         built-in browser when no extension is present
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
  icon: string          // data-URI SVG/PNG from the wallet itself
  provider: WalletProvider
  kind: 'eip6963' | 'coinbase' | 'deeplink'
  href?: string         // only for deep-link entries
}

// ---------------------------------------------------------------------------
// EIP-6963 discovery
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
      found.push({
        id: info.uuid,
        name: info.name,
        icon: info.icon,
        provider,
        kind: 'eip6963',
      })
    }
  }

  window.addEventListener('eip6963:announceProvider', handler as EventListener)
  window.dispatchEvent(new Event('eip6963:requestProvider'))
  await new Promise(resolve => setTimeout(resolve, 200))
  window.removeEventListener('eip6963:announceProvider', handler as EventListener)

  return found
}

// ---------------------------------------------------------------------------
// Coinbase Wallet SDK (free, no project ID)
// ---------------------------------------------------------------------------

let _cbProvider: WalletProvider | null = null

export async function getCoinbaseWalletProvider(): Promise<WalletProvider> {
  if (_cbProvider) return _cbProvider
  const { CoinbaseWalletSDK } = await import('@coinbase/wallet-sdk')
  const sdk = new CoinbaseWalletSDK({
    appName: 'OTI — OpenFlow Trust Infrastructure',
    appChainIds: [1, 137, 42161, 56, 10],   // mainnet, polygon, arb, bsc, op
  })
  _cbProvider = sdk.makeWeb3Provider() as unknown as WalletProvider
  return _cbProvider
}

export const COINBASE_WALLET_ENTRY: Omit<DiscoveredWallet, 'provider'> = {
  id: 'coinbase-wallet-sdk',
  name: 'Coinbase Wallet',
  icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNTAiIGZpbGw9IiMwMDUyRkYiLz48cmVjdCB4PSIzMCIgeT0iMzciIHdpZHRoPSI0MCIgaGVpZ2h0PSIyNiIgcng9IjYiIGZpbGw9IndoaXRlIi8+PC9zdmc+',
  kind: 'coinbase',
}

// ---------------------------------------------------------------------------
// Mobile deep-links (open page inside wallet's browser — no WalletConnect needed)
// ---------------------------------------------------------------------------

export function isMobile(): boolean {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
}

export function getMobileDeepLinks(): DiscoveredWallet[] {
  const raw = window.location.href
  const host = window.location.hostname + window.location.pathname + window.location.search
  const enc = encodeURIComponent(raw)

  return [
    {
      id: 'deeplink-metamask',
      name: 'MetaMask',
      icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNTAiIGZpbGw9IiNGNjg1MUIiLz48dGV4dCB4PSI1MCIgeT0iNTYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjM2IiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiI+TTwvdGV4dD48L3N2Zz4=',
      provider: null as unknown as WalletProvider,
      kind: 'deeplink',
      href: `https://metamask.app.link/dapp/${host}`,
    },
    {
      id: 'deeplink-rainbow',
      name: 'Rainbow',
      icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNTAiIGZpbGw9IiM3NzRFRjAiLz48dGV4dCB4PSI1MCIgeT0iNTYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjM2IiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiI+UjwvdGV4dD48L3N2Zz4=',
      provider: null as unknown as WalletProvider,
      kind: 'deeplink',
      href: `https://rnbwapp.com/dapp?url=${enc}`,
    },
    {
      id: 'deeplink-trust',
      name: 'Trust Wallet',
      icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNTAiIGZpbGw9IiMzMzc1QkIiLz48dGV4dCB4PSI1MCIgeT0iNTYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjM2IiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiI+VDwvdGV4dD48L3N2Zz4=',
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
