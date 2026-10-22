import { useSyncExternalStore } from 'react'
import { isDemoMode, subscribeDemoMode } from '../lib/api'

export function useDemoMode(): boolean {
  return useSyncExternalStore(subscribeDemoMode, isDemoMode, () => false)
}
