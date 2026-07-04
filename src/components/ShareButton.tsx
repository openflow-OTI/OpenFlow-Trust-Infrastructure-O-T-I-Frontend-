import { useState, useEffect, useRef } from 'react'
import type { ScoreMetadata } from '@/lib/types'
import type { components } from '@/api/schema.gen'
import { generateScoreCard } from '@/lib/generateScoreCard'

type SignalBreakdown = components['schemas']['SignalBreakdown']

interface ShareButtonProps {
  score: number
  signals: SignalBreakdown
  metadata?: ScoreMetadata
  chain: string
  wallet: string
}

export function ShareButton({ score, signals, metadata, chain, wallet }: ShareButtonProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [generating, setGenerating] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleCopyLink() {
    setOpen(false)
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback for environments without clipboard API
      const el = document.createElement('textarea')
      el.value = window.location.href
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  async function handleSaveImage() {
    setOpen(false)
    setGenerating(true)
    try {
      await generateScoreCard({ score, signals, metadata, chain, wallet })
    } finally {
      setGenerating(false)
    }
  }

  const label = copied ? '✓ copied' : generating ? 'generating…' : 'share'

  return (
    <div className="share-wrapper" ref={wrapperRef}>
      <button
        className="share-btn"
        onClick={() => !copied && !generating && setOpen((v) => !v)}
        aria-label="Share score"
        aria-expanded={open}
      >
        <span className="share-btn-icon">↗</span>
        {label}
      </button>

      {open && (
        <div className="share-dropdown">
          <button className="share-option" onClick={handleCopyLink}>
            <span className="share-option-icon">⎘</span>
            Copy link
          </button>
          <button className="share-option" onClick={handleSaveImage}>
            <span className="share-option-icon">↓</span>
            Save as image
          </button>
        </div>
      )}
    </div>
  )
}
