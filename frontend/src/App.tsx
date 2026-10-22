import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { DemoBanner } from './components/DemoBanner'
import { Footer } from './components/Footer'
import { Header } from './components/Header'
import { BookingPage } from './pages/BookingPage'
import { HomePage } from './pages/HomePage'
import { MyTripsPage } from './pages/MyTripsPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ResultsPage } from './pages/ResultsPage'
import { TicketPage } from './pages/TicketPage'

function useScrollBehaviour() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const timer = window.setTimeout(() => {
        document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 60)
      return () => window.clearTimeout(timer)
    }
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname, hash])
}

export default function App() {
  useScrollBehaviour()

  return (
    <div className="app">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <DemoBanner />
      <Header />
      <div id="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<ResultsPage />} />
          <Route path="/book" element={<BookingPage />} />
          <Route path="/ticket" element={<TicketPage />} />
          <Route path="/ticket/:pnr" element={<TicketPage />} />
          <Route path="/trips" element={<MyTripsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
      <Footer />
    </div>
  )
}
