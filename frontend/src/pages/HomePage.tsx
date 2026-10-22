import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  ArrowUpRight,
  Clock3,
  Gauge,
  Layers,
  Lock,
  MapPin,
  Route,
  Ticket,
  Timer,
  TrainFront,
} from 'lucide-react'
import { SearchForm } from '../components/SearchForm'
import { useStations } from '../hooks/useStations'
import { defaultJourneyDate, formatDistance } from '../lib/format'
import type { SearchQuery, Station } from '../types'

const HERO_STOPS = [
  { code: 'NDLS', name: 'New Delhi', time: '16:55', day: 'Day 1', kind: 'departure' },
  { code: 'CNB', name: 'Kanpur Central', time: '21:30', day: 'Day 1', kind: 'stop' },
  { code: 'PNBE', name: 'Patna Junction', time: '04:00', day: 'Day 2', kind: 'stop' },
  { code: 'HWH', name: 'Howrah Junction', time: '10:05', day: 'Day 2', kind: 'arrival' },
]

const ROUTE_IDEAS = [
  { from: 'NDLS', to: 'HWH', distance: 1450, duration: '17h 10m', mood: 'The long haul' },
  { from: 'NDLS', to: 'PNBE', distance: 990, duration: '11h 05m', mood: 'Overnight favourite' },
  { from: 'CNB', to: 'HWH', distance: 1010, duration: '12h 30m', mood: 'Eastbound' },
]

