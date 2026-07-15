import { useState } from 'react'
import { Link } from 'react-router-dom'
import { worFetch } from '@/lib/worClient'
import { WalletPickerModal } from '@/components/WalletPickerModal'
import { signWithProvider, type WalletProvider } from '@/lib/walletConnector'

type Step = 1 | 2 | 3

const STEP_LABELS = ['Address', 'Sign', 'Passkey']

function Stepper({ step }: { step: Step }) {
  return (
    <div className="wor-stepper">
      {[1, 2, 3].map((n, i) => (
        <div key={n} className="wor-stepper-segment">
          <div className="wor-stepper-node">
            <div
              className={`wor-step-dot${step > n ? ' wor-step-dot--done' : step === n ? ' wor-step-dot--active' : ''}`}
            >
              {step > n ? '✓' : n}
            </div>
            <span className={`wor-step-label${step === n ? ' wor-step-label--active' : ''}`}>
              {STEP_LABELS[i]}
            </span>
          </div>
          {n < 3 && (
            <div className={`wor-step-line${step > n ? ' wor-step-line--done' : ''}`} />
          )}
        </div>
      ))}
    </div>
  )
}

export function Register() {
  const [step, setStep]                         = useState<Step>(1)
  const [address, setAddress]                   = useState('')
  const [challengeMessage, setChallengeMessage] = useState('')
  const [signature, setSignature]               = useState('')
  const [passkey, setPasskey]                   = useState('')
  const [confirmPasskey, setConfirmPasskey]     = useState('')
  const [loading, setLoading]                   = useState(false)
  const [error, setError]                       = useState<string | null>(null)
  const [success, setSuccess]                   = useState(false)
  const [showPicker, setShowPicker]             = useState(false)
  const [walletName, setWalletName]             = useState<string | null>(null)

  function clearError() { setError(null) }

  async function handleAddressSubmit(e: React.FormEvent) {
    e.preventDefault()
    const addr = address.trim()
    if (!addr) return
    setLoading(true)
    setError(null)
    try {
      const { data, status } = await worFetch<{ status?: string }>(
        `/wallet/registration-status/${encodeURIComponent(addr)}`
      )
      if (status === 200 && (data.status === 'active' || data.status === 'compromised')) {
        setError('This address is already registered.')
        return
      }
      await loadChallenge(addr)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check registration status.')
    } finally {
      setLoading(false)
    }
  }

  async function loadChallenge(addr: string) {
    const { data } = await worFetch<{ message?: string }>(
      `/wallet/register/challenge?address=${encodeURIComponent(addr)}&chain_family=evm`
    )
    if (!data.message) throw new Error('No challenge message returned from server.')
    setChallengeMessage(data.message)
    setStep(2)
  }

  async function handleWalletSelected(provider: WalletProvider, name: string) {
    setShowPicker(false)
    setWalletName(name)
    setLoading(true)
    setError(null)
    try {
      const { signature: sig } = await signWithProvider(provider, challengeMessage)
      setSignature(sig)
      setStep(3)
    } catch (err: unknown) {
      const e = err as { code?: number; message?: string }
      if (e?.code === 4001 || e?.message?.includes('rejected') || e?.message?.includes('denied')) {
        setError('Signature request cancelled.')
      } else {
        setError(e?.message ?? 'Failed to sign message.')
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (passkey.length < 8) { setError('Passkey must be at least 8 characters.'); return }
    if (passkey !== confirmPasskey) { setError('Passkeys do not match.'); return }
    setLoading(true)
    setError(null)
    try {
      const { status, data } = await worFetch('/wallet/register', {
        method: 'POST',
        body: JSON.stringify({
          address: address.trim(),
          chain_family: 'evm',
          message: challengeMessage,
          signature,
          passkey,
        }),
      })
      if (status === 201) {
        setSuccess(true)
      } else if (status === 409) {
        setError('Already registered.')
      } else {
        const d = data as { error?: string; message?: string }
        setError(d.error ?? d.message ?? `Unexpected error (${status}).`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="wor-page">
        <div className="wor-card wor-card--success">
          <div className="wor-result-icon wor-result-icon--success" />
          <h2 className="wor-card-title">Wallet Registered</h2>
          <p className="wor-card-desc">
            Your wallet is now protected by OTI. If it's ever compromised, visit{' '}
            <Link to="/report" className="wor-link">/report</Link> to flag it instantly —
            one signed message warns everyone.
          </p>
          <div className="wor-result-actions">
            <Link to="/score" className="wor-btn wor-btn--ghost">← Score a Wallet</Link>
            <Link to="/report" className="wor-btn wor-btn--outline">Report if Compromised →</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="wor-page">
      <Stepper step={step} />

      {step === 1 && (
        <div className="wor-card">
          <div className="wor-card-head">
            <h2 className="wor-card-title">Register Your Wallet</h2>
            <p className="wor-card-desc">
              Link your wallet to OTI's Ownership Registry. If it's ever stolen or hacked,
              one signed message flags it immediately — warning anyone who checks it.
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
                spellCheck={false}
                autoCorrect="off"
                autoCapitalize="off"
                required
                autoFocus
              />
            </div>
            {error && <p className="wor-error">{error}</p>}
            <button className="wor-btn wor-btn--primary" type="submit" disabled={loading}>
              {loading ? 'Checking…' : 'Continue →'}
            </button>
          </form>
          <p className="wor-card-footer">
            Already registered?{' '}
            <Link to="/report" className="wor-link">Report a compromised wallet →</Link>
          </p>
        </div>
      )}

      {step === 2 && (
        <div className="wor-card">
          <div className="wor-card-head">
            <h2 className="wor-card-title">Sign the Challenge</h2>
            <p className="wor-card-desc">
              Prove ownership by signing the message below with any wallet.
              You will always see the exact text before signing.
            </p>
          </div>
          <div className="wor-challenge-wrap">
            <div className="wor-challenge-header">
              <span className="wor-challenge-icon" aria-hidden="true" />
              <span className="wor-challenge-label">Challenge Message — Read Before Signing</span>
            </div>
            <div className="wor-message-box">{challengeMessage}</div>
            <p className="wor-challenge-note">
              Your wallet will display this message exactly as shown above.
            </p>
          </div>
          {error && <p className="wor-error">{error}</p>}
          <div className="wor-form" style={{ gap: '0.6rem' }}>
            <button
              className="wor-btn wor-btn--primary"
              onClick={() => setShowPicker(true)}
              disabled={loading}
            >
              {loading
                ? `Waiting for ${walletName ?? 'wallet'}…`
                : 'Connect Wallet & Sign'}
            </button>
            <button
              className="wor-btn wor-btn--ghost"
              type="button"
              onClick={() => { setStep(1); clearError() }}
              disabled={loading}
            >
              ← Back
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="wor-card">
          <div className="wor-card-head">
            <h2 className="wor-card-title">Set Your Passkey</h2>
            <p className="wor-card-desc">
              Your passkey is required to self-report this wallet as compromised in the future.
            </p>
          </div>
          <form onSubmit={handleRegister} className="wor-form">
            <div className="wor-security-field">
              <div className="wor-security-field-header">
                <label className="wor-form-label">Passkey</label>
              </div>
              <input
                className="wor-input wor-input--security"
                type="password"
                placeholder="Min. 8 characters"
                value={passkey}
                onChange={e => { setPasskey(e.target.value); clearError() }}
                required
                autoFocus
                autoComplete="new-password"
              />
            </div>
            <div className="wor-security-field">
              <div className="wor-security-field-header">
                <label className="wor-form-label">Confirm Passkey</label>
              </div>
              <input
                className="wor-input wor-input--security"
                type="password"
                placeholder="Repeat your passkey"
                value={confirmPasskey}
                onChange={e => { setConfirmPasskey(e.target.value); clearError() }}
                required
                autoComplete="new-password"
              />
            </div>
            <p className="wor-security-note">
              Store this securely — OTI cannot recover your passkey.
            </p>
            {error && <p className="wor-error">{error}</p>}
            <button className="wor-btn wor-btn--primary" type="submit" disabled={loading}>
              {loading ? 'Registering…' : 'Register Wallet'}
            </button>
            <button
              type="button"
              className="wor-btn wor-btn--ghost"
              onClick={() => { setStep(2); clearError() }}
              disabled={loading}
            >
              ← Back
            </button>
          </form>
        </div>
      )}

      {showPicker && (
        <WalletPickerModal
          onSelect={handleWalletSelected}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  )
}
