import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowLeftRight, CalendarDays, Search } from 'lucide-react'
import { StationSelect } from './StationSelect'
import { defaultJourneyDate, todayISO } from '../lib/format'
import type { SearchQuery, Station } from '../types'

interface Props {
  stations: Station[]
  initial?: Partial<SearchQuery>
  onSubmit: (query: SearchQuery) => void
  loading?: boolean
}

const CLASS_OPTIONS = [
  { value: 'SL', label: 'Sleeper (SL)' },
  { value: '3A', label: 'AC 3 Tier (3A)' },
  { value: '2A', label: 'AC 2 Tier (2A)' },
]

export function SearchForm({ stations, initial, onSubmit, loading }: Props) {
  const [from, setFrom] = useState<number | null>(initial?.from ?? null)
  const [to, setTo] = useState<number | null>(initial?.to ?? null)
  const [date, setDate] = useState(initial?.date ?? defaultJourneyDate())
  const [classType, setClassType] = useState(initial?.classType ?? 'SL')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setFrom(initial?.from ?? null)
    setTo(initial?.to ?? null)
    if (initial?.date) setDate(initial.date)
    if (initial?.classType) setClassType(initial.classType)
  }, [initial?.from, initial?.to, initial?.date, initial?.classType])

  useEffect(() => {
    if (!stations.length) return
    setFrom((current) => {
      if (current !== null && stations.some((station) => station.id === current)) return current
      return stations.find((station) => station.code === 'NDLS')?.id ?? stations[0].id
    })
    setTo((current) => {
      if (current !== null && stations.some((station) => station.id === current)) return current
      return stations.find((station) => station.code === 'HWH')?.id ?? stations[1]?.id ?? stations[0].id
    })
  }, [stations])

  function swap() {
    if (from === null || to === null) return
    setFrom(to)
    setTo(from)
    setError(null)
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    if (from === null || to === null) {
      setError('Choose a boarding and destination station.')
      return
    }
    if (from === to) {
      setError('Boarding and destination stations must be different.')
      return
    }
    if (date < todayISO()) {
      setError('Pick a journey date from today onwards.')
      return
    }
    setError(null)
    onSubmit({ from, to, date, classType })
  }

  return (
    <form className="search-form" onSubmit={submit} noValidate>
      <div className="search-row search-row-stations">
        <StationSelect
          stations={stations}
          value={from}
          onChange={(id) => {
            setFrom(id)
            setError(null)
          }}
          label="From"
          excludeId={to}
        />

        <button
          type="button"
          className="swap-btn"
          onClick={swap}
          aria-label="Swap boarding and destination stations"
        >
          <ArrowLeftRight size={17} />
        </button>

        <StationSelect
          stations={stations}
          value={to}
          onChange={(id) => {
            setTo(id)
            setError(null)
          }}
          label="To"
          excludeId={from}
        />
      </div>

      <div className="search-row search-row-details">
        <label className="search-field">
          <span className="field-label">Journey date</span>
          <span className="date-wrap">
            <CalendarDays size={17} aria-hidden="true" />
            <input
              type="date"
              value={date}
              min={todayISO()}
              onChange={(event) => setDate(event.target.value)}
              aria-label="Journey date"
            />
          </span>
        </label>

        <label className="search-field">
          <span className="field-label">Class</span>
          <span className="select-wrap">
            <select
              value={classType}
              onChange={(event) => setClassType(event.target.value)}
              aria-label="Travel class"
            >
              {CLASS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </span>
        </label>

        <button type="submit" className="btn btn-primary search-cta" disabled={loading || stations.length === 0}>
          {loading ? <span className="spinner" aria-hidden="true" /> : <Search size={18} />}
          {loading ? 'Searching…' : 'Find trains'}
        </button>
      </div>

      {error && <p className="form-error" role="alert">{error}</p>}
    </form>
  )
}
