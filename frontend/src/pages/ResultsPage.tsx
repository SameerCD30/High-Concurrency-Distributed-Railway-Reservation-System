import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  Filter,
  LoaderCircle,
  RefreshCw,
  SearchX,
  SlidersHorizontal,
  TrainFront,
  TriangleAlert,
} from 'lucide-react'
import { SearchForm } from '../components/SearchForm'
import { TrainCard } from '../components/TrainCard'
import { useDemoMode } from '../hooks/useDemoMode'
import { useStations } from '../hooks/useStations'
import { searchTrains } from '../lib/api'
import {
  defaultJourneyDate,
  durationInMinutes,
  formatDate,
  formatTime,
  relativeDateLabel,
} from '../lib/format'
import type { SearchQuery, TrainSearchResult } from '../types'

const PERIODS = [
  { id: 'early', label: 'Before 06:00', test: (hour: number) => hour < 6 },
  { id: 'morning', label: '06:00 – 12:00', test: (hour: number) => hour >= 6 && hour < 12 },
  { id: 'afternoon', label: '12:00 – 18:00', test: (hour: number) => hour >= 12 && hour < 18 },
  { id: 'evening', label: 'After 18:00', test: (hour: number) => hour >= 18 },
]

type SortKey = 'departure' | 'arrival' | 'duration'

