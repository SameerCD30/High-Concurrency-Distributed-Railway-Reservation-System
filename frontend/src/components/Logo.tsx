import { Link } from 'react-router-dom'

export function Logo() {
  return (
    <Link to="/" className="logo" aria-label="Safar — home">
      <span className="logo-mark" aria-hidden="true">
        <svg viewBox="0 0 36 36" role="presentation">
          <rect x="1" y="1" width="34" height="34" rx="11" className="logo-mark-bg" />
          <path d="M12 26V10M24 26V10" className="logo-rail" />
          <path d="M12 15h12M12 21h12" className="logo-sleeper" />
          <circle cx="18" cy="7.5" r="2.1" className="logo-dot" />
        </svg>
      </span>
      <span className="logo-word">
        Safar
        <span className="logo-tag">Rail</span>
      </span>
    </Link>
  )
}
