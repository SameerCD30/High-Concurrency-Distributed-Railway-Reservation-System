import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Ticket } from 'lucide-react'

interface Props {
  initial?: string
  autoFocus?: boolean
  label?: string
}

export function PnrLookup({ initial = '', autoFocus = false, label = 'PNR number' }: Props) {
  const navigate = useNavigate()
  const [pnr, setPnr] = useState(initial)
  const [error, setError] = useState<string | null>(null)

  function submit(event: FormEvent) {
    event.preventDefault()
    const value = pnr.trim().toUpperCase()
    if (value.length < 6) {
      setError('A PNR is at least six characters long.')
      return
    }
    setError(null)
    navigate(`/ticket/${encodeURIComponent(value)}`)
  }

  return (
    <form className="pnr-form" onSubmit={submit} noValidate>
      <label className="pnr-field">
        <span>{label}</span>
        <span className="pnr-input-wrap">
          <Ticket size={17} aria-hidden="true" />
          <input
            type="text"
            value={pnr}
            autoFocus={autoFocus}
            autoCapitalize="characters"
            spellCheck={false}
            placeholder="PNRXXXXXXXX"
            maxLength={20}
            onChange={(event) => {
              setPnr(event.target.value.toUpperCase())
              setError(null)
            }}
            aria-invalid={Boolean(error)}
          />
        </span>
      </label>
      <button type="submit" className="btn btn-dark">
        Check status <ArrowRight size={16} />
      </button>
      {error && <p className="form-error" role="alert">{error}</p>}
    </form>
  )
}