export function ResultsPage() {
  const [params, setParams] = useSearchParams()
  const { stations, loading: stationsLoading, error: stationsError } = useStations()
  const demo = useDemoMode()

  const fromId = Number(params.get('from'))
  const toId = Number(params.get('to'))
  const date = params.get('date') || defaultJourneyDate()
  const classType = params.get('class') || 'SL'

  const query: SearchQuery = { from: fromId, to: toId, date, classType }
  const fromStation = stations.find((station) => station.id === fromId)
  const toStation = stations.find((station) => station.id === toId)

  const [trains, setTrains] = useState<TrainSearchResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [modifyOpen, setModifyOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [periods, setPeriods] = useState<string[]>([])
  const [sortKey, setSortKey] = useState<SortKey>('departure')

  useEffect(() => {
    if (!fromStation || !toStation) return
    if (fromId === toId) {
      setTrains([])
      setLoading(false)
      setError(null)
      return
    }

    let active = true
    setLoading(true)
    setError(null)

    searchTrains(fromId, toId, date)
      .then((result) => {
        if (active) setTrains(result)
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : 'Unable to search trains')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [fromId, toId, date, fromStation, toStation, reloadKey])

  const visibleTrains = useMemo(() => {
    const filtered = trains.filter((train) => {
      if (!periods.length) return true
      const hour = Number(formatTime(train.departureTime).slice(0, 2))
      return periods.some((id) => PERIODS.find((period) => period.id === id)?.test(hour))
    })

    return [...filtered].sort((a, b) => {
      if (sortKey === 'arrival') return formatTime(a.arrivalTime).localeCompare(formatTime(b.arrivalTime))
      if (sortKey === 'duration') {
        return (
          durationInMinutes(a.departureTime, a.arrivalTime) -
          durationInMinutes(b.departureTime, b.arrivalTime)
        )
      }
      return formatTime(a.departureTime).localeCompare(formatTime(b.departureTime))
    })
  }, [trains, periods, sortKey])

  function updateSearch(next: SearchQuery) {
    setParams(
      {
        from: String(next.from),
        to: String(next.to),
        date: next.date,
        class: next.classType,
      },
      { replace: true },
    )
    setModifyOpen(false)
  }

  function togglePeriod(id: string) {
    setPeriods((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    )
  }

  const suggested = stations.filter((station) => ['NDLS', 'HWH'].includes(station.code))

  return (
    <main className="page results-page">
      <div className="shell">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span>Train results</span>
        </nav>

        <div className="results-bar">
          <div className="results-route">
            <span className="results-code">{fromStation?.code ?? '—'}</span>
            <span className="results-arrow" aria-hidden="true"><span /><ArrowRight size={15} /></span>
            <span className="results-code">{toStation?.code ?? '—'}</span>
            <span className="results-names">
              {fromStation?.name ?? 'Boarding'} → {toStation?.name ?? 'Destination'}
            </span>
          </div>

          <div className="results-meta">
            <span><CalendarDays size={15} /> {formatDate(date)}</span>
            <span className="results-date-note">{relativeDateLabel(date)}</span>
          </div>

          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setModifyOpen((value) => !value)}
            aria-expanded={modifyOpen}
          >
            <SlidersHorizontal size={15} /> Modify search
            <ChevronDown size={14} className={modifyOpen ? 'rotate-180' : ''} />
          </button>
        </div>

        {modifyOpen && (
          <div className="modify-panel">
            <SearchForm stations={stations} initial={query} onSubmit={updateSearch} />
          </div>
        )}

        <div className="results-layout">
          <aside className={`filters ${filtersOpen ? 'is-open' : ''}`}>
            <div className="filters-head">
              <h2><Filter size={16} /> Refine</h2>
              <div className="filters-head-actions">
                {periods.length > 0 && (
                  <button type="button" className="text-btn" onClick={() => setPeriods([])}>Clear</button>
                )}
                <button
                  type="button"
                  className="filters-toggle"
                  onClick={() => setFiltersOpen((value) => !value)}
                  aria-expanded={filtersOpen}
                >
                  {filtersOpen ? 'Hide' : 'Filters'}
                  <ChevronDown size={13} className={filtersOpen ? 'rotate-180' : ''} />
                </button>
              </div>
            </div>

            <fieldset className="filter-group">
              <legend>Departure window</legend>
              {PERIODS.map((period) => (
                <label key={period.id} className={`filter-check ${periods.includes(period.id) ? 'is-checked' : ''}`}>
                  <input
                    type="checkbox"
                    checked={periods.includes(period.id)}
                    onChange={() => togglePeriod(period.id)}
                  />
                  <span className="filter-box" aria-hidden="true" />
                  {period.label}
                </label>
              ))}
            </fieldset>

            <div className="filter-group filter-static">
              <span className="filter-legend">Inventory</span>
              <p>
                Seat counts are calculated for the exact boarding and destination sequence you
                selected.
              </p>
              <span className="filter-pill"><TrainFront size={13} /> {trains.length} direct service{trains.length === 1 ? '' : 's'}</span>
            </div>

            <div className="filter-note">
              <strong>Good to know</strong>
              <p>A waitlisted class can still be booked. You&apos;ll see WL on your ticket.</p>
            </div>
          </aside>

          <section className="results-main" aria-live="polite">
            <div className="results-head">
              <div>
                <h1>
                  {loading
                    ? 'Finding your train…'
                    : `${visibleTrains.length} train${visibleTrains.length === 1 ? '' : 's'} found`}
                </h1>
                <p>
                  {fromStation?.city ?? '—'} to {toStation?.city ?? '—'} · {formatDate(date, false)}
                </p>
              </div>

              <label className="sort-control">
                <span>Sort by</span>
                <select value={sortKey} onChange={(event) => setSortKey(event.target.value as SortKey)}>
                  <option value="departure">Departure</option>
                  <option value="arrival">Arrival</option>
                  <option value="duration">Duration</option>
                </select>
              </label>
            </div>

            {demo && (
              <div className="inline-note">
                <span className="inline-note-dot" />
                Sample timetable active — the live API could not be reached.
              </div>
            )}

            {stationsLoading && (
              <div className="skeleton-stack" aria-label="Loading">
                <div className="skeleton-card" />
                <div className="skeleton-card" />
              </div>
            )}

            {!stationsLoading && stationsError && (
              <div className="state-card">
                <span className="state-icon"><TriangleAlert size={24} /></span>
                <h2>Stations couldn&apos;t be loaded</h2>
                <p>{stationsError}</p>
                <button type="button" className="btn btn-dark" onClick={() => window.location.reload()}>
                  <RefreshCw size={16} /> Retry
                </button>
              </div>
            )}

            {!stationsLoading && !stationsError && loading && (
              <div className="skeleton-stack" aria-label="Loading trains">
                <div className="skeleton-card" />
                <div className="skeleton-card" />
              </div>
            )}

            {!stationsLoading && !stationsError && !loading && error && (
              <div className="state-card">
                <span className="state-icon state-icon-warn"><TriangleAlert size={24} /></span>
                <h2>We couldn&apos;t load trains</h2>
                <p>{error}</p>
                <div className="state-actions">
                  <button type="button" className="btn btn-dark" onClick={() => setReloadKey((key) => key + 1)}>
                    <RefreshCw size={16} /> Try again
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => setModifyOpen(true)}>
                    Change search
                  </button>
                </div>
              </div>
            )}

            {!stationsLoading && !stationsError && !loading && !error && visibleTrains.length === 0 && (
              <div className="state-card">
                <span className="state-icon"><SearchX size={26} /></span>
                <h2>{trains.length ? 'No trains match these filters' : 'No direct trains on this stretch'}</h2>
                <p>
                  {trains.length
                    ? 'Try clearing the departure window, or widen your search.'
                    : 'This demo has a small seeded timetable. Try the Rajdhani corridor between New Delhi and Howrah.'}
                </p>
                <div className="state-actions">
                  {trains.length ? (
                    <button type="button" className="btn btn-dark" onClick={() => setPeriods([])}>
                      Clear filters
                    </button>
                  ) : (
                    suggested.length === 2 && (
                      <button
                        type="button"
                        className="btn btn-dark"
                        onClick={() => updateSearch({ ...query, from: suggested[0].id, to: suggested[1].id })}
                      >
                        Try {suggested[1].code} → {suggested[0].code}
                      </button>
                    )
                  )}
                  <button type="button" className="btn btn-ghost" onClick={() => setModifyOpen(true)}>
                    <SlidersHorizontal size={16} /> Modify search
                  </button>
                </div>
              </div>
            )}

            {!stationsLoading && !error && !loading && fromStation && toStation && visibleTrains.length > 0 && (
              <div className="train-stack">
                {visibleTrains.map((train) => (
                  <TrainCard
                    key={train.trainId}
                    train={train}
                    from={fromStation}
                    to={toStation}
                    query={query}
                  />
                ))}
              </div>
            )}

            {loading && !stationsLoading && (
              <p className="results-hint"><LoaderCircle size={14} className="spin" /> Checking live inventory…</p>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}
