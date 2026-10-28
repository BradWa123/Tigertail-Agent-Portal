'use client'
import { useState } from 'react'
import { CheckCircle2, Circle, Flag, Loader2 } from 'lucide-react'
import { api, type Milestone, type ShipmentView } from '@/lib/api'
import { fmtDateTime, toLocalInput } from '@/lib/format'
import { useI18n, type MessageKey } from '@/lib/i18n'

const PER_CONTAINER: { code: string; label: MessageKey }[] = [
  { code: 'ECOL', label: 'm.ECOL' },
  { code: 'STUF', label: 'm.STUF' },
  { code: 'GTIN', label: 'm.GTIN' },
]

type Editing = { code: string; containerId: string | null; at: string; location: string }

export default function MilestonesCard({ bookingId, data, onChange }: {
  bookingId: string; data: ShipmentView; onChange: (d: ShipmentView) => void
}) {
  const [editing, setEditing] = useState<Editing | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const { t } = useI18n()

  const find = (code: string, containerId: string | null) =>
    data.milestones.find(m => m.event_code === code && m.container_id === containerId)

  function open(code: string, containerId: string | null, existing?: Milestone) {
    setError('')
    setEditing({ code, containerId, at: toLocalInput(existing?.actual_at ?? new Date().toISOString()), location: existing?.location ?? '' })
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!editing) return
    setBusy(true); setError('')
    try {
      onChange(await api.put<ShipmentView>(`/bookings/${bookingId}/milestones/${editing.code}`, {
        container_id: editing.containerId ?? undefined,
        actual_at: new Date(editing.at).toISOString(),
        location: editing.location || undefined,
      }))
      setEditing(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('m.saveFailed'))
    } finally { setBusy(false) }
  }

  // A render function, not a nested component: a component defined in here would remount
  // on every keystroke and the inputs would lose focus
  function row(code: string, label: MessageKey, containerId: string | null) {
    const m = find(code, containerId)
    const isEditing = editing?.code === code && editing.containerId === containerId
    return (
      <li key={`${code}-${containerId}`} className="py-2">
        <button type="button" onClick={() => open(code, containerId, m)} className="flex min-h-11 w-full items-center gap-3 text-left">
          {m ? <CheckCircle2 className="h-5 w-5 shrink-0" style={{ color: 'var(--ok)' }}/> : <Circle className="h-5 w-5 shrink-0" style={{ color: 'var(--border)' }}/>}
          <span className="flex-1 text-sm font-medium">{t(label)}</span>
          <span className="text-xs" style={{ color: m ? 'var(--text)' : 'var(--muted)' }}>
            {m ? `${fmtDateTime(m.actual_at)}${m.location ? ` · ${m.location}` : ''}` : t('m.tap')}
          </span>
        </button>
        {isEditing && editing && (
          <form onSubmit={save} className="mt-2 grid gap-2 rounded-xl p-3 sm:grid-cols-2" style={{ background: 'var(--bg)' }}>
            <label className="block text-sm font-medium">{t('m.when')}
              <input className="tt-input mt-1.5" type="datetime-local" required value={editing.at}
                onChange={e => setEditing({ ...editing, at: e.target.value })}/>
            </label>
            <label className="block text-sm font-medium">{t('m.where')}
              <input className="tt-input mt-1.5" value={editing.location} maxLength={120} placeholder={t('m.wherePlaceholder')}
                onChange={e => setEditing({ ...editing, location: e.target.value })}/>
            </label>
            {error && <p role="alert" className="text-sm sm:col-span-2" style={{ color: 'var(--bad)' }}>{error}</p>}
            <div className="grid grid-cols-2 gap-2 sm:col-span-2">
              <button type="button" onClick={() => setEditing(null)} className="h-11 rounded-xl text-sm font-semibold"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>{t('common.cancel')}</button>
              <button type="submit" disabled={busy} className="flex h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                style={{ background: 'var(--navy)' }}>{busy && <Loader2 className="h-4 w-4 animate-spin"/>}{m ? t('common.update') : t('common.save')}</button>
            </div>
          </form>
        )}
      </li>
    )
  }

  const conf = find('CONF', null)

  return (
    <section className="mt-4 rounded-2xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold"><Flag className="h-4 w-4"/>{t('m.title')}</h2>
      <p className="mb-2 text-xs" style={{ color: 'var(--muted)' }}>{t('m.help')}</p>

      {conf && (
        <div className="flex min-h-11 items-center gap-3 text-sm">
          <CheckCircle2 className="h-5 w-5 shrink-0" style={{ color: 'var(--ok)' }}/>
          <span className="flex-1 font-medium">{t('m.CONF')}</span>
          <span className="text-xs">{fmtDateTime(conf.actual_at)}</span>
        </div>
      )}

      {data.containers.length === 0 ? (
        <p className="py-2 text-sm" style={{ color: 'var(--muted)' }}>{t('m.needContainers')}</p>
      ) : data.containers.map(c => (
        <div key={c.id} className="mt-2">
          <div className="font-mono text-xs font-semibold" style={{ color: 'var(--muted)' }}>{c.container_number}</div>
          <ul className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {PER_CONTAINER.map(s => row(s.code, s.label, c.id))}
          </ul>
        </div>
      ))}

      <div className="mt-2 border-t pt-1" style={{ borderColor: 'var(--border)' }}>
        <ul>{row('DEPA', 'm.DEPA', null)}</ul>
      </div>
    </section>
  )
}
