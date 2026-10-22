import { createDemoBooking, DEMO_STATIONS, demoRoute, demoSearch } from './demo'
import { getTrip, saveTrip } from './storage'
import type {
  BookingRequest,
  BookingResponse,
  Station,
  Ticket,
  TrainRoute,
  TrainSearchResult,
} from '../types'

const API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/+$/, '') ?? '/api'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

let demoMode = false
const demoListeners = new Set<() => void>()

export function isDemoMode(): boolean {
  return demoMode
}

export function subscribeDemoMode(listener: () => void): () => void {
  demoListeners.add(listener)
  return () => {
    demoListeners.delete(listener)
  }
}

function setDemoMode(value: boolean) {
  if (demoMode === value) return
  demoMode = value
  for (const listener of demoListeners) listener()
}

export function retryBackend() {
  setDemoMode(false)
}

function shouldFallBack(error: unknown): boolean {
  return error instanceof ApiError && (error.status === 0 || error.status >= 500)
}

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 10_000)

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      cache: 'no-store',
      ...init,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...init?.headers,
      },
    })

    if (!response.ok) {
      let message = `The reservation server returned ${response.status}`
      try {
        const body = await response.json()
        if (typeof body?.message === 'string') message = body.message
        else if (typeof body?.error === 'string') message = body.error
      } catch {
        // Keep the status-based message for non-JSON error responses.
      }
      throw new ApiError(response.status, message)
    }

    return (await response.json()) as T
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw new ApiError(0, 'Unable to reach the reservation server')
  } finally {
    window.clearTimeout(timeout)
  }
}

export async function getStations(): Promise<Station[]> {
  if (demoMode) return DEMO_STATIONS
  try {
    const stations = await http<Station[]>('/stations')
    if (!Array.isArray(stations) || stations.length === 0) {
      throw new ApiError(404, 'No stations are configured yet')
    }
    return stations
  } catch (error) {
    // An older backend may not expose /api/stations at all. Treat that (and an
    // empty catalogue) as a signal to run the self-contained demo instead.
    if (shouldFallBack(error) || (error instanceof ApiError && error.status === 404)) {
      setDemoMode(true)
      return DEMO_STATIONS
    }
    throw error
  }
}

let stationCache: Promise<Station[]> | null = null

export function loadStations(): Promise<Station[]> {
  if (!stationCache) {
    stationCache = getStations().catch((error) => {
      stationCache = null
      throw error
    })
  }
  return stationCache
}

export async function searchTrains(
  from: number,
  to: number,
  journeyDate: string,
): Promise<TrainSearchResult[]> {
  if (demoMode) return demoSearch(from, to)

  try {
    const query = new URLSearchParams({
      fromStationId: String(from),
      toStationId: String(to),
      journeyDate,
    })
    return await http<TrainSearchResult[]>(`/search?${query.toString()}`)
  } catch (error) {
    if (shouldFallBack(error)) {
      setDemoMode(true)
      return demoSearch(from, to)
    }
    throw error
  }
}

export async function getRoute(trainId: number): Promise<TrainRoute> {
  if (demoMode) return demoRoute(trainId)

  try {
    return await http<TrainRoute>(`/trains/${trainId}/route`)
  } catch (error) {
    if (shouldFallBack(error)) {
      setDemoMode(true)
      return demoRoute(trainId)
    }
    throw error
  }
}

function demoBooking(request: BookingRequest): BookingResponse {
  const { response, ticket } = createDemoBooking(request)
  saveTrip(ticket)
  return response
}

export async function createBooking(request: BookingRequest): Promise<BookingResponse> {
  if (demoMode) return demoBooking(request)

  try {
    return await http<BookingResponse>('/bookings', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  } catch (error) {
    if (shouldFallBack(error)) {
      setDemoMode(true)
      return demoBooking(request)
    }
    throw error
  }
}

export async function getTicket(pnr: string): Promise<Ticket> {
  const normalised = pnr.trim().toUpperCase()
  const stored = getTrip(normalised)

  if (demoMode) {
    if (stored) return stored
    throw new ApiError(404, `No demo ticket found for PNR ${normalised}`)
  }

  try {
    return await http<Ticket>(`/bookings/${encodeURIComponent(normalised)}`)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404 && stored) return stored
    if (shouldFallBack(error)) {
      setDemoMode(true)
      if (stored) return stored
      throw new ApiError(
        404,
        `No demo ticket found for PNR ${normalised}. Only tickets created in this browser can be found while the API is offline.`,
      )
    }
    throw error
  }
}
