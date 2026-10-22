import { useEffect, useState } from 'react'
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Copy,
  Info,
  LoaderCircle,
  Printer,
  SearchX,
  Ticket as TicketIcon,
  TrainFront,
  TriangleAlert,
  UserRound,
} from 'lucide-react'
import { PnrLookup } from '../components/PnrLookup'
import { StatusChip } from '../components/StatusChip'
import { getTicket } from '../lib/api'
import {
  classInfo,
  durationBetween,
  formatDate,
  formatTime,
  titleCase,
} from '../lib/format'
import { getTrip, getTrips, saveTrip } from '../lib/storage'
import type { Ticket } from '../types'

export function TicketPage() {
  const { pnr } = useParams<{ pnr?: string }>()
  const [params] = useSearchParams()
  const location = useLocation()
  const fresh = params.get('fresh') === '1'

  const stateTicket = (location.state as { ticket?: Ticket } | null)?.ticket
  const [ticket, setTicket] = useState<Ticket | null>(() => stateTicket ?? (pnr ? getTrip(pnr) ?? null : null))
  const [loading, setLoading] = useState(Boolean(pnr && !stateTicket))
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!pnr) return
    let active = true
    setLoading(true)
    setError(null)

    getTicket(pnr)
      .then((result) => {
        if (!active) return
        setTicket(result)
        saveTrip(result)
      })
      .catch((reason: unknown) => {
        if (!active) return
        const stored = getTrip(pnr)
        if (stored) setTicket(stored)
        else setError(reason instanceof Error ? reason.message : 'Unable to load this ticket')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [pnr])

  useEffect(() => {
    setTicket(stateTicket ?? (pnr ? getTrip(pnr) ?? null : null))
  }, [pnr, stateTicket])

  async function copyPnr() {
    if (!ticket) return
    try {
      await navigator.clipboard.writeText(ticket.pnr)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  if (!pnr) {
    return <PnrLanding />
  }

  if (loading && !ticket) {
    return (
      <main className="page ticket-page">
        <div className="shell ticket-loading">
          <LoaderCircle size={22} className="spin" />
          <span>Fetching your PNR…</span>
        </div>
      </main>
    )
  }

  if (!ticket) {
    return (
      <main className="page ticket-page">
        <div className="shell ticket-narrow">
          <div className="state-card">
            <span className="state-icon"><SearchX size={26} /></span>
            <h2>No ticket found for {pnr.toUpperCase()}</h2>
            <p>{error ?? 'Check the PNR and try again.'}</p>
            <div className="ticket-notfound-lookup">
              <PnrLookup initial={pnr} />
            </div>
            <Link to="/" className="text-link"><ArrowLeft size={15} /> Start a new search</Link>
          </div>
        </div>
      </main>
    )
  }

  const duration = durationBetween(ticket.departureTime, ticket.arrivalTime)
  const meta = ticket.classType ? classInfo(ticket.classType) : null
  const waitlisted = ticket.status === 'WAITLISTED'

  return (
    <main className="page ticket-page">
      <div className="shell ticket-narrow">
        <div className="ticket-actions">
          <Link to="/trips" className="text-link"><ArrowLeft size={15} /> My trips</Link>
          <div className="ticket-action-buttons">
            <button type="button" className="btn btn-ghost btn-sm" onClick={copyPnr}>
              {copied ? <Check size={15} /> : <Copy size={15} />}
              {copied ? 'Copied' : 'Copy PNR'}
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => window.print()}>
              <Printer size={15} /> Print
            </button>
          </div>
        </div>

        {fresh && (
          <div className="success-ribbon">
            <span className="success-icon"><Check size={18} strokeWidth={3} /></span>
            <div>
              <strong>{waitlisted ? 'You’re on the waitlist.' : 'Your seat is booked.'}</strong>
              <p>
                PNR <span className="mono">{ticket.pnr}</span> · {ticket.trainNumber} {ticket.trainName}
              </p>
            </div>
            <Link to="/" className="success-link">Book another <ArrowRight size={15} /></Link>
          </div>
        )}

        <article className="ticket" aria-label="Railway ticket">
          <header className="ticket-header">
            <div className="ticket-brand">
              <span className="ticket-brand-mark" aria-hidden="true">
                <svg viewBox="0 0 36 36" role="presentation">
                  <path d="M12 26V10M24 26V10" />
                  <path d="M12 15h12M12 21h12" />
                  <circle cx="18" cy="7.5" r="2.1" />
                </svg>
              </span>
              <div>
                <strong>Safar</strong>
                <small>Electronic reservation slip</small>
              </div>
            </div>

            <div className="ticket-pnr">
              <span>PNR</span>
              <strong>{ticket.pnr}</strong>
            </div>

            <StatusChip status={ticket.status} large />
          </header>

          <div className="ticket-journey">
            <div className="ticket-stop">
              <span className="ticket-time">{formatTime(ticket.departureTime)}</span>
              <span className="ticket-code">{ticket.fromCode}</span>
              <span className="ticket-city">{ticket.fromName}</span>
            </div>

            <div className="ticket-connector">
              <span className="ticket-train"><TrainFront size={14} /> {ticket.trainNumber} · {titleCase(ticket.trainType ?? 'Express')}</span>
              <span className="ticket-line"><span className="ticket-line-dot" /></span>
              <span className="ticket-duration">{duration.label}{duration.dayOffset ? ' · next day' : ''}</span>
            </div>

            <div className="ticket-stop is-arrival">
              <span className="ticket-time">{formatTime(ticket.arrivalTime)}</span>
              <span className="ticket-code">{ticket.toCode}</span>
              <span className="ticket-city">{ticket.toName}</span>
            </div>
          </div>

          <div className="ticket-perforation" aria-hidden="true">
            <span className="ticket-notch left" />
            <span className="ticket-dashes" />
            <span className="ticket-notch right" />
          </div>

          <div className="ticket-body">
            <div className={`seat-block ${waitlisted ? 'is-waitlisted' : ''}`}>
              <span className="seat-label">Coach / Seat</span>
              <strong>{waitlisted ? 'WL' : `${ticket.coachNumber ?? '—'} / ${ticket.seatNumber ?? '—'}`}</strong>
              <small>
                {waitlisted
                  ? 'Waitlisted · seat at allotment'
                  : ticket.seatType
                    ? titleCase(ticket.seatType)
                    : 'Confirmed berth'}
              </small>
            </div>

            <dl className="ticket-details">
              <div>
                <dt><UserRound size={13} /> Passenger</dt>
                <dd>{ticket.passengerName}</dd>
              </div>
              <div>
                <dt>Age</dt>
                <dd>{ticket.passengerAge}</dd>
              </div>
              <div>
                <dt>Class</dt>
                <dd>{meta ? `${meta.name} (${meta.code})` : '—'}</dd>
              </div>
              <div>
                <dt>Train</dt>
                <dd>{ticket.trainNumber} · {ticket.trainName}</dd>
              </div>
              <div>
                <dt><CalendarDays size={13} /> Journey date</dt>
                <dd>{formatDate(ticket.journeyDate)}</dd>
              </div>
              <div>
                <dt>Booked</dt>
                <dd>
                  {ticket.bookedAt
                    ? new Date(ticket.bookedAt).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Just now'}
                </dd>
              </div>
            </dl>
          </div>

          <footer className="ticket-footer">
            <div className="ticket-barcode" aria-hidden="true" />
            <div className="ticket-footer-copy">
              <p>
                <Info size={13} /> Carry a valid photo ID. Board at {ticket.fromName} before departure.
              </p>
              <span>This reservation slip is issued by the Safar demo build · no fare collected</span>
            </div>
          </footer>
        </article>

        <div className="ticket-below">
          {waitlisted ? (
            <div className="notice notice-amber">
              <TriangleAlert size={17} />
              <div>
                <strong>You&apos;re on the waitlist.</strong>
                <p>Seats are assigned in PNR order when a berth is released. Keep this PNR handy.</p>
              </div>
            </div>
          ) : (
            <div className="notice notice-soft">
              <TicketIcon size={16} />
              <p>Your berth is confirmed for this segment. The ticket is saved on this device.</p>
            </div>
          )}

          <div className="ticket-below-actions">
            <Link to="/trips" className="btn btn-dark">View all trips</Link>
            <Link to="/" className="btn btn-ghost">Book another journey <ArrowRight size={16} /></Link>
          </div>
        </div>
      </div>
    </main>
  )
}

function PnrLanding() {
  const trips = getTrips().slice(0, 3)

  return (
    <main className="page lookup-page">
      <div className="shell lookup-grid">
        <div className="lookup-copy">
          <span className="eyebrow">PNR status</span>
          <h1>Find your seat.</h1>
          <p>
            Enter the PNR printed on your reservation slip. We&apos;ll pull up the journey,
            coach and berth details.
          </p>

          <PnrLookup autoFocus />

          <p className="lookup-fine">
            Tickets are stored in this browser. Nothing is shared with a booking partner.
          </p>
        </div>

        <aside className="lookup-aside">
          <div className="lookup-aside-head">
            <h2>Recent bookings</h2>
            <Link to="/trips" className="text-link">View all <ArrowRight size={14} /></Link>
          </div>

          {trips.length === 0 ? (
            <div className="lookup-empty">
              <span className="state-icon"><TicketIcon size={22} /></span>
              <p>No tickets yet. Your next journey can start with a quick search.</p>
              <Link to="/" className="btn btn-ghost btn-sm">Search trains</Link>
            </div>
          ) : (
            <ul className="mini-tickets">
              {trips.map((trip) => (
                <li key={trip.pnr}>
                  <Link to={`/ticket/${trip.pnr}`} className="mini-ticket">
                    <div className="mini-ticket-top">
                      <span className="mono">{trip.pnr}</span>
                      <StatusChip status={trip.status} />
                    </div>
                    <div className="mini-ticket-route">
                      <span>{trip.fromCode}</span>
                      <span className="mini-rule" />
                      <span>{trip.toCode}</span>
                    </div>
                    <div className="mini-ticket-meta">
                      <span>{trip.trainNumber} · {trip.trainName}</span>
                      <span>{formatDate(trip.journeyDate, false)}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </main>
  )
}
