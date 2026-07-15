import { useEffect, useState } from 'react'
import {
  discoverEIP6963Wallets,
  getCoinbaseWalletProvider,
  getMobileDeepLinks,
  isMobile,
  COINBASE_WALLET_ENTRY,
  type DiscoveredWallet,
  type WalletProvider,
} from '@/lib/walletConnector'

interface Props {
  onSelect: (provider: WalletProvider, name: string) => void
  onClose: () => void
}

export function WalletPickerModal({ onSelect, onClose }: Props) {
  const [wallets, setWallets] = useState<DiscoveredWallet[]>([])
  const [scanning, setScanning] = useState(true)
  const [connecting, setConnecting] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function scan() {
      const eip = await discoverEIP6963Wallets()
      if (cancelled) return
      const cbProvider = await getCoinbaseWalletProvider()
      const cbEntry: DiscoveredWallet = { ...COINBASE_WALLET_ENTRY, provider: cbProvider }
      // De-dupe: hide Coinbase EIP-6963 entry if SDK entry is shown
      const filtered = eip.filter(w => !w.name.toLowerCase().includes('coinbase'))
      const mobile = isMobile() ? getMobileDeepLinks() : []
      setWallets([...filtered, cbEntry, ...mobile])
      setScanning(false)
    }
    scan()
    return () => { cancelled = true }
  }, [])

  async function pick(wallet: DiscoveredWallet) {
    if (wallet.kind === 'deeplink') {
      window.open(wallet.href, '_blank')
      return
    }
    setConnecting(wallet.id)
    try {
      await onSelect(wallet.provider, wallet.name)
    } catch {
      setConnecting(null)
    }
  }

  return (
    <div className="wp-overlay" onClick={onClose}>
      <div className="wp-modal" onClick={e => e.stopPropagation()}>
        <div className="wp-header">
          <h3 className="wp-title">Connect Your Wallet</h3>
          <button className="wp-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {scanning ? (
          <p className="wp-scanning">Detecting wallets…</p>
        ) : wallets.length === 0 ? (
          <p className="wp-empty">No wallets detected.<br />Install a wallet extension or open this page inside your wallet's browser.</p>
        ) : (
          <>
            {/* extension / SDK wallets */}
            {wallets.filter(w => w.kind !== 'deeplink').length > 0 && (
              <ul className="wp-list">
                {wallets.filter(w => w.kind !== 'deeplink').map(w => (
                  <li key={w.id}>
                    <button
                      className="wp-option"
                      onClick={() => pick(w)}
                      disabled={connecting !== null}
                    >
                      <img className="wp-icon" src={w.icon} alt={w.name} />
                      <span className="wp-name">{w.name}</span>
                      {connecting === w.id
                        ? <span className="wp-status">Connecting…</span>
                        : <span className="wp-arrow">→</span>}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* mobile deep-links */}
            {wallets.filter(w => w.kind === 'deeplink').length > 0 && (
              <>
                <p className="wp-section-label">Open in wallet browser</p>
                <ul className="wp-list">
                  {wallets.filter(w => w.kind === 'deeplink').map(w => (
                    <li key={w.id}>
                      <button className="wp-option wp-option--deeplink" onClick={() => pick(w)}>
                        <img className="wp-icon" src={w.icon} alt={w.name} />
                        <span className="wp-name">{w.name}</span>
                        <span className="wp-arrow">↗</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </>
        )}

        <p className="wp-note">
          Any EIP-1193 compatible wallet works — MetaMask, Rainbow, Coinbase, Brave, Trust, and more.
        </p>
      </div>
    </div>
  )
}
