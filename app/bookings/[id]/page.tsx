'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Check, X, Send, Loader2, Ship } from 'lucide-react'
import Shell from '@/components/Shell'
import StatusBadge from '@/components/StatusBadge'
import { api, type Booking, type ShipmentView } from '@/lib/api'
import ContainersCard from '@/components/ContainersCard'
import MilestonesCard from '@/components/MilestonesCard'
import { fmtDate, fmtDateTime, toLocalInput } from '@/lib/format'
import { useI18n } from '@/lib/i18n'

type CarrierForm = { carrier: string; cbn: string; vessel: string; voyage: string; etd: string; eta: string; si_cutoff: string; cy_cutoff: string }

const toForm = (b: Booking): CarrierForm => ({
  carrier: b.carrier ?? b.rate_carrier ?? '', cbn: b.cbn ?? '', vessel: b.vessel ?? '', voyage: b.voyage ?? '',
  etd: b.etd?.slice(0, 10) ?? '', eta: b.eta?.slice(0, 10) ?? '',
  si_cutoff: toLocalInput(b.si_cutoff), cy_cutoff: toLocalInput(b.cy_cutoff),
})

export default function BookingPage() {
  const { id } = useParams<{ id: string }>()
  const [b, setB] = useState<Booking | null>(null)
  const [form, setForm] = useState<CarrierForm | null>(null)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState('')
  const [declining, setDeclining] = useState(false)
  const [reason, setReason] = useState('')
  const [shipment, setShipment] = useState<ShipmentView | null>(null)
  const { t } = useI18n()

  useEffect(() => {
    api.get<Booking>(`/bookings/${id}`).then(x => { setB(x); setForm(toForm(x)) }).catch(e => setError(e.message))
    api.get<ShipmentView>(`/bookings/${id}/shipment`).then(setShipment).catch(() => {})
  }, [id])

  async function act(label: string, path: string, body?: unknown, method: 'post' | 'put' = 'post') {
    setBusy(label); setError(''); setSaved('')
    try {
      const next = await api[method]<Booking>(`/bookings/${id}${path}`, body)
      setB(next); setForm(toForm(next))
      // Confirming creates the shipment and its first milestone
      api.get<ShipmentView>(`/bookings/${id}/shipment`).then(setShipment).catch(() => {})
      return next
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.error'))
    } finally { setBusy('') }
  }

  async function saveCarrier(e: React.FormEvent) {
    e.preventDefault()
    if (!form || !b) return
    const iso = (v: string) => (v ? new Date(v).toISOString() : '')
    const wasConfirmed = b.agent_status === 'confirmed'
    const next = await act('carrier', '/carrier', { ...form, si_cutoff: iso(form.si_cutoff), cy_cutoff: iso(form.cy_cutoff) }, 'put')
    if (next) setSaved(!wasConfirmed && next.agent_status === 'confirmed'
      ? t('b.confirmedSaved')
      : t('b.saved'))
  }

  if (!b || !form) {
    return <Shell><p className="text-sm" style={{ color: error ? 'var(--bad)' : 'var(--muted)' }}>{error || t('common.loading')}</p></Shell>
  }

  const canEditCarrier = ['accepted', 'submitted', 'confirmed'].includes(b.agent_status)
  const set = (k: keyof CarrierForm) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => f && { ...f, [k]: e.target.value })

  return (
    <Shell>
      <Link href="/bookings" className="inline-flex h-11 items-center gap-1 text-sm font-medium" style={{ color: 'var(--muted)' }}>
        <ArrowLeft className="h-4 w-4"/> {t('b.back')}
      </Link>

      <div className="mt-1 flex flex-wrap items-center gap-2">
        <h1 className="text-xl font-semibold">{b.pol} → {b.pod}</h1>
        <StatusBadge status={b.agent_status}/>
      </div>
      <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
        {b.ref}{b.customer_ref ? ` · ${t('b.ref', { ref: b.customer_ref })}` : ''} · {b.qty} × {b.equip}
      </p>

      {error && <p role="alert" className="mt-4 rounded-lg px-3 py-2 text-sm" style={{ background: 'var(--bad-soft)', color: 'var(--bad)' }}>{error}</p>}
      {saved && <p role="status" className="mt-4 rounded-lg px-3 py-2 text-sm" style={{ background: 'var(--ok-soft)', color: 'var(--ok)' }}>{saved}</p>}

      {/* What to do next */}
      {b.agent_status === 'assigned' && !declining && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button onClick={() => act('accept', '/accept')} busy={busy === 'accept'} icon={<Check className="h-4 w-4"/>} primary>{t('b.accept')}</Button>
          <Button onClick={() => setDeclining(true)} icon={<X className="h-4 w-4"/>}>{t('b.decline')}</Button>
        </div>
      )}
      {declining && (
        <Card title={t('b.declineTitle')}>
          <label htmlFor="reason" className="block text-sm font-medium">{t('b.declineReason')}</label>
          <textarea id="reason" value={reason} onChange={e => setReason(e.target.value)} maxLength={500}
            placeholder={t('b.declinePlaceholder')} className="tt-input mt-1.5"/>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button onClick={() => setDeclining(false)}>{t('common.cancel')}</Button>
            <Button primary danger busy={busy === 'decline'} onClick={async () => { if (await act('decline', '/decline', { reason })) setDeclining(false) }}>
              {t('b.decline')}
            </Button>
          </div>
        </Card>
      )}
      {b.agent_status === 'accepted' && (
        <div className="mt-4">
          <Button primary busy={busy === 'submitted'} icon={<Send className="h-4 w-4"/>} onClick={() => act('submitted', '/submitted')}>
            {t('b.sentToLine')}
          </Button>
        </div>
      )}
      {b.agent_status === 'declined' && b.agent_note && (
        <p className="mt-4 rounded-lg px-3 py-2 text-sm" style={{ background: 'var(--bad-soft)', color: 'var(--bad)' }}>
          {t('b.youDeclined', { note: b.agent_note })}
        </p>
      )}

      {canEditCarrier && (
        <form onSubmit={saveCarrier}>
          <Card title={t('b.carrierTitle')} icon={<Ship className="h-4 w-4"/>}>
            <p className="-mt-1 mb-3 text-xs" style={{ color: 'var(--muted)' }}>
              {t('b.carrierHelp')}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input label={t('b.carrier')} value={form.carrier} onChange={set('carrier')}/>
              <Input label={t('b.cbn')} value={form.cbn} onChange={set('cbn')} required/>
              <Input label={t('b.vessel')} value={form.vessel} onChange={set('vessel')} required/>
              <Input label={t('b.voyage')} value={form.voyage} onChange={set('voyage')}/>
              <Input label={t('b.etd')} type="date" value={form.etd} onChange={set('etd')} required/>
              <Input label={t('b.eta')} type="date" value={form.eta} onChange={set('eta')}/>
              <Input label={t('b.siCutoff')} type="datetime-local" value={form.si_cutoff} onChange={set('si_cutoff')}/>
              <Input label={t('b.cyCutoff')} type="datetime-local" value={form.cy_cutoff} onChange={set('cy_cutoff')}/>
            </div>
            <div className="mt-4">
              <Button primary type="submit" busy={busy === 'carrier'}>
                {b.agent_status === 'confirmed' ? t('b.saveChanges') : t('b.saveConfirm')}
              </Button>
            </div>
          </Card>
        </form>
      )}

      {canEditCarrier && shipment && <ContainersCard bookingId={b.id} qty={b.qty} data={shipment} onChange={setShipment}/>}
      {b.agent_status === 'confirmed' && shipment && <MilestonesCard bookingId={b.id} data={shipment} onChange={setShipment}/>}

      <Card title={t('b.shipment')}>
        <Rows rows={[
          [t('b.pol'), b.pol], [t('b.pod'), b.pod],
          [t('b.equipment'), `${b.qty} × ${b.equip}`], [t('b.quotedCarrier'), b.rate_carrier],
          [t('b.routing'), b.routing], [t('b.transit'), b.transit ? t('b.transitDays', { n: b.transit }) : null],
          [t('b.cargoReady'), fmtDate(b.ready ?? b.etd_pref)], [t('b.incoterm'), b.incoterm],
        ]}/>
      </Card>
      <Card title={t('b.cargo')}>
        <Rows rows={[
          [t('b.commodity'), b.commodity], [t('b.hs'), b.hs],
          [t('b.packages'), b.pkgs ? `${b.pkgs} ${b.pkg_type ?? ''}`.trim() : null],
          [t('b.weight'), b.weight ? `${b.weight} kg` : null], [t('b.volume'), b.cbm ? `${b.cbm} m³` : null],
          [t('b.dg'), b.dg ? t('b.dgYes', { info: b.dg_info ?? t('b.dgToFollow') }) : t('b.no')],
        ]}/>
      </Card>
      <Card title={t('b.shipper')}>
        <Rows rows={[[t('b.name'), b.shipper_name], [t('b.contact'), b.shipper_contact], [t('b.phone'), b.shipper_phone], [t('b.email'), b.shipper_email], [t('b.address'), b.shipper_addr], [t('b.collection'), b.pickup_addr]]}/>
      </Card>
      <Card title={t('b.consignee')}>
        <Rows rows={[[t('b.name'), b.cons_name], [t('b.contact'), b.cons_contact], [t('b.phone'), b.cons_phone], [t('b.email'), b.cons_email], [t('b.eori'), b.cons_eori], [t('b.address'), b.cons_addr], [t('b.notify'), b.notify]]}/>
      </Card>
      {b.instructions && <Card title={t('b.instructions')}><p className="whitespace-pre-wrap text-sm">{b.instructions}</p></Card>}

      <p className="mt-6 text-xs" style={{ color: 'var(--muted)' }}>
        {t('b.assigned', { date: fmtDateTime(b.agent_assigned_at) })}
        {b.agent_accepted_at && ` · ${t('b.acceptedAt', { date: fmtDateTime(b.agent_accepted_at) })}`}
        {b.agent_confirmed_at && ` · ${t('b.confirmedAt', { date: fmtDateTime(b.agent_confirmed_at) })}`}
      </p>
    </Shell>
  )
}

