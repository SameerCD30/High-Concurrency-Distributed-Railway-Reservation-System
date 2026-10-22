import type { StoredTrip, Ticket } from '../types'

const TRIPS_KEY = 'safar.trips.v1'

export function getTrips(): StoredTrip[] {
  try {
    const raw = window.localStorage.getItem(TRIPS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((trip) => typeof trip?.pnr === 'string')
  } catch {
    return []
  }
}

export function getTrip(pnr: string): StoredTrip | undefined {
  const normalised = pnr.trim().toUpperCase()
  return getTrips().find((trip) => trip.pnr.toUpperCase() === normalised)
}

export function saveTrip(ticket: Ticket): StoredTrip {
  const trip: StoredTrip = { ...ticket, savedAt: new Date().toISOString() }
  const remaining = getTrips().filter((item) => item.pnr !== trip.pnr)
  const next = [trip, ...remaining].slice(0, 50)
  try {
    window.localStorage.setItem(TRIPS_KEY, JSON.stringify(next))
  } catch {
    // Storage can be unavailable in private mode — the ticket still works for this session.
  }
  return trip
}

export function removeTrip(pnr: string): StoredTrip[] {
  const next = getTrips().filter((trip) => trip.pnr !== pnr)
  try {
    window.localStorage.setItem(TRIPS_KEY, JSON.stringify(next))
  } catch {
    // Ignore storage failures.
  }
  return next
}
