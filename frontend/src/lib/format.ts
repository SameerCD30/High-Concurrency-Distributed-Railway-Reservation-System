const DAY_MS = 86_400_000

export function toISODate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

export function defaultJourneyDate(): string {
  return toISODate(addDays(new Date(), 7))
}

export function todayISO(): string {
  return toISODate(new Date())
}

export function parseISODate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, (month || 1) - 1, day || 1)
}

export function formatDate(iso: string | null | undefined, withYear = true): string {
  if (!iso) return '—'
  const date = parseISODate(iso)
  if (Number.isNaN(date.getTime())) return iso
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    ...(withYear ? { year: 'numeric' } : {}),
  }).format(date)
}

export function formatDateShort(iso: string | null | undefined): string {
  if (!iso) return '—'
  const date = parseISODate(iso)
  if (Number.isNaN(date.getTime())) return iso
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short' }).format(date)
}

export function relativeDateLabel(iso: string): string {
  const today = parseISODate(todayISO()).getTime()
  const target = parseISODate(iso).getTime()
  const diff = Math.round((target - today) / DAY_MS)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff === -1) return 'Yesterday'
  if (diff > 0) return `In ${diff} days`
  return `${Math.abs(diff)} days ago`
}

export function formatTime(time: string | null | undefined): string {
  if (!time) return '—'
  return time.slice(0, 5)
}

export function durationBetween(
  departure: string | null | undefined,
  arrival: string | null | undefined,
): { label: string; dayOffset: number } {
  const dep = toMinutes(departure)
  const arr = toMinutes(arrival)
  if (dep === null || arr === null) return { label: '—', dayOffset: 0 }
  const dayOffset = arr <= dep ? 1 : 0
  const total = arr + dayOffset * 24 * 60 - dep
  const hours = Math.floor(total / 60)
  const minutes = total % 60
  return { label: `${hours}h ${String(minutes).padStart(2, '0')}m`, dayOffset }
}

function toMinutes(time: string | null | undefined): number | null {
  if (!time) return null
  const [hours, minutes] = time.split(':').map(Number)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null
  return hours * 60 + minutes
}

export function durationInMinutes(
  departure: string | null | undefined,
  arrival: string | null | undefined,
): number {
  const dep = toMinutes(departure)
  const arr = toMinutes(arrival)
  if (dep === null || arr === null) return 0
  return (arr <= dep ? arr + 24 * 60 : arr) - dep
}

export function formatDistance(km: number | null | undefined): string {
  if (!km && km !== 0) return '—'
  return `${new Intl.NumberFormat('en-IN').format(km)} km`
}

export function titleCase(value: string | null | undefined): string {
  if (!value) return ''
  return value
    .toLowerCase()
    .split(/[\s_-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export interface ClassMeta {
  code: string
  name: string
  blurb: string
}

const CLASS_META: Record<string, ClassMeta> = {
  SL: { code: 'SL', name: 'Sleeper', blurb: 'Non-AC · 72 seats' },
  '3A': { code: '3A', name: 'AC 3 Tier', blurb: 'Air-conditioned · 64 seats' },
  '2A': { code: '2A', name: 'AC 2 Tier', blurb: 'Air-conditioned · 46 seats' },
  '1A': { code: '1A', name: 'AC First Class', blurb: 'Private cabins' },
  CC: { code: 'CC', name: 'AC Chair Car', blurb: 'Reserved seating' },
  EC: { code: 'EC', name: 'Executive Chair Car', blurb: 'Premium seating' },
}

export function classInfo(code: string): ClassMeta {
  return CLASS_META[code] ?? { code, name: code, blurb: 'Reserved accommodation' }
}

export function classOrder(code: string): number {
  return ['1A', '2A', '3A', 'CC', 'EC', 'SL'].indexOf(code)
}

export function availabilityTone(seats: number): 'good' | 'low' | 'full' {
  if (seats <= 0) return 'full'
  if (seats <= 10) return 'low'
  return 'good'
}
