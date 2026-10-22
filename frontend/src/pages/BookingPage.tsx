import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  LoaderCircle,
  Lock,
  MapPin,
  ShieldCheck,
  Ticket as TicketIcon,
  TrainFront,
  TriangleAlert,
  UserRound,
} from 'lucide-react'
import { RouteTimeline } from '../components/RouteTimeline'
import { useStations } from '../hooks/useStations'
import { createBooking, getRoute, searchTrains } from '../lib/api'
import {
  availabilityTone,
  classInfo,
  classOrder,
  defaultJourneyDate,
  durationBetween,
  formatDate,
  formatDistance,
  formatTime,
  titleCase,
} from '../lib/format'
import { getTrip, saveTrip } from '../lib/storage'
import type { Ticket, TrainRoute, TrainSearchResult } from '../types'

export function BookingPage() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const { stations, loading: stationsLoading } = useStations()

  const trainId = Number(params.get('train'))
  const fromId = Number(params.get('from'))
  const toId = Number(params.get('to'))
  const date = params.get('date') || defaultJourneyDate()
  const requestedClass = params.get('class') || 'SL'

  const fromStation = stations.find((station) => station.id === fromId)
  const toStation = stations.find((station) => station.id === toId)

  const [train, setTrain] = useState<TrainSearchResult | null>(null)
  const [route, setRoute] = useState<TrainRoute | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedClass, setSelectedClass] = useState(requestedClass)

  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; age?: string }>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showRoute, setShowRoute] = useState(false)

  useEffect(() => {
    if (!fromStation || !toStation || !trainId) {
      setLoading(stationsLoading)
      return
    }

    let active = true
    setLoading(true)
    setError(null)

    searchTrains(fromId, toId, date)
      .then((results) => {
        if (!active) return
        const found = results.find((item) => item.trainId === trainId)
        if (!found) {
          setError('This train no longer runs on the selected stretch. Go back and pick another service.')
          return
        }
        setTrain(found)
        const classes = Object.keys(found.availableSeats).sort((a, b) => classOrder(a) - classOrder(b))
        if (!found.availableSeats[requestedClass] && found.availableSeats[requestedClass] !== 0) {
          setSelectedClass(classes[0] ?? requestedClass)
        }
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : 'Unable to load this train')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [fromStation, toStation, trainId, fromId, toId, date, requestedClass, stationsLoading])

  useEffect(() => {
    if (!train) return
    let active = true
    getRoute(train.trainId)
      .then((result) => {
        if (active) setRoute(result)
      })
      .catch(() => {
        // The route is a nice-to-have; booking should still work without it.
      })
    return () => {
      active = false
    }
  }, [train])

  const classes = useMemo(
    () =>
      train
        ? Object.entries(train.availableSeats).sort(([a], [b]) => classOrder(a) - classOrder(b))
        : [],
    [train],
  )

  const seats = train?.availableSeats[selectedClass] ?? 0
  const selectedMeta = classInfo(selectedClass)
  const duration = train ? durationBetween(train.departureTime, train.arrivalTime) : null

  function pickClass(classType: string) {
    setSelectedClass(classType)
    const next = new URLSearchParams(params)
    next.set('class', classType)
    setParams(next, { replace: true })
  }

  function validate(): boolean {
    const errors: { name?: string; age?: string } = {}
    const trimmed = name.trim()
    if (trimmed.length < 2) errors.name = 'Enter the passenger’s full name.'
    else if (trimmed.length > 100) errors.name = 'Keep the name under 100 characters.'

    const parsedAge = Number(age)
    if (!age || !Number.isFinite(parsedAge)) errors.age = 'Enter the passenger’s age.'
    else if (parsedAge < 1 || parsedAge > 120) errors.age = 'Age must be between 1 and 120.'

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!train || !fromStation || !toStation) return
    if (!validate()) return

    setSubmitting(true)
    setSubmitError(null)

    try {
      const response = await createBooking({
        trainId: train.trainId,
        journeyDate: date,
        classType: selectedClass,
        fromStationId: fromStation.id,
        toStationId: toStation.id,
        passengerName: name.trim(),
        passengerAge: Number(age),
      })

      const ticket: Ticket = {
        pnr: response.pnr,
        status: response.status,
        trainNumber: train.trainNumber,
        trainName: train.trainName,
        trainType: train.trainType,
        journeyDate: date,
        fromCode: fromStation.code,
        fromName: fromStation.name,
        toCode: toStation.code,
        toName: toStation.name,
        departureTime: train.departureTime,
        arrivalTime: train.arrivalTime,
        passengerName: name.trim(),
        passengerAge: Number(age),
        classType: selectedClass,
        coachNumber: response.coachNumber,
        seatNumber: response.seatNumber,
        seatType: null,
        bookedAt: new Date().toISOString(),
      }

      if (!getTrip(response.pnr)) saveTrip(ticket)
      navigate(`/ticket/${response.pnr}?fresh=1`, { state: { ticket }, replace: true })
    } catch (reason) {
      setSubmitError(reason instanceof Error ? reason.message : 'The booking could not be completed.')
    } finally {
      setSubmitting(false)
    }
  }

  if (stationsLoading || (loading && !train && !error)) {
    return (
      <main className="page booking-page">
        <div className="shell booking-loading">
          <LoaderCircle size={22} className="spin" />
          <span>Preparing your reservation…</span>
        </div>
      </main>
    )
  }

  if (!train || !fromStation || !toStation || error) {
    return (
      <main className="page booking-page">
        <div className="shell">
          <div className="state-card">
            <span className="state-icon state-icon-warn"><TriangleAlert size={25} /></span>
            <h2>We can&apos;t open this booking</h2>
            <p>{error ?? 'The journey details are incomplete. Choose a train and try again.'}</p>
            <Link to="/" className="btn btn-dark"><ArrowLeft size={16} /> Back to search</Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="page booking-page">
      <div className="shell">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to={`/search?from=${fromId}&to=${toId}&date=${date}&class=${selectedClass}`}>
            Search results
          </Link>
          <span>/</span>
          <span>Passenger details</span>
        </nav>

        <div className="booking-head">
          <div>
            <span className="eyebrow">Step 2 of 3</span>
            <h1>Review and reserve.</h1>
            <p>One passenger per booking. Your berth is held the moment you confirm.</p>
          </div>
          <div className="booking-progress" aria-hidden="true">
            <span className="is-done" />
            <span className="is-done" />
            <span />
          </div>
        </div>

        <form id="booking-form" className="booking-layout" onSubmit={submit} noValidate>
          <div className="booking-main">
            <section className="panel journey-panel">
              <div className="panel-head">
                <div>
                  <span className="panel-kicker">Your journey</span>
                  <h2>{train.trainName}</h2>
                </div>
                <span className="train-number">{train.trainNumber}</span>
              </div>

              <div className="booking-journey">
                <div className="booking-point">
                  <strong>{formatTime(train.departureTime)}</strong>
                  <span className="booking-station">{fromStation.code}</span>
                  <span>{fromStation.name}</span>
                </div>

                <div className="booking-line">
                  <span>{duration?.label}</span>
                  <span className="booking-rule">
                    <span className="booking-dot" />
                    <span className="booking-dashes" />
                    <TrainFront size={15} />
                    <span className="booking-dashes" />
                    <ArrowRight size={14} />
                  </span>
                  <span>{formatDistance(train.distanceKm)}</span>
                </div>

                <div className="booking-point is-arrival">
                  <strong>{formatTime(train.arrivalTime)}</strong>
                  <span className="booking-station">{toStation.code}</span>
                  <span>{toStation.name}</span>
                </div>
              </div>

              <div className="booking-chips">
                <span className="soft-chip"><CalendarDays size={14} /> {formatDate(date)}</span>
                <span className="soft-chip"><TrainFront size={14} /> {titleCase(train.trainType ?? 'Express')}</span>
                {duration && duration.dayOffset > 0 && (
                  <span className="soft-chip">Arrives next day</span>
                )}
              </div>

              {route && (
                <div className="booking-route">
                  <button
                    type="button"
                    className={`route-toggle ${showRoute ? 'is-open' : ''}`}
                    onClick={() => setShowRoute((value) => !value)}
                    aria-expanded={showRoute}
                  >
                    <MapPin size={15} />
                    {showRoute ? 'Hide stops' : `View all ${route.stops.length} stops`}
                    <ChevronDown size={15} className="route-toggle-chevron" />
                  </button>
                  {showRoute && (
                    <RouteTimeline route={route} fromStationId={fromId} toStationId={toId} />
                  )}
                </div>
              )}
            </section>

            <section className="panel">
              <div className="panel-head">
                <div>
                  <span className="panel-kicker">Choose a class</span>
                  <h2>How would you like to travel?</h2>
                </div>
              </div>

              <div className="class-picker">
                {classes.map(([code, available]) => {
                  const meta = classInfo(code)
                  const tone = availabilityTone(available)
                  const active = selectedClass === code
                  return (
                    <button
                      key={code}
                      type="button"
                      className={`class-pick tone-${tone} ${active ? 'is-selected' : ''}`}
                      onClick={() => pickClass(code)}
                      aria-pressed={active}
                    >
                      <span className="class-pick-top">
                        <span className="class-code">{code}</span>
                        {active && <span className="class-pick-check"><Check size={14} /></span>}
                      </span>
                      <strong>{meta.name}</strong>
                      <small>{meta.blurb}</small>
                      <span className={`class-pick-avail ${tone}`}>
                        {available > 0 ? `${available} available` : 'Waitlist'}
                      </span>
                    </button>
                  )
                })}
              </div>

              {seats === 0 && (
                <div className="notice notice-amber">
                  <TriangleAlert size={17} />
                  <div>
                    <strong>{selectedMeta.name} is currently full.</strong>
                    <p>You can still book; the ticket will be issued with waitlisted status.</p>
                  </div>
                </div>
              )}

              {seats > 0 && seats <= 10 && (
                <div className="notice notice-soft">
                  <Lock size={16} />
                  <p>Only {seats} left in {selectedMeta.name}. Your seat is locked when you confirm.</p>
                </div>
              )}
            </section>

            <section className="panel">
              <div className="panel-head">
                <div>
                  <span className="panel-kicker">Passenger</span>
                  <h2>Who&apos;s travelling?</h2>
                </div>
                <span className="panel-badge"><UserRound size={14} /> 1 traveller</span>
              </div>

              <div className="passenger-grid">
                <label className={`input-field ${fieldErrors.name ? 'has-error' : ''}`}>
                  <span>Full name</span>
                  <input
                    type="text"
                    value={name}
                    autoComplete="name"
                    maxLength={100}
                    placeholder="e.g. Roshan Arora"
                    onChange={(event) => {
                      setName(event.target.value)
                      if (fieldErrors.name) setFieldErrors((current) => ({ ...current, name: undefined }))
                    }}
                    aria-invalid={Boolean(fieldErrors.name)}
                  />
                  {fieldErrors.name && <em>{fieldErrors.name}</em>}
                </label>

                <label className={`input-field input-field-age ${fieldErrors.age ? 'has-error' : ''}`}>
                  <span>Age</span>
                  <input
                    type="number"
                    value={age}
                    min={1}
                    max={120}
                    inputMode="numeric"
                    placeholder="30"
                    onChange={(event) => {
                      setAge(event.target.value)
                      if (fieldErrors.age) setFieldErrors((current) => ({ ...current, age: undefined }))
                    }}
                    aria-invalid={Boolean(fieldErrors.age)}
                  />
                  {fieldErrors.age && <em>{fieldErrors.age}</em>}
                </label>
              </div>

              <p className="form-hint">
                <ShieldCheck size={15} /> Details are only used to issue this PNR. No payment is
                collected in this project build.
              </p>
            </section>

            {submitError && (
              <div className="notice notice-error" role="alert">
                <TriangleAlert size={18} />
                <div>
                  <strong>Booking failed</strong>
                  <p>{submitError}</p>
                </div>
              </div>
            )}
          </div>

          <aside className="booking-side">
            <div className="summary-card">
              <div className="summary-top">
                <span className="summary-label">Reservation summary</span>
                <span className="summary-date">{formatDate(date, false)}</span>
              </div>

              <div className="summary-train">
                <span className="summary-number">{train.trainNumber}</span>
                <div>
                  <strong>{train.trainName}</strong>
                  <small>{titleCase(train.trainType ?? 'Express')}</small>
                </div>
              </div>

              <div className="summary-route">
                <div>
                  <strong>{formatTime(train.departureTime)}</strong>
                  <span>{fromStation.code}</span>
                  <small>{fromStation.city}</small>
                </div>
                <div className="summary-track" aria-hidden="true">
                  <span>{duration?.label}</span>
                  <span className="summary-route-line" />
                </div>
                <div>
                  <strong>{formatTime(train.arrivalTime)}</strong>
                  <span>{toStation.code}</span>
                  <small>{toStation.city}</small>
                </div>
              </div>

              <dl className="summary-list">
                <div>
                  <dt>Class</dt>
                  <dd>{selectedMeta.name} <span>({selectedClass})</span></dd>
                </div>
                <div>
                  <dt>Availability</dt>
                  <dd className={seats > 0 ? 'is-good' : 'is-warn'}>
                    {seats > 0 ? `${seats} seats free` : 'Waitlist'}
                  </dd>
                </div>
                <div>
                  <dt>Distance</dt>
                  <dd>{formatDistance(train.distanceKm)}</dd>
                </div>
                <div>
                  <dt>Passenger</dt>
                  <dd>{name.trim() || 'Not added yet'}</dd>
                </div>
              </dl>

              <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
                {submitting ? <LoaderCircle size={17} className="spin" /> : <TicketIcon size={17} />}
                {submitting ? 'Confirming…' : 'Confirm booking'}
              </button>

              <p className="summary-fine">
                {seats > 0
                  ? 'A seat is assigned at confirmation. Your PNR appears instantly.'
                  : 'You will be waitlisted and notified if a berth opens.'}
              </p>
            </div>
          </aside>
        </form>
      </div>
    </main>
  )
}
