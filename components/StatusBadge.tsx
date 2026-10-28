'use client'
import type { AgentStatus } from '@/lib/api'
import { useI18n, type MessageKey } from '@/lib/i18n'

export const STATUS: Record<AgentStatus, { label: MessageKey; color: string; bg: string; border: string }> = {
  assigned:  { label: 'status.assigned',  color: 'var(--warn)', bg: 'var(--warn-soft)', border: 'var(--warn-border)' },
  accepted:  { label: 'status.accepted',  color: 'var(--teal)', bg: 'var(--teal-soft)', border: 'var(--teal-border)' },
  submitted: { label: 'status.submitted', color: 'var(--teal)', bg: 'var(--teal-soft)', border: 'var(--teal-border)' },
  confirmed: { label: 'status.confirmed', color: 'var(--ok)',   bg: 'var(--ok-soft)',   border: 'var(--ok-border)' },
  declined:  { label: 'status.declined',  color: 'var(--bad)',  bg: 'var(--bad-soft)',  border: 'var(--bad-border)' },
}

export default function StatusBadge({ status }: { status: AgentStatus }) {
  const { t } = useI18n()
  const s = STATUS[status]
  return (
    <span className="inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}>{t(s.label)}</span>
  )
}
