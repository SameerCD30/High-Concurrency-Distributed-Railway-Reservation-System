import { Check, Clock3, XCircle } from 'lucide-react'
import type { BookingStatus } from '../types'

const meta: Record<BookingStatus, { label: string; className: string; icon: typeof Check }> = {
  CONFIRMED: { label: 'Confirmed', className: 'status-confirmed', icon: Check },
  WAITLISTED: { label: 'Waitlisted', className: 'status-waitlisted', icon: Clock3 },
  PENDING: { label: 'Pending', className: 'status-pending', icon: Clock3 },
  CANCELLED: { label: 'Cancelled', className: 'status-cancelled', icon: XCircle },
}

export function StatusChip({ status, large = false }: { status: BookingStatus; large?: boolean }) {
  const entry = meta[status] ?? meta.PENDING
  const Icon = entry.icon
  return (
    <span className={`status-chip ${entry.className} ${large ? 'is-large' : ''}`}>
      <Icon size={large ? 15 : 13} strokeWidth={2.5} />
      {entry.label}
    </span>
  )
}
