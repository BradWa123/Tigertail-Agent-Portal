'use client'
import { useState } from 'react'
import { Box, Plus, Trash2, Loader2 } from 'lucide-react'
import { api, type ShipmentView } from '@/lib/api'

const empty = { container_number: '', seal_number: '', gross_weight_kg: '', cbm: '' }

export default function ContainersCard({ bookingId, qty, data, onChange }: {
  bookingId: string; qty: number; data: ShipmentView; onChange: (d: ShipmentView) => void
}) {
  const [form, setForm] = useState(empty)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const set = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }))

  async function run(label: string, fn: () => Promise<ShipmentView>) {
    setBusy(label); setError('')
    try { onChange(await fn()); return true }
    catch (e) { setError(e instanceof Error ? e.message : 'Something went wrong'); return false }
    finally { setBusy('') }
  }

  async function add(e: React.FormEvent) {
    e.preventDefault()
    const body = Object.fromEntries(Object.entries(form).filter(([, v]) => v !== ''))
    if (await run('add', () => api.post<ShipmentView>(`/bookings/${bookingId}/containers`, body))) setForm(empty)
  }

  const full = data.containers.length >= qty

  return (
    <section className="mt-4 rounded-2xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold"><Box className="h-4 w-4"/>Containers · {data.containers.length} of {qty}</h2>
      {error && <p role="alert" className="mb-3 rounded-lg px-3 py-2 text-sm" style={{ background: 'var(--bad-soft)', color: 'var(--bad)' }}>{error}</p>}

      {data.containers.length > 0 && (
        <ul className="mb-3 divide-y rounded-xl" style={{ border: '1px solid var(--border)' }}>
          {data.containers.map(c => (
            <li key={c.id} className="flex items-center gap-3 px-3 py-2.5">
              <div className="min-w-0 flex-1">
                <div className="font-mono text-sm font-semibold">{c.container_number}</div>
                <div className="text-xs" style={{ color: 'var(--muted)' }}>
                  {[c.container_type, c.seal_number && `Seal ${c.seal_number}`, c.gross_weight_kg && `${c.gross_weight_kg.toLocaleString('en-GB')} kg`, c.cbm && `${c.cbm} m³`].filter(Boolean).join(' · ')}
                </div>
              </div>
              <button type="button" aria-label={`Remove ${c.container_number}`} className="flex h-11 w-11 items-center justify-center rounded-lg"
                style={{ color: 'var(--muted)' }} disabled={!!busy}
                onClick={() => confirm(`Remove ${c.container_number}? Any milestones recorded for it will be removed too.`) &&
                  run(c.id, () => api.delete<ShipmentView>(`/bookings/${bookingId}/containers/${c.id}`))}>
                {busy === c.id ? <Loader2 className="h-4 w-4 animate-spin"/> : <Trash2 className="h-4 w-4"/>}
              </button>
            </li>
          ))}
        </ul>
      )}

      {!full && (
        <form onSubmit={add} className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-medium sm:col-span-2">Container number
            <input className="tt-input mt-1.5 font-mono uppercase" required value={form.container_number} onChange={set('container_number')}
              placeholder="e.g. MSKU1234565" autoCapitalize="characters" autoComplete="off" maxLength={14}/>
          </label>
          <label className="block text-sm font-medium">Seal number
            <input className="tt-input mt-1.5" value={form.seal_number} onChange={set('seal_number')} maxLength={40}/>
          </label>
          <label className="block text-sm font-medium">Gross weight (kg)
            <input className="tt-input mt-1.5" type="number" inputMode="decimal" min={0} step="any" value={form.gross_weight_kg} onChange={set('gross_weight_kg')}/>
          </label>
          <label className="block text-sm font-medium">Volume (m³)
            <input className="tt-input mt-1.5" type="number" inputMode="decimal" min={0} step="any" value={form.cbm} onChange={set('cbm')}/>
          </label>
          <button type="submit" disabled={busy === 'add'} className="flex h-12 items-center justify-center gap-2 self-end rounded-xl text-sm font-semibold text-white disabled:opacity-60"
            style={{ background: 'var(--navy)' }}>
            {busy === 'add' ? <Loader2 className="h-4 w-4 animate-spin"/> : <Plus className="h-4 w-4"/>}Add container
          </button>
        </form>
      )}
    </section>
  )
}
