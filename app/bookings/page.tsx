'use client'
import { Inbox } from 'lucide-react'
import Shell from '@/components/Shell'

export default function BookingsPage() {
  return (
    <Shell>
      <h1 className="text-lg font-semibold">Bookings</h1>
      <div className="mt-6 rounded-2xl px-6 py-12 text-center" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <Inbox className="mx-auto mb-3 h-10 w-10 opacity-30"/>
        <p className="font-medium">No bookings yet</p>
        <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
          When TigerTail assigns you a booking it will appear here, and we’ll email you.
        </p>
      </div>
    </Shell>
  )
}
