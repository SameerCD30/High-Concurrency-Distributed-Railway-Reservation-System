export interface Station {
  id: number
  code: string
  name: string
  city: string
  state: string
}

export interface TrainSearchResult {
  trainId: number
  trainNumber: string
  trainName: string
  trainType: string | null
  departureTime: string
  arrivalTime: string
  distanceKm: number
  availableSeats: Record<string, number>
}

export interface TrainStop {
  stationId: number
  stationCode: string
  stationName: string
  city: string
  sequenceNo: number
  arrivalTime: string | null
  departureTime: string | null
  dayOffset: number
  distanceKm: number
}

export interface TrainRoute {
  trainId: number
  trainNumber: string
  trainName: string
  trainType: string | null
  stops: TrainStop[]
}

export interface BookingRequest {
  trainId: number
  journeyDate: string
  classType: string
  fromStationId: number
  toStationId: number
  passengerName: string
  passengerAge: number
}

export type BookingStatus = 'CONFIRMED' | 'WAITLISTED' | 'PENDING' | 'CANCELLED'

export interface BookingResponse {
  pnr: string
  status: BookingStatus
  seatNumber: string | null
  coachNumber: string | null
}

export interface Ticket {
  pnr: string
  status: BookingStatus
  trainNumber: string
  trainName: string
  trainType: string | null
  journeyDate: string
  fromCode: string
  fromName: string
  toCode: string
  toName: string
  departureTime: string | null
  arrivalTime: string | null
  passengerName: string
  passengerAge: number
  classType: string | null
  coachNumber: string | null
  seatNumber: string | null
  seatType: string | null
  bookedAt: string | null
}

export interface StoredTrip extends Ticket {
  savedAt: string
}

export interface SearchQuery {
  from: number
  to: number
  date: string
  classType: string
}
