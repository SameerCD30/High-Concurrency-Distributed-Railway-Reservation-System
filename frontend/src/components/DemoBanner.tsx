import { RefreshCw, WifiOff } from 'lucide-react'
import { retryBackend } from '../lib/api'
import { useDemoMode } from '../hooks/useDemoMode'

export function DemoBanner() {
  const demo = useDemoMode()
  if (!demo) return null

  return (
    <div className="demo-banner" role="status">
      <div className="shell demo-banner-inner">
        <span className="demo-banner-copy">
          <WifiOff size={15} />
          <strong>Demo mode.</strong>
          <span className="demo-detail-long">
            The API is offline, so sample trains and local tickets are being used.
          </span>
          <span className="demo-detail-short">Sample data</span>
        </span>
        <button
          type="button"
          className="demo-retry"
          onClick={() => {
            retryBackend()
            window.location.reload()
          }}
        >
          <RefreshCw size={14} /> Try live API
        </button>
      </div>
    </div>
  )
}
