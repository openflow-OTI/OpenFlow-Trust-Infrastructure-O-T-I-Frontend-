import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { worFetch } from '@/lib/worClient'
import { WalletPickerModal } from '@/components/WalletPickerModal'
import { signWithProvider, type WalletProvider } from '@/lib/walletConnector'
import { Logo } from '@/components/Logo'

type Step = 1 | 2 | 3 | 4

const STEP_LABELS = ['Address', 'Sign', 'Passkey', 'Done']

function parseChallengeMessage(raw: string) {
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean)
  let title = '', address = '', timestamp = '', notice = ''
  for (const line of lines) {
    if (line.startsWith('Address:'))          address   = line.slice(8).trim()
    else if (line.startsWith('Timestamp:'))   timestamp = line.slice(10).trim()
    else if (line.toLowerCase().startsWith('do not')) notice = line
    else if (line) title = line
  }
  return { title, address, timestamp, notice }
}

function fmtTimestamp(iso: string): string {
  try {
    const d = new Date(iso)
    const date = d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' })
    const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: 'UTC' })
    return `${date} · ${time} UTC`
  } catch { return iso }
}

function fmtAddress(addr: string): string {
  if (addr.length > 20) return `${addr.slice(0, 10)}…${addr.slice(-6)}`
  return addr
}

function Stepper({ step }: { step: Step }) {
  return (
    <div className="wor-stepper">
      {([1, 2, 3, 4] as Step[]).map((n, i) => (
        <div key={n} className="wor-stepper-segment">
          <div className="wor-stepper-node">
            <div className={`wor-step-dot${step > n ? ' wor-step-dot--done' : step === n ? ' wor-step-dot--active' : ''}`}>
              {step > n ? '✓' : n}
            </div>
            <span className={`wor-step-label${step === n ? ' wor-step-label--active' : ''}`}>
              {STEP_LABELS[i]}
            </span>
          </div>
          {n < 4 && <div className={`wor-step-line${step > n ? ' wor-step-line--done' : ''}`} />}
        </div>
      ))}
    </div>
  )
}

type ResultState =
  | { kind: 'success' }
  | { kind: 'error'; code: number; message: string }

