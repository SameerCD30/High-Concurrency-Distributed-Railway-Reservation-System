import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ChevronDown, CircleDot, LoaderCircle, Route, TriangleAlert } from 'lucide-react'
import { RouteTimeline } from './RouteTimeline'
import { getRoute } from '../lib/api'
import {
  availabilityTone,
  classInfo,
  classOrder,
  durationBetween,
  formatDistance,
  formatTime,
  titleCase,
} from '../lib/format'
import type { SearchQuery, Station, TrainRoute, TrainSearchResult } from '../types'

interface Props {
  train: TrainSearchResult
  from: Station
  to: Station
  query: SearchQuery
}

export function TrainCard({ train, from, to, query }: Props) {
  const navigate = useNavigate()
  const [showRoute, setShowRoute] = useState(false)
  const [route, setRoute] = useState<TrainRoute | null>(null)
  const [routeLoading, setRouteLoading] = useState(false)
  const [routeError, setRouteError] = useState<string | null>(null)

  const duration = durationBetween(train.departureTime, train.arrivalTime)
  const classes = Object.entries(train.availableSeats)
    .sort(([a], [b]) => classOrder(a) - classOrder(b))

  function book(classType: string) {
    const params = new URLSearchParams({
      train: String(train.trainId),
      from: String(from.id),
      to: String(to.id),
      date: query.date,
      class: classType,
    })
    navigate(`/book?${params.toString()}`)
  }

  async function toggleRoute() {
    const next = !showRoute
    setShowRoute(next)
    if (!next || route || routeLoading) return

    setRouteLoading(true)
    setRouteError(null)
    try {
      setRoute(await getRoute(train.trainId))
    } catch (error) {
      setRouteError(error instanceof Error ? error.message : 'Could not load the route')
    } finally {
      setRouteLoading(false)
    }
  }

  return (
    <article className="train-card">
      <div className="train-main">
        <div className="train-heading">
          <span className="train-number">{train.trainNumber}</span>
          <div className="train-title">
            <h3>{train.trainName}</h3>
            <span className="train-type">{titleCase(train.trainType ?? 'Express')}</span>
          </div>
          <span className="train-distance">{formatDistance(train.distanceKm)}</span>
        </div>

        <div className="train-journey">
          <div className="journey-point">
            <strong>{formatTime(train.departureTime)}</strong>
            <span>{from.code} · {from.name}</span>
          </div>

          <div className="journey-line">
            <span className="journey-duration">{duration.label}</span>
            <span className="journey-track" aria-hidden="true">
              <CircleDot size={13} />
              <span className="journey-rule" />
              <ArrowRight size={13} />
            </span>
            <span className="journey-note">
              {duration.dayOffset > 0 ? `Arrives next day · ${formatTime(train.arrivalTime)}` : 'Same-day arrival'}
            </span>
          </div>

          <div className="journey-point is-arrival">
            <strong>{formatTime(train.arrivalTime)}</strong>
            <span>{to.code} · {to.name}</span>
          </div>
        </div>

        <button
          type="button"
          className={`route-toggle ${showRoute ? 'is-open' : ''}`}
          onClick={toggleRoute}
          aria-expanded={showRoute}
        >
          <Route size={15} />
          {showRoute ? 'Hide route & stops' : 'View route & stops'}
          <ChevronDown size={15} className="route-toggle-chevron" />
        </button>

        {showRoute && (
          <div className="route-panel">
            {routeLoading && (
              <p className="route-loading"><LoaderCircle size={16} className="spin" /> Loading the full route…</p>
            )}
            {routeError && (
              <p className="route-error">
                <TriangleAlert size={15} /> {routeError}
                <button type="button" onClick={() => { setRoute(null); setShowRoute(false); }}>Close</button>
              </p>
            )}
            {route && <RouteTimeline route={route} fromStationId={from.id} toStationId={to.id} />}
          </div>
        )}
      </div>

      <div className="train-classes">
        <div className="classes-head">
          <span>Select class</span>
          <span className="classes-note">Live availability</span>
        </div>

        <div className="class-grid">
          {classes.map(([code, seats]) => {
            const info = classInfo(code)
            const tone = availabilityTone(seats)
            return (
              <button
                key={code}
                type="button"
                className={`class-option tone-${tone}`}
                onClick={() => book(code)}
                aria-label={`${info.name}, ${seats > 0 ? `${seats} seats available` : 'waitlist'}. Continue to book`}
              >
                <span className="class-code">{code}</span>
                <span className="class-body">
                  <strong>{info.name}</strong>
                  <small>
                    {seats > 0
                      ? `${seats} seat${seats === 1 ? '' : 's'} available`
                      : 'Waitlist · book to join'}
                  </small>
                </span>
                <span className="class-avail">
                  {seats > 0 ? (
                    <span className="avail-count">{seats}</span>
                  ) : (
                    <span className="avail-wl">WL</span>
                  )}
                </span>
              </button>
            )
          })}
        </div>

        <p className="classes-footnote">
          Availability reflects live seat-level inventory for your exact segment.
        </p>
      </div>
    </article>
  )
}
