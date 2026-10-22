import { Link } from 'react-router-dom'
import { ArrowLeft, Compass } from 'lucide-react'

export function NotFoundPage() {
  return (
    <main className="page notfound-page">
      <div className="shell notfound-inner">
        <span className="notfound-number">404</span>
        <span className="state-icon"><Compass size={26} /></span>
        <h1>This platform doesn&apos;t exist.</h1>
        <p>The page you followed isn&apos;t on our timetable. Head back to the main line.</p>
        <Link to="/" className="btn btn-primary"><ArrowLeft size={16} /> Back to search</Link>
      </div>
    </main>
  )
}
