import { Link } from 'react-router-dom'
import { ExternalLink, Server, Database, Zap } from 'lucide-react'
import { Logo } from './Logo'

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div className="footer-brand">
          <Logo />
          <p>
            A calmer way to book Indian rail journeys. Built on a high-concurrency reservation
            engine that keeps every seat honest.
          </p>
          <div className="tech-pills" aria-label="Backend stack">
            <span><Server size={13} /> Spring Boot</span>
            <span><Database size={13} /> PostgreSQL</span>
            <span><Zap size={13} /> Redis</span>
          </div>
        </div>

        <div className="footer-column">
          <h3>Travel</h3>
          <Link to="/">Search trains</Link>
          <Link to="/trips">My trips</Link>
          <Link to="/ticket">Check PNR</Link>
        </div>

        <div className="footer-column">
          <h3>Routes</h3>
          <Link to="/search?from=1&to=4">Delhi → Howrah</Link>
          <Link to="/search?from=4&to=1">Howrah → Delhi</Link>
          <Link to="/search?from=1&to=3">Delhi → Patna</Link>
        </div>

        <div className="footer-column footer-note">
          <h3>The fine print</h3>
          <p>
            This is an independent engineering project, not an IRCTC service. Tickets are stored in
            this browser and no payment is collected.
          </p>
          <a
            href="https://github.com/SameerCD30/High-Concurrency-Distributed-Railway-Reservation-System"
            target="_blank"
            rel="noreferrer"
            className="footer-link"
          >
            <ExternalLink size={15} /> View source
          </a>
        </div>
      </div>

      <div className="shell footer-bottom">
        <span>© {new Date().getFullYear()} Safar Rail</span>
        <span className="footer-mono">PNR · SEAT · JOURNEY</span>
        <span>Made for the long way home</span>
      </div>
    </footer>
  )
}
