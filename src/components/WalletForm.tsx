import { useState, type FormEvent } from 'react'
import { CHAINS } from '@/lib/chains'
import { validateAddress } from '@/lib/validateAddress'
import { ChainSelect } from './ChainSelect'

interface WalletFormProps {
  onSubmit: (address: string, chain: string) => void
  initialAddress?: string
  initialChain?: string
}

export function WalletForm({ onSubmit, initialAddress = '', initialChain }: WalletFormProps) {
  const [address, setAddress] = useState(initialAddress)
  const [chain, setChain] = useState(initialChain ?? CHAINS[0].id)
  const [formError, setFormError] = useState<string | null>(null)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()

    const validationError = validateAddress(address, chain)
    if (validationError) {
      setFormError(validationError)
      return
    }

    setFormError(null)
    onSubmit(address.trim(), chain)
  }

  return (
    <form className="wallet-form" onSubmit={handleSubmit} noValidate>
      <label className="wallet-form-label" htmlFor="address">
        WALLET ADDRESS
      </label>
      <div className="wallet-form-input-wrapper">
        <input
          id="address"
          className="wallet-form-input"
          type="text"
          placeholder="0x… or wallet address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          autoComplete="off"
          spellCheck={false}
        />
        {address && (
          <button
            type="button"
            className="wallet-form-clear"
            onClick={() => setAddress('')}
            aria-label="Clear address"
          >
            ×
          </button>
        )}
      </div>

      <label className="wallet-form-label" htmlFor="chain">
        Chain
      </label>
      <ChainSelect id="chain" value={chain} onChange={setChain} />

      <p className="wallet-form-error" style={{ visibility: formError ? 'visible' : 'hidden' }}>
        {formError || ' '}
      </p>

      <button type="submit" className="wallet-form-submit">
        Check trust score
      </button>
    </form>
  )
}
