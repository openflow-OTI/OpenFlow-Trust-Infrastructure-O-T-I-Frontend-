import { useState, useCallback } from 'react'

export function CopyButton({ value }: { value?: string | null }) {
  const [copied, setCopied] = useState(false)
  const safe = (value ?? '').trim()

  const handleCopy = useCallback(() => {
    if (!safe) return
    navigator.clipboard.writeText(safe).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }).catch(() => {
      const el = document.createElement('textarea')
      el.value = safe
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }, [safe])

  if (!safe) return null

  return (
    <button
      className="admin-copy-btn"
      onClick={handleCopy}
      title={copied ? 'Copied!' : 'Copy to clipboard'}
      type="button"
    >
      {copied ? '✓' : '⧉'}
    </button>
  )
}
