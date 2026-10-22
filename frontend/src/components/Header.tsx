import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu, Ticket, X } from 'lucide-react'
import { Logo } from './Logo'

const links = [
  { to: '/', label: 'Book a journey', end: true },
  { to: '/trips', label: 'My trips' },
  { to: '/ticket', label: 'PNR status' },
]

export function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Logo />

        <nav className={`header-nav ${open ? 'is-open' : ''}`} aria-label="Main navigation">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
          <Link to="/#search" className="btn btn-dark btn-sm header-cta" onClick={() => setOpen(false)}>
            <Ticket size={16} strokeWidth={2} />
            Book now
          </Link>
        </nav>

        <button
          type="button"
          className="icon-btn menu-toggle"
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </header>
  )
}
