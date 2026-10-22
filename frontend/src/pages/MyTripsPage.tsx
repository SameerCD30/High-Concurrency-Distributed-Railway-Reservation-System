import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Info,
  Ticket as TicketIcon,
  TrainFront,
  Trash2,
} from 'lucide-react'
import { PnrLookup } from '../components/PnrLookup'
import { StatusChip } from '../components/StatusChip'
import { formatDate, formatTime, relativeDateLabel } from '../lib/format'
import { getTrips, removeTrip } from '../lib/storage'

export function MyTripsPage() {
  const [trips, setTrips] = useState(() => getTrips())
  const [pendingRemove, setPendingRemove] = useState<string | null>(null)

  function remove(pnr: string) {
    setTrips(removeTrip(pnr))
    setPendingRemove(null)
  }

  return (
    <main className="page trips-page">
      <div className="shell">
        <div className="page-head">
          <div>
            <span className="eyebrow">Saved on this device</span>
            <h1>My trips.</h1>
            <p>
              Every PNR booked from this browser, ready when you are. Tickets live locally — no
              account needed.
            </p>
          </div>
          <Link to="/" className="btn btn-dark">Book a journey <ArrowRight size={16} /></Link>
        </div>

        <div className="trips-layout">
          <section className="trips-main" aria-live="polite">
            {trips.length === 0 ? (
              <div className="state-card trips-empty">
                <span className="state-icon"><TicketIcon size={26} /></span>
                <h2>No journeys yet</h2>
                <p>Once you confirm a booking, the ticket will be waiting here.</p>
                <Link to="/" className="btn btn-primary">Find your first train <ArrowRight size={16} /></Link>
              </div>
            ) : (
              <>
                <div className="trips-summary">
                  <span>{trips.length} saved ticket{trips.length === 1 ? '' : 's'}</span>
                  <span className="trips-summary-note">Newest first</span>
                </div>

                <ul className="trip-list">
                  {trips.map((trip) => (
                    <li key={trip.pnr} className="trip-card">
                      <div className="trip-card-top">
                        <span className="trip-pnr mono">{trip.pnr}</span>
                        <StatusChip status={trip.status} />
                        <span className="trip-date">
                          <CalendarDays size={14} /> {formatDate(trip.journeyDate, false)}
                          <em>{relativeDateLabel(trip.journeyDate)}</em>
                        </span>
                      </div>

                      <div className="trip-card-body">
                        <div className="trip-route">
                          <div>
                            <strong>{formatTime(trip.departureTime)}</strong>
                            <span>{trip.fromCode}</span>
                            <small>{trip.fromName}</small>
                          </div>
                          <div className="trip-route-line" aria-hidden="true">
                            <TrainFront size={14} />
                            <span />
                            <ChevronRight size={14} />
                          </div>
                          <div>
                            <strong>{formatTime(trip.arrivalTime)}</strong>
                            <span>{trip.toCode}</span>
                            <small>{trip.toName}</small>
                          </div>
                        </div>

                        <div className="trip-facts">
                          <span>{trip.trainNumber} · {trip.trainName}</span>
                          <span>
                            {trip.passengerName} · {trip.classType ?? '—'}
                            {trip.status === 'CONFIRMED'
                              ? ` · ${trip.coachNumber ?? '—'}/${trip.seatNumber ?? '—'}`
                              : ' · Waitlisted'}
                          </span>
                        </div>

                        <div className="trip-card-actions">
                          <Link to={`/ticket/${trip.pnr}`} className="btn btn-ghost btn-sm">
                            View ticket <ArrowRight size={14} />
                          </Link>
                          <button
                            type="button"
                            className={`btn btn-sm trip-remove ${pendingRemove === trip.pnr ? 'is-confirming' : ''}`}
                            onClick={() =>
                              pendingRemove === trip.pnr ? remove(trip.pnr) : setPendingRemove(trip.pnr)
                            }
                            onBlur={() => setPendingRemove(null)}
                          >
                            <Trash2 size={14} />
                            {pendingRemove === trip.pnr ? 'Confirm remove' : 'Remove'}
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>

          <aside className="trips-aside">
            <div className="aside-card">
              <span className="panel-kicker">Another journey?</span>
              <h2>Check a PNR</h2>
              <p>Look up any reservation slip by its PNR — even one saved on another route.</p>
              <PnrLookup label="PNR number" />
            </div>

            <div className="aside-note">
              <Info size={16} />
              <p>
                Trips are stored in this browser&apos;s local storage. Clearing site data removes
                them; the live database still holds the booking.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
