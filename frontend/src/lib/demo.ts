import type {
  BookingRequest,
  BookingResponse,
  Station,
  Ticket,
  TrainRoute,
  TrainSearchResult,
  TrainStop,
} from '../types'
import { durationBetween, formatDistance } from './format'

export const DEMO_STATIONS: Station[] = [
  { id: 1, code: 'NDLS', name: 'New Delhi', city: 'Delhi', state: 'Delhi' },
  { id: 2, code: 'CNB', name: 'Kanpur Central', city: 'Kanpur', state: 'Uttar Pradesh' },
  { id: 3, code: 'PNBE', name: 'Patna Junction', city: 'Patna', state: 'Bihar' },
  { id: 4, code: 'HWH', name: 'Howrah Junction', city: 'Kolkata', state: 'West Bengal' },
].sort((a, b) => a.name.localeCompare(b.name))

interface DemoTrain {
  trainId: number
  trainNumber: string
  trainName: string
  trainType: string
  stops: TrainStop[]
  baseAvailability: Record<string, number>
}

function stop(
  station: Station,
  sequenceNo: number,
  arrivalTime: string | null,
  departureTime: string | null,
  dayOffset: number,
  distanceKm: number,
): TrainStop {
  return {
    stationId: station.id,
    stationCode: station.code,
    stationName: station.name,
    city: station.city,
    sequenceNo,
    arrivalTime,
    departureTime,
    dayOffset,
    distanceKm,
  }
}

const [howrah, kanpur, newDelhi, patna] = [
  DEMO_STATIONS.find((s) => s.code === 'HWH')!,
  DEMO_STATIONS.find((s) => s.code === 'CNB')!,
  DEMO_STATIONS.find((s) => s.code === 'NDLS')!,
  DEMO_STATIONS.find((s) => s.code === 'PNBE')!,
]

const UP: TrainStop[] = [
  stop(newDelhi, 1, null, '16:55:00', 0, 0),
  stop(kanpur, 2, '21:30:00', '21:35:00', 0, 440),
  stop(patna, 3, '04:00:00', '04:10:00', 1, 990),
  stop(howrah, 4, '10:05:00', null, 1, 1450),
]

const DOWN: TrainStop[] = [
  stop(howrah, 1, null, '13:05:00', 0, 0),
  stop(patna, 2, '19:20:00', '19:30:00', 0, 460),
  stop(kanpur, 3, '02:05:00', '02:10:00', 1, 1010),
  stop(newDelhi, 4, '06:55:00', null, 1, 1450),
]

const DEMO_TRAINS: DemoTrain[] = [
  {
    trainId: 1,
    trainNumber: '12302',
    trainName: 'Howrah Rajdhani',
    trainType: 'RAJDHANI',
    stops: UP,
    baseAvailability: { SL: 72, '3A': 64, '2A': 46 },
  },
  {
    trainId: 2,
    trainNumber: '12303',
    trainName: 'Poorva Express',
    trainType: 'SUPERFAST',
    stops: [
      stop(newDelhi, 1, null, '16:10:00', 0, 0),
      stop(kanpur, 2, '20:50:00', '20:58:00', 0, 440),
      stop(patna, 3, '02:35:00', '02:45:00', 1, 990),
      stop(howrah, 4, '09:55:00', null, 1, 1450),
    ],
    baseAvailability: { SL: 34, '3A': 18, '2A': 7 },
  },
  {
    trainId: 3,
    trainNumber: '12259',
    trainName: 'Sealdah Duronto',
    trainType: 'DURONTO',
    stops: [
      stop(newDelhi, 1, null, '20:10:00', 0, 0),
      stop(kanpur, 2, '00:45:00', '00:52:00', 1, 440),
      stop(patna, 3, '06:20:00', '06:28:00', 1, 990),
      stop(howrah, 4, '12:30:00', null, 1, 1450),
    ],
    baseAvailability: { SL: 8, '3A': 3, '2A': 0 },
  },
  {
    trainId: 4,
    trainNumber: '12301',
    trainName: 'Howrah Rajdhani',
    trainType: 'RAJDHANI',
    stops: DOWN,
    baseAvailability: { SL: 47, '3A': 21, '2A': 9 },
  },
  {
    trainId: 5,
    trainNumber: '12304',
    trainName: 'Poorva Express',
    trainType: 'SUPERFAST',
    stops: [
      stop(howrah, 1, null, '14:40:00', 0, 0),
      stop(patna, 2, '21:10:00', '21:20:00', 0, 460),
      stop(kanpur, 3, '03:30:00', '03:38:00', 1, 1010),
      stop(newDelhi, 4, '08:20:00', null, 1, 1450),
    ],
    baseAvailability: { SL: 0, '3A': 0, '2A': 2 },
  },
]

