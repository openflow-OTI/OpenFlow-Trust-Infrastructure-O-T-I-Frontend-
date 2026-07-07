import { useState } from 'react'

interface ShareButtonProps {
  wallet: string
  chain: string
}

export function ShareButton({ wallet, chain }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    const url = `https://otiscore.vercel.app/?wallet=${encodeURIComponent(wallet)}&chain=${encodeURIComponent(chain)}`
    const shareData = {
      title: 'OTI Trust Score',
      text: `Check this wallet's trust score on OTI`,
      url,
    }

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData)
        return
      } catch {
        // user cancelled or share failed — fall through to clipboard
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const el = document.createElement('textarea')
      el.value = url
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      className="share-btn"
      onClick={handleShare}
      aria-label="Share score"
    >
      <span className="share-btn-icon">{copied ? '✓' : '↗'}</span>
      {copied ? 'Copied!' : 'Share'}
    </button>
  )
}
