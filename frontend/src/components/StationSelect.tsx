import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { Check, ChevronsUpDown, Search } from 'lucide-react'
import type { Station } from '../types'

interface Props {
  stations: Station[]
  value: number | null
  onChange: (id: number) => void
  label: string
  placeholder?: string
  excludeId?: number | null
  disabled?: boolean
}

export function StationSelect({
  stations,
  value,
  onChange,
  label,
  placeholder = 'Select a station',
  excludeId,
  disabled,
}: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listId = useId()

  const selected = stations.find((station) => station.id === value)

  const options = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return stations.filter((station) => {
      if (station.id === excludeId) return false
      if (!needle) return true
      return `${station.code} ${station.name} ${station.city} ${station.state}`
        .toLowerCase()
        .includes(needle)
    })
  }, [stations, query, excludeId])

  useEffect(() => {
    if (!open) return
    setQuery('')
    setActiveIndex(0)
    const timer = window.setTimeout(() => inputRef.current?.focus(), 30)
    return () => window.clearTimeout(timer)
  }, [open])

  useEffect(() => {
    function handlePointer(event: MouseEvent | TouchEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handlePointer)
    document.addEventListener('touchstart', handlePointer)
    return () => {
      document.removeEventListener('mousedown', handlePointer)
      document.removeEventListener('touchstart', handlePointer)
    }
  }, [])

  function choose(station: Station) {
    onChange(station.id)
    setOpen(false)
    buttonRef.current?.focus()
  }

  function handleSearchKeys(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((index) => Math.min(index + 1, options.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => Math.max(index - 1, 0))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const station = options[activeIndex]
      if (station) choose(station)
    } else if (event.key === 'Escape') {
      event.preventDefault()
      setOpen(false)
      buttonRef.current?.focus()
    }
  }

  return (
    <div className="station-select" ref={rootRef}>
      <span className="field-label" id={`${listId}-label`}>{label}</span>
      <button
        ref={buttonRef}
        type="button"
        className={`station-trigger ${open ? 'is-open' : ''} ${selected ? 'has-value' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={`${listId}-label`}
        disabled={disabled}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            setOpen(true)
          }
        }}
      >
        {selected ? (
          <span className="station-value">
            <span className="station-code">{selected.code}</span>
            <span className="station-text">
              <strong>{selected.name}</strong>
              <small>{selected.city}</small>
            </span>
          </span>
        ) : (
          <span className="station-placeholder">{stations.length ? placeholder : 'Loading stations…'}</span>
        )}
        <ChevronsUpDown size={17} className="station-chevron" aria-hidden="true" />
      </button>

      {open && (
        <div className="station-popover">
          <div className="station-search">
            <Search size={16} aria-hidden="true" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              placeholder="Search by city, name or code"
              aria-label={`Search ${label.toLowerCase()} station`}
              aria-controls={listId}
              aria-activedescendant={options[activeIndex] ? `${listId}-${options[activeIndex].id}` : undefined}
              onChange={(event) => {
                setQuery(event.target.value)
                setActiveIndex(0)
              }}
              onKeyDown={handleSearchKeys}
            />
          </div>

          <ul className="station-list" role="listbox" id={listId} aria-labelledby={`${listId}-label`}>
            {options.map((station, index) => (
              <li key={station.id} role="none">
                <button
                  type="button"
                  id={`${listId}-${station.id}`}
                  role="option"
                  aria-selected={station.id === value}
                  className={`station-option ${index === activeIndex ? 'is-active' : ''}`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => choose(station)}
                >
                  <span className="station-code">{station.code}</span>
                  <span className="station-text">
                    <strong>{station.name}</strong>
                    <small>{station.city}, {station.state}</small>
                  </span>
                  {station.id === value && <Check size={16} className="station-check" />}
                </button>
              </li>
            ))}
            {options.length === 0 && (
              <li className="station-empty">No stations match “{query}”.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
