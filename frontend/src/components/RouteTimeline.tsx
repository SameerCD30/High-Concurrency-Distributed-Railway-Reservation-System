import { Fragment } from 'react'
import { formatTime } from '../lib/format'
import type { TrainRoute } from '../types'

interface Props {
  route: TrainRoute
  fromStationId: number
  toStationId: number
}

export function RouteTimeline({ route, fromStationId, toStationId }: Props) {
  return (
    <ol className="route-timeline" aria-label={`${route.trainName} route`}>
      {route.stops.map((stop, index) => {
        const isBoarding = stop.stationId === fromStationId
        const isDestination = stop.stationId === toStationId
        const isEndpoint = index === 0 || index === route.stops.length - 1

        return (
          <Fragment key={stop.stationId}>
            <li
              className={[
                'route-stop',
                isBoarding ? 'is-boarding' : '',
                isDestination ? 'is-destination' : '',
              ].filter(Boolean).join(' ')}
            >
              <div className="route-time">
                <strong>{formatTime(stop.departureTime ?? stop.arrivalTime)}</strong>
                <span>
                  {stop.arrivalTime && stop.departureTime
                    ? `arr ${formatTime(stop.arrivalTime)} · dep ${formatTime(stop.departureTime)}`
                    : isEndpoint && !stop.departureTime
                      ? 'arrival'
                      : 'departure'}
                </span>
              </div>

              <div className="route-track" aria-hidden="true">
                <span className="route-node" />
              </div>

              <div className="route-info">
                <strong>{stop.stationName}</strong>
                <span>{stop.stationCode} · {stop.city}</span>
                {(isBoarding || isDestination) && (
                  <em>{isBoarding ? 'You board here' : 'You alight here'}</em>
                )}
              </div>

              <div className="route-meta">
                <span>{stop.distanceKm.toLocaleString('en-IN')} km</span>
                {stop.dayOffset > 0 && <span className="day-chip">Day {stop.dayOffset + 1}</span>}
              </div>
            </li>
          </Fragment>
        )
      })}
    </ol>
  )
}
