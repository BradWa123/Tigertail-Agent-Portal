import type { AgentStatus } from '@/lib/api'

export const STATUS: Record<AgentStatus, { label: string; color: string; bg: string; border: string }> = {
  assigned:  { label: 'New — please respond', color: 'var(--warn)', bg: 'var(--warn-soft)', border: 'var(--warn-border)' },
  accepted:  { label: 'Accepted',             color: 'var(--teal)', bg: 'var(--teal-soft)', border: 'var(--teal-border)' },
  submitted: { label: 'Sent to line',         color: 'var(--teal)', bg: 'var(--teal-soft)', border: 'var(--teal-border)' },
  confirmed: { label: 'Confirmed',            color: 'var(--ok)',   bg: 'var(--ok-soft)',   border: 'var(--ok-border)' },
  declined:  { label: 'Declined',             color: 'var(--bad)',  bg: 'var(--bad-soft)',  border: 'var(--bad-border)' },
}

export default function StatusBadge({ status }: { status: AgentStatus }) {
  const s = STATUS[status]
  return (
    <span className="inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}>{s.label}</span>
  )
}
