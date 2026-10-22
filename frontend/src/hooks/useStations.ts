import { useEffect, useState } from 'react'
import { loadStations } from '../lib/api'
import type { Station } from '../types'

export function useStations() {
  const [stations, setStations] = useState<Station[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    loadStations()
      .then((result) => {
        if (active) setStations(result)
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : 'Unable to load stations')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  return { stations, loading, error }
}