export function HomePage() {
  const navigate = useNavigate()
  const { stations, loading } = useStations()

  function search(query: SearchQuery) {
    const params = new URLSearchParams({
      from: String(query.from),
      to: String(query.to),
      date: query.date,
      class: query.classType,
    })
    navigate(`/search?${params.toString()}`)
  }

  function openRoute(from: Station, to: Station) {
    search({ from: from.id, to: to.id, date: defaultJourneyDate(), classType: 'SL' })
  }

  const ideas = ROUTE_IDEAS.map((idea) => ({
    ...idea,
    fromStation: stations.find((station) => station.code === idea.from),
    toStation: stations.find((station) => station.code === idea.to),
  })).filter((idea) => idea.fromStation && idea.toStation)

  return (
    <main className="home">
      <section className="hero">
        <div className="hero-texture" aria-hidden="true" />

        <div className="shell hero-grid">
          <div className="hero-copy">
            <span className="eyebrow eyebrow-light">
              <span className="eyebrow-dot" /> Reservation, refined
            </span>
            <h1>
              Every journey
              <br />
              begins with <em>a seat.</em>
            </h1>
            <p className="hero-lede">
              Search India&apos;s scheduled services, pick the class that fits, and hold a real
              berth for your exact stretch of track. No phantom inventory. No double bookings.
            </p>

            <div className="hero-assurances">
              <span><Lock size={14} /> Seat-level locks</span>
              <span><Timer size={14} /> Live availability</span>
              <span><Route size={14} /> Segment-aware</span>
            </div>
          </div>

          <aside className="hero-board" aria-label="Featured route">
            <div className="board-top">
              <span className="board-kicker">Featured service</span>
              <span className="board-live"><span className="pulse-dot" /> Running</span>
            </div>

            <div className="board-train">
              <span className="board-number">12302</span>
              <div>
                <h2>Howrah Rajdhani</h2>
                <p>New Delhi → Howrah Junction</p>
              </div>
            </div>

            <ol className="board-stops">
              {HERO_STOPS.map((stop) => (
                <li key={stop.code} className={`board-stop is-${stop.kind}`}>
                  <span className="board-time">{stop.time}</span>
                  <span className="board-rail" aria-hidden="true"><span /></span>
                  <span className="board-place">
                    <strong>{stop.name}</strong>
                    <small>{stop.code} · {stop.day}</small>
                  </span>
                </li>
              ))}
            </ol>

            <div className="board-foot">
              <span><TrainFront size={15} /> Rajdhani class</span>
              <span>{formatDistance(1450)}</span>
            </div>

            <div className="board-stamp">17h 10m</div>
          </aside>
        </div>

        <div className="shell search-dock" id="search">
          <div className="search-dock-head">
            <div>
              <span className="eyebrow">Plan a journey</span>
              <h2>Where are you headed?</h2>
            </div>
            <p>Pick a route, a date, and a class. We&apos;ll show what&apos;s truly free.</p>
          </div>
          <SearchForm stations={stations} onSubmit={search} loading={loading} />
          <div className="search-dock-meta">
            <span><Gauge size={14} /> Availability cached for 10 minutes</span>
            <span><Layers size={14} /> Inventory counted by segment</span>
          </div>
        </div>
      </section>

      <section className="section home-routes">
        <div className="shell">
          <div className="section-head">
            <div>
              <span className="eyebrow">Popular stretches</span>
              <h2>Some tracks are worth the wait.</h2>
            </div>
            <p>Start with a route, then fine-tune the date and class.</p>
          </div>

          <div className="route-cards">
            {ideas.map((idea, index) => (
              <button
                key={`${idea.from}-${idea.to}`}
                type="button"
                className="route-card"
                onClick={() => openRoute(idea.fromStation!, idea.toStation!)}
              >
                <span className="route-card-index">0{index + 1}</span>
                <span className="route-card-mood">{idea.mood}</span>

                <span className="route-card-pair">
                  <span>
                    <strong>{idea.fromStation!.city}</strong>
                    <small>{idea.fromStation!.code}</small>
                  </span>
                  <span className="route-card-arrow">
                    <span />
                    <ArrowRight size={15} />
                  </span>
                  <span>
                    <strong>{idea.toStation!.city}</strong>
                    <small>{idea.toStation!.code}</small>
                  </span>
                </span>

                <span className="route-card-foot">
                  <span><Route size={14} /> {formatDistance(idea.distance)}</span>
                  <span><Clock3 size={14} /> {idea.duration}</span>
                  <span className="route-card-go"><ArrowUpRight size={16} /></span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="section home-engineering">
        <div className="shell engineering-grid">
          <div className="engineering-intro">
            <span className="eyebrow eyebrow-light">Under the bonnet</span>
            <h2>Built for the rush hour.</h2>
            <p>
              Behind this booking screen is a reservation engine designed to survive a stampede for
              the last sleeper berth — without overselling a single seat.
            </p>
            <div className="engineering-note">
              <span className="engineering-note-icon"><Ticket size={18} /></span>
              <div>
                <strong>One seat, many journeys</strong>
                <p>A berth freed at Kanpur can be sold again for the Patna stretch.</p>
              </div>
            </div>
          </div>

          <div className="feature-grid">
            <article className="feature-card">
              <span className="feature-icon"><Lock size={20} /></span>
              <h3>Pessimistic seat locks</h3>
              <p>Postgres row locks serialise competing bookings, so two passengers can never win the same berth.</p>
            </article>
            <article className="feature-card">
              <span className="feature-icon"><Layers size={20} /></span>
              <h3>Segment-aware counts</h3>
              <p>Availability is calculated for your boarding and destination sequence — not the whole train.</p>
            </article>
            <article className="feature-card">
              <span className="feature-icon"><Gauge size={20} /></span>
              <h3>Redis-backed reads</h3>
              <p>Search counts are cached for ten minutes and evicted after a booking commits to the database.</p>
            </article>
            <article className="feature-card">
              <span className="feature-icon"><Ticket size={20} /></span>
              <h3>Honest waitlists</h3>
              <p>When the class is genuinely full, you join a waitlist instead of being handed a phantom seat.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section how-it-works">
        <div className="shell">
          <div className="section-head">
            <div>
              <span className="eyebrow">Three small steps</span>
              <h2>From here to the platform.</h2>
            </div>
          </div>

          <ol className="steps">
            <li>
              <span className="step-number">01</span>
              <span className="step-icon"><MapPin size={20} /></span>
              <h3>Choose your stretch</h3>
              <p>Tell us where you board and where you get off. We only count seats for that segment.</p>
            </li>
            <li>
              <span className="step-number">02</span>
              <span className="step-icon"><Layers size={20} /></span>
              <h3>Pick a class</h3>
              <p>Sleeper or air-conditioned, every option shows the live count before you commit.</p>
            </li>
            <li>
              <span className="step-number">03</span>
              <span className="step-icon"><Ticket size={20} /></span>
              <h3>Hold your berth</h3>
              <p>Confirm with your name and age. Your PNR and coach position are issued instantly.</p>
            </li>
          </ol>
        </div>
      </section>

      <section className="section closing-band">
        <div className="shell closing-inner">
          <div>
            <span className="eyebrow eyebrow-light">The next train is yours</span>
            <h2>Pack light. Book early.</h2>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={() => document.getElementById('search')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Find a seat <ArrowRight size={18} />
          </button>
        </div>
      </section>
    </main>
  )
}