export function Report() {
  const [searchParams]                          = useSearchParams()
  const prefill                                 = searchParams.get('address') ?? ''

  const [step, setStep]                         = useState<Step>(1)
  const [address, setAddress]                   = useState(prefill)
  const [challengeMessage, setChallengeMessage] = useState('')
  const [signature, setSignature]               = useState('')
  const [passkey, setPasskey]                   = useState('')
  const [loading, setLoading]                   = useState(false)
  const [error, setError]                       = useState<string | null>(null)
  const [result, setResult]                     = useState<ResultState | null>(null)
  const [showConfirm, setShowConfirm]           = useState(false)
  const [showPicker, setShowPicker]             = useState(false)
  const [walletName, setWalletName]             = useState<string | null>(null)

  function clearError() { setError(null) }

  async function handleAddressSubmit(e: React.FormEvent) {
    e.preventDefault()
    const addr = address.trim()
    if (!addr) return
    setLoading(true); setError(null)
    try {
      const { data, status } = await worFetch<{ status?: string }>(
        `/wallet/registration-status/${encodeURIComponent(addr)}`
      )
      if (status === 404 || !data.status || data.status === 'not_registered') {
        setError('This address is not registered with OTI. Register first to enable self-reporting.')
        return
      }
      if (data.status === 'compromised') {
        setError('This wallet is already flagged as compromised.'); return
      }
      const { data: cd } = await worFetch<{ message?: string }>(
        `/wallet/register/challenge?address=${encodeURIComponent(addr)}&chain_family=evm`
      )
      if (!cd.message) throw new Error('No challenge message returned from server.')
      setChallengeMessage(cd.message)
      setStep(2)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check registration status.')
    } finally { setLoading(false) }
  }

  async function handleWalletSelected(provider: WalletProvider, name: string) {
    setShowPicker(false); setWalletName(name)
    setLoading(true); setError(null)
    try {
      const { signature: sig } = await signWithProvider(provider, challengeMessage)
      setSignature(sig)
      setStep(3) // auto-advance to passkey step
    } catch (err: unknown) {
      const e = err as { code?: number; message?: string }
      if (e?.code === 4001 || e?.message?.includes('rejected') || e?.message?.includes('denied')) {
        setError('Signature cancelled.')
      } else {
        setError(e?.message ?? 'Failed to sign message.')
      }
    } finally { setLoading(false) }
  }

  function handlePasskeySubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!passkey.trim()) { setError('Enter your passkey.'); return }
    setShowConfirm(true)
  }

  async function handleConfirmedSubmit() {
    setShowConfirm(false)
    setLoading(true); setError(null)
    try {
      const { status, data } = await worFetch('/report/compromised', {
        method: 'POST',
        body: JSON.stringify({
          address: address.trim(),
          message: challengeMessage,
          signature,
          passkey,
        }),
      })
      if (status === 200 || status === 201) {
        setResult({ kind: 'success' })
      } else if (status === 401) {
        setResult({ kind: 'error', code: 401, message: 'Verification failed. Check your passkey and try again.' })
      } else if (status === 404) {
        setResult({ kind: 'error', code: 404, message: 'Address not registered. Register first.' })
      } else if (status === 409) {
        setResult({ kind: 'error', code: 409, message: 'Already flagged.' })
      } else {
        const d = data as { error?: string; message?: string }
        setResult({ kind: 'error', code: status, message: d.error ?? d.message ?? `Unexpected error (${status}).` })
      }
      setStep(4)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Report submission failed.')
    } finally { setLoading(false) }
  }

  const parsed = challengeMessage ? parseChallengeMessage(challengeMessage) : null

  return (
    <div className="wor-page">
      <Stepper step={step} />

      {/* ── Step 1: Address ── */}
      {step === 1 && (
        <div className="wor-card">
          <div className="wor-card-head">
            <div className="wor-report-badge">Self-Reporting</div>
            <h2 className="wor-card-title">Report a Compromised Wallet</h2>
            <p className="wor-card-desc">
              If your wallet has been stolen or hacked, flag it here. OTI will immediately
              show a compromised warning on every future score check.
            </p>
          </div>
          <form onSubmit={handleAddressSubmit} className="wor-form">
            <div className="wor-form-field">
              <label className="wor-form-label">Wallet Address</label>
              <input
                className="wor-input"
                placeholder="0x… or wallet address"
                value={address}
                onChange={e => { setAddress(e.target.value); clearError() }}
                spellCheck={false} autoCorrect="off" autoCapitalize="off"
                required autoFocus={!prefill}
              />
            </div>
            {error && (
              <p className="wor-error">
                {error}
                {error.includes('register first') && <>{' '}<Link to="/register" className="wor-link">Register →</Link></>}
              </p>
            )}
            <button className="wor-btn wor-btn--primary" type="submit" disabled={loading}>
              {loading ? 'Checking…' : 'Continue →'}
            </button>
          </form>
          <p className="wor-card-footer">
            Not registered?{' '}
            <Link to="/register" className="wor-link">Register your wallet first →</Link>
          </p>
        </div>
      )}

      {/* ── Step 2: Sign ── */}
      {step === 2 && parsed && (
        <div className="wor-card">
          <div className="wor-card-head">
            <h2 className="wor-card-title">Prove Ownership</h2>
            <p className="wor-card-desc">
              Sign the ownership proof below to confirm you control this wallet.
            </p>
          </div>
          <div className="wor-challenge-wrap">
            <div className="wor-challenge-header">
              <span className="wor-challenge-label">Ownership Proof — Read Before Signing</span>
            </div>
            <div className="wor-challenge-fields">
              <div className="wor-challenge-row">
                <span className="wor-challenge-key">Platform</span>
                <span className="wor-challenge-val">{parsed.title || 'OTI'}</span>
              </div>
              <div className="wor-challenge-row">
                <span className="wor-challenge-key">Address</span>
                <code className="wor-challenge-val wor-challenge-val--mono">{fmtAddress(parsed.address)}</code>
              </div>
              {parsed.timestamp && (
                <div className="wor-challenge-row">
                  <span className="wor-challenge-key">Signed at</span>
                  <span className="wor-challenge-val">{fmtTimestamp(parsed.timestamp)}</span>
                </div>
              )}
              {parsed.notice && (
                <div className="wor-challenge-notice">{parsed.notice}</div>
              )}
            </div>
          </div>
          {error && <p className="wor-error">{error}</p>}
          <div className="wor-form" style={{ gap: '0.5rem' }}>
            <button
              className="wor-btn wor-btn--primary"
              onClick={() => setShowPicker(true)}
              disabled={loading}
            >
              {loading ? `Waiting for ${walletName ?? 'wallet'}…` : 'Connect Wallet & Sign'}
            </button>
            <button className="wor-btn wor-btn--ghost" type="button"
              onClick={() => { setStep(1); clearError() }} disabled={loading}>
              ← Back
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Passkey ── */}
      {step === 3 && (
        <div className="wor-card">
          <div className="wor-card-head">
            <h2 className="wor-card-title">Verify with Passkey</h2>
            <p className="wor-card-desc">
              Enter the passkey you set when registering this wallet.
              This confirms only you can flag it as compromised.
            </p>
          </div>
          <form onSubmit={handlePasskeySubmit} className="wor-form">
            <div className="wor-security-field">
              <label className="wor-form-label">Your Passkey</label>
              <input
                className="wor-input wor-input--security"
                type="password"
                placeholder="Enter your registration passkey"
                value={passkey}
                onChange={e => { setPasskey(e.target.value); clearError() }}
                autoComplete="current-password"
                required autoFocus
              />
            </div>
            {error && <p className="wor-error">{error}</p>}
            <button className="wor-btn wor-btn--danger-action" type="submit" disabled={loading}>
              {loading ? 'Submitting…' : 'Report as Compromised'}
            </button>
            <button type="button" className="wor-btn wor-btn--ghost"
              onClick={() => { setStep(2); clearError() }} disabled={loading}>
              ← Back
            </button>
          </form>
        </div>
      )}

      {/* ── Step 4: Result ── */}
      {step === 4 && result && (
        <div className={`wor-card ${result.kind === 'success' ? 'wor-card--success' : 'wor-card--danger'}`}>
          {result.kind === 'success' ? (
            <>
              <div className="wor-result-logo wor-result-logo--danger-bg">
                <Logo size={44} />
              </div>
              <div>
                <h2 className="wor-card-title">Wallet Flagged as Compromised</h2>
                <p className="wor-card-desc" style={{ marginTop: '0.5rem' }}>
                  Anyone checking this wallet on OTI will now see a compromised warning.
                  The flag is permanent — only an admin can reverse it.
                </p>
              </div>
              <Link to="/score" className="wor-btn wor-btn--ghost" style={{ textAlign: 'center' }}>
                ← Back to Score
              </Link>
            </>
          ) : (
            <>
              <div className="wor-result-logo">
                <Logo size={44} />
              </div>
              <div>
                <h2 className="wor-card-title">Report Failed</h2>
                <p className="wor-card-desc" style={{ marginTop: '0.5rem' }}>{result.message}</p>
              </div>
              {result.code === 404 && (
                <Link to="/register" className="wor-btn wor-btn--outline" style={{ textAlign: 'center' }}>
                  Register Your Wallet →
                </Link>
              )}
              <button className="wor-btn wor-btn--ghost"
                onClick={() => { setStep(3); setResult(null); clearError() }}>
                ← Try Again
              </button>
            </>
          )}
        </div>
      )}

      {/* Confirm dialog */}
      {showConfirm && (
        <div className="wor-confirm-overlay" onClick={() => setShowConfirm(false)}>
          <div className="wor-confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="wor-confirm-icon" />
            <h3 className="wor-confirm-title">Confirm Report</h3>
            <p className="wor-confirm-text">
              This will immediately flag your wallet as compromised across OTI.
              All future score checks will show a compromised warning.
            </p>
            <p className="wor-confirm-text wor-confirm-text--warn">
              This cannot be undone by you — only an admin can reverse it.
            </p>
            <div className="wor-confirm-actions">
              <button className="wor-btn wor-btn--ghost" onClick={() => setShowConfirm(false)}>Cancel</button>
              <button className="wor-btn wor-btn--danger-action" onClick={handleConfirmedSubmit}>
                Yes, Flag This Wallet
              </button>
            </div>
          </div>
        </div>
      )}

      {showPicker && (
        <WalletPickerModal onSelect={handleWalletSelected} onClose={() => setShowPicker(false)} />
      )}
    </div>
  )
}