const availability = new Map<string, number>()
for (const train of DEMO_TRAINS) {
  for (const [classType, count] of Object.entries(train.baseAvailability)) {
    availability.set(`${train.trainId}:${classType}`, count)
  }
}

function currentAvailability(trainId: number): Record<string, number> {
  const result: Record<string, number> = {}
  for (const classType of ['SL', '3A', '2A']) {
    const value = availability.get(`${trainId}:${classType}`)
    if (value !== undefined) result[classType] = value
  }
  return result
}

export function demoSearch(from: number, to: number): TrainSearchResult[] {
  return DEMO_TRAINS.flatMap((train) => {
    const fromStop = train.stops.find((s) => s.stationId === from)
    const toStop = train.stops.find((s) => s.stationId === to)
    if (!fromStop || !toStop || fromStop.sequenceNo >= toStop.sequenceNo) return []

    return [{
      trainId: train.trainId,
      trainNumber: train.trainNumber,
      trainName: train.trainName,
      trainType: train.trainType,
      departureTime: fromStop.departureTime ?? fromStop.arrivalTime ?? '',
      arrivalTime: toStop.arrivalTime ?? toStop.departureTime ?? '',
      distanceKm: toStop.distanceKm - fromStop.distanceKm,
      availableSeats: currentAvailability(train.trainId),
    }]
  })
}

export function demoRoute(trainId: number): TrainRoute {
  const train = DEMO_TRAINS.find((item) => item.trainId === trainId)
  if (!train) throw new Error('Train not found')
  return {
    trainId: train.trainId,
    trainNumber: train.trainNumber,
    trainName: train.trainName,
    trainType: train.trainType,
    stops: train.stops,
  }
}

export function createDemoBooking(request: BookingRequest): { response: BookingResponse; ticket: Ticket } {
  const results = demoSearch(request.fromStationId, request.toStationId)
  const train = results.find((item) => item.trainId === request.trainId)
  if (!train) throw new Error('That train does not run between the selected stations.')

  const fromStation = DEMO_STATIONS.find((s) => s.id === request.fromStationId)!
  const toStation = DEMO_STATIONS.find((s) => s.id === request.toStationId)!
  const seats = availability.get(`${train.trainId}:${request.classType}`) ?? 0
  const confirmed = seats > 0

  const coachPrefix = request.classType === 'SL' ? 'S' : request.classType === '3A' ? 'B' : 'A'
  const coachNumber = `${coachPrefix}1`
  const seatNumber = confirmed ? String(1 + Math.floor(Math.random() * Math.max(seats, 1))) : null
  const seatTypes = ['LOWER', 'MIDDLE', 'UPPER', 'SIDE_LOWER', 'SIDE_UPPER']

  if (confirmed) {
    availability.set(`${train.trainId}:${request.classType}`, seats - 1)
  }

  const pnr = generatePnr()
  const response: BookingResponse = {
    pnr,
    status: confirmed ? 'CONFIRMED' : 'WAITLISTED',
    seatNumber,
    coachNumber: confirmed ? coachNumber : null,
  }

  const ticket: Ticket = {
    pnr,
    status: response.status,
    trainNumber: train.trainNumber,
    trainName: train.trainName,
    trainType: train.trainType,
    journeyDate: request.journeyDate,
    fromCode: fromStation.code,
    fromName: fromStation.name,
    toCode: toStation.code,
    toName: toStation.name,
    departureTime: train.departureTime,
    arrivalTime: train.arrivalTime,
    passengerName: request.passengerName,
    passengerAge: request.passengerAge,
    classType: request.classType,
    coachNumber: response.coachNumber,
    seatNumber: response.seatNumber,
    seatType: confirmed ? seatTypes[(Number(seatNumber) - 1) % seatTypes.length] : null,
    bookedAt: new Date().toISOString(),
  }

  return { response, ticket }
}

function generatePnr(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let suffix = ''
  const values = crypto.getRandomValues(new Uint8Array(8))
  for (const value of values) suffix += alphabet[value % alphabet.length]
  return `PNR${suffix}`
}

export function demoSummary(from: number, to: number, trainId: number) {
  const fromStop = DEMO_STATIONS.find((station) => station.id === from)
  const toStop = DEMO_STATIONS.find((station) => station.id === to)
  const train = DEMO_TRAINS.find((item) => item.trainId === trainId)
  if (!fromStop || !toStop || !train) return null
  const routeFrom = train.stops.find((s) => s.stationId === from)
  const routeTo = train.stops.find((s) => s.stationId === to)
  if (!routeFrom || !routeTo) return null
  return {
    from: fromStop,
    to: toStop,
    distance: formatDistance(routeTo.distanceKm - routeFrom.distanceKm),
    duration: durationBetween(
      routeFrom.departureTime ?? routeFrom.arrivalTime,
      routeTo.arrivalTime ?? routeTo.departureTime,
    ),
  }
}
