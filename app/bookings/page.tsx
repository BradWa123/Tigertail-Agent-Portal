'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Inbox, ChevronRight } from 'lucide-react'
import Shell from '@/components/Shell'
import StatusBadge from '@/components/StatusBadge'
import { api, type Booking } from '@/lib/api'
import { fmtDate } from '@/lib/format'

const GROUPS: { title: string; match: Booking['agent_status'][] }[] = [
  { title: 'New',         match: ['assigned'] },
  { title: 'In progress', match: ['accepted', 'submitted'] },
  { title: 'Confirmed',   match: ['confirmed'] },
  { title: 'Declined',    match: ['declined'] },
]

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get<Booking[]>('/bookings').then(setBookings).catch(e => setError(e.message))
  }, [])

  return (
    <Shell>
      <h1 className="text-lg font-semibold">Bookings</h1>
      {error && <p className="mt-4 rounded-lg px-3 py-2 text-sm" style={{ background: 'var(--bad-soft)', color: 'var(--bad)' }}>{error}</p>}
      {!bookings ? (
        !error && <p className="mt-6 text-sm" style={{ color: 'var(--muted)' }}>Loading…</p>
      ) : bookings.length === 0 ? (
        <div className="mt-6 rounded-2xl px-6 py-12 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <Inbox className="mx-auto mb-3 h-10 w-10 opacity-30"/>
          <p className="font-medium">No bookings yet</p>
          <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>When TigerTail assigns you a booking it will appear here, and we’ll email you.</p>
        </div>
      ) : (
        GROUPS.map(g => {
          const items = bookings.filter(b => g.match.includes(b.agent_status))
          if (!items.length) return null
          return (
            <section key={g.title} className="mt-6">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted)' }}>{g.title} · {items.length}</h2>
              <ul className="space-y-2">
                {items.map(b => (
                  <li key={b.id}>
                    <Link href={`/bookings/${b.id}`} className="flex items-center gap-3 rounded-2xl p-4"
                      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold">{b.pol} → {b.pod}</span>
                          <StatusBadge status={b.agent_status}/>
                        </div>
                        <div className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
                          {b.qty} × {b.equip} · {b.carrier || b.rate_carrier || 'Carrier TBC'}
                        </div>
                        <div className="mt-0.5 text-xs" style={{ color: 'var(--muted)' }}>
                          {b.ref} · {b.etd ? `ETD ${fmtDate(b.etd)}` : `Cargo ready ${fmtDate(b.ready ?? b.etd_pref)}`}
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 shrink-0" style={{ color: 'var(--muted)' }}/>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )
        })
      )}
    </Shell>
  )
}