function Card({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="mt-4 rounded-2xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">{icon}{title}</h2>
      {children}
    </section>
  )
}

function Rows({ rows }: { rows: [string, string | number | null | undefined][] }) {
  return (
    <dl className="grid gap-x-4 gap-y-2 text-sm sm:grid-cols-2">
      {rows.map(([k, v]) => (
        <div key={k} className="min-w-0">
          <dt className="text-xs" style={{ color: 'var(--muted)' }}>{k}</dt>
          <dd className="break-words whitespace-pre-wrap">{v === null || v === undefined || v === '' ? '—' : v}</dd>
        </div>
      ))}
    </dl>
  )
}

function Input({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <input {...props} className="tt-input mt-1.5"/>
    </label>
  )
}

function Button({ children, onClick, busy, icon, primary, danger, type = 'button' }: {
  children: React.ReactNode; onClick?: () => void; busy?: boolean; icon?: React.ReactNode
  primary?: boolean; danger?: boolean; type?: 'button' | 'submit'
}) {
  const bg = danger ? 'var(--bad)' : primary ? 'var(--navy)' : 'var(--surface)'
  return (
    <button type={type} onClick={onClick} disabled={busy}
      className="flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold disabled:opacity-60"
      style={{ background: bg, color: primary || danger ? '#FFFFFF' : 'var(--text)', border: primary || danger ? 'none' : '1px solid var(--border)' }}>
      {busy ? <Loader2 className="h-4 w-4 animate-spin"/> : icon}{children}
    </button>
  )
}
