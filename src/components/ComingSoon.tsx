import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'

// Shared "coming soon" affordance for any link/button that has no real
// destination yet (unreleased socials, legal pages, WOR registration, etc).
// Clicking one of these calls showComingSoon(label) instead of navigating
// nowhere silently — the user always gets feedback that the tap registered.

interface ComingSoonContextValue {
  showComingSoon: (label: string) => void
}

const ComingSoonContext = createContext<ComingSoonContextValue | null>(null)

export function ComingSoonProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showComingSoon = useCallback((label: string) => {
    setMessage(`${label} — coming soon`)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setMessage(null), 2200)
  }, [])

  return (
    <ComingSoonContext.Provider value={{ showComingSoon }}>
      {children}
      <div className="coming-soon-toast-wrap" aria-live="polite">
        {message && <div className="coming-soon-toast">{message}</div>}
      </div>
    </ComingSoonContext.Provider>
  )
}

export function useComingSoon() {
  const ctx = useContext(ComingSoonContext)
  if (!ctx) throw new Error('useComingSoon must be used within a ComingSoonProvider')
  return ctx.showComingSoon
}
