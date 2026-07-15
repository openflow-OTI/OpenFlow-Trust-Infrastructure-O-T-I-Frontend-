import { useEffect, useState } from 'react'
import {
  discoverEIP6963Wallets,
  getMobileDeepLinks,
  isMobile,
  type DiscoveredWallet,
  type WalletProvider,
} from '@/lib/walletConnector'

interface Props {
  onSelect: (provider: WalletProvider, name: string) => void
  onClose: () => void
}

export function WalletPickerModal({ onSelect, onClose }: Props) {
  const [extensions, setExtensions] = useState<DiscoveredWallet[]>([])
  const [deeplinks, setDeeplinks]   = useState<DiscoveredWallet[]>([])
  const [scanning, setScanning]     = useState(true)
  const [connecting, setConnecting] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function scan() {
      const eip = await discoverEIP6963Wallets()
      if (cancelled) return
      setExtensions(eip)
      if (isMobile()) setDeeplinks(getMobileDeepLinks())
      setScanning(false)
    }
    scan()
    return () => { cancelled = true }
  }, [])

  async function pick(wallet: DiscoveredWallet) {
    if (wallet.kind === 'deeplink') {
      window.open(wallet.href, '_blank', 'noopener,noreferrer')
      return
    }
    setConnecting(wallet.id)
    try {
      await onSelect(wallet.provider, wallet.name)
    } catch {
      setConnecting(null)
    }
  }

  const hasExtensions = extensions.length > 0
  const hasDeeplinks  = deeplinks.length > 0

  return (
    <div className="wp-overlay" onClick={onClose}>
      <div className="wp-modal" onClick={e => e.stopPropagation()}>
        <div className="wp-header">
          <h3 className="wp-title">Connect Your Wallet</h3>
          <button className="wp-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {scanning ? (
          <p className="wp-scanning">Detecting wallets…</p>
        ) : !hasExtensions && !hasDeeplinks ? (
          <p className="wp-empty">
            No wallets detected.<br />
            Install a wallet extension, or open this page inside your wallet's browser.
          </p>
        ) : (
          <>
            {hasExtensions && (
              <>
                <p className="wp-section-label">Installed wallets</p>
                <ul className="wp-list">
                  {extensions.map(w => (
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
              </>
            )}

            {hasDeeplinks && (
              <>
                <p className="wp-section-label">Open in wallet browser</p>
                <ul className="wp-list">
                  {deeplinks.map(w => (
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
          Works with any EIP-1193 wallet — MetaMask, Coinbase, Rainbow, Brave, Trust, and more.
        </p>
      </div>
    </div>
  )
}
