import { useEffect, useRef, useState } from 'react'
import { EVM_CHAINS, NON_EVM_CHAINS, getChainInfo, type ChainInfo } from '@/lib/chains'
import { ChainIcon } from './ChainIcon'

interface ChainSelectProps {
  value: string
  onChange: (chainId: string) => void
  id?: string
}

export function ChainSelect({ value, onChange, id }: ChainSelectProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const selected = getChainInfo(value)

  useEffect(() => {
    function handlePointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  function selectChain(chain: ChainInfo) {
    onChange(chain.id)
    setOpen(false)
  }

  function renderGroup(label: string, chains: ChainInfo[]) {
    return (
      <div className="chain-select-group">
        <div className="chain-select-group-label">{label}</div>
        {chains.map((chain) => {
          const isSelected = chain.id === value
          return (
            <button
              key={chain.id}
              type="button"
              role="option"
              aria-selected={isSelected}
              className={`chain-select-option${isSelected ? ' chain-select-option-active' : ''}`}
              onClick={() => selectChain(chain)}
            >
              <ChainIcon chainId={chain.id} size={20} className="chain-select-icon" />
              <span>{chain.label}</span>
              {isSelected && <span className="chain-select-check">✓</span>}
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className="chain-select" ref={rootRef}>
      <button
        type="button"
        id={id}
        className="chain-select-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="chain-select-trigger-value">
          {selected && <ChainIcon chainId={selected.id} size={20} />}
          <span>{selected?.label ?? 'Select chain'}</span>
        </span>
        <span className={`chain-select-chevron${open ? ' chain-select-chevron-open' : ''}`}>▾</span>
      </button>

      {open && (
        <div className="chain-select-panel" role="listbox">
          {renderGroup('EVM', EVM_CHAINS)}
          {renderGroup('Non-EVM', NON_EVM_CHAINS)}
        </div>
      )}
    </div>
  )
}
