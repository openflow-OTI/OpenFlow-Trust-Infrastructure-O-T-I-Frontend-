import { useEffect, useRef } from 'react'

interface FeedbackModalProps {
  open: boolean
  onClose: () => void
}

// Ahmad has not yet provided the Tally.so form embed — falls back to a
// mailto: link until that snippet is available. Swap the body of this
// component for the Tally iframe embed once Ahmad sends it; no other
// wiring (the trigger in the footer) needs to change.
const FEEDBACK_EMAIL = 'feedback@openflowlabs.io'

export function FeedbackModal({ open, onClose }: FeedbackModalProps) {
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const emailLinkRef = useRef<HTMLAnchorElement>(null)
  const triggerRef = useRef<Element | null>(null)

  // Focus management: remember what had focus before opening (the "Send
  // Feedback" footer button), move focus into the dialog on open, trap Tab
  // inside the dialog's two focusable elements, and restore focus to the
  // trigger on close — standard modal a11y expectations.
  useEffect(() => {
    if (!open) return
    triggerRef.current = document.activeElement
    closeBtnRef.current?.focus()

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key === 'Tab') {
        const focusables = [closeBtnRef.current, emailLinkRef.current].filter(
          (el): el is HTMLButtonElement | HTMLAnchorElement => el !== null,
        )
        if (focusables.length === 0) return
        const first = focusables[0]!
        const last = focusables[focusables.length - 1]!
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      if (triggerRef.current instanceof HTMLElement) {
        triggerRef.current.focus()
      }
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="marketing-modal-overlay" onClick={onClose}>
      <div
        className="marketing-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button ref={closeBtnRef} className="marketing-modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>
        <h2 id="feedback-modal-title" className="marketing-modal-title">Send Feedback</h2>
        <p className="marketing-modal-body">
          A feedback form is on the way. For now, send us a note directly and we'll get back to you.
        </p>
        <a
          ref={emailLinkRef}
          href={`mailto:${FEEDBACK_EMAIL}?subject=${encodeURIComponent('OTI Feedback')}`}
          className="marketing-btn marketing-btn--primary"
        >
          Email {FEEDBACK_EMAIL}
        </a>
      </div>
    </div>
  )
}
