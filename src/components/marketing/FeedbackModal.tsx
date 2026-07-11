import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

interface FeedbackModalProps {
  open: boolean
  onClose: () => void
}

// Ahmad has not yet provided the Tally.so form embed. No working feedback
// email exists yet either, so this shows a "coming soon" notice until one
// of those channels is ready — swap this out once Ahmad sends the embed
// or a real support address; no other wiring (the trigger in the footer)
// needs to change.

export function FeedbackModal({ open, onClose }: FeedbackModalProps) {
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const triggerRef = useRef<Element | null>(null)

  // Focus management: remember what had focus before opening (the "Send
  // Feedback" footer button), move focus into the dialog on open, trap Tab
  // on the dialog's one focusable element, and restore focus to the
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
        e.preventDefault()
        closeBtnRef.current?.focus()
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
          <X aria-hidden="true" />
        </button>
        <h2 id="feedback-modal-title" className="marketing-modal-title">Send Feedback</h2>
        <p className="marketing-modal-body">
          Feedback channels are coming soon. Check back shortly.
        </p>
      </div>
    </div>
  )
}
