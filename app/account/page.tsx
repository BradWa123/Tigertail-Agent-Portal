'use client'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import Shell from '@/components/Shell'
import PasswordRules, { meetsRules } from '@/components/PasswordRules'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

export default function AccountPage() {
  const { user } = useAuth()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setDone(false)
    if (!meetsRules(next)) return setError('The new password doesn’t meet all the rules.')
    if (next !== confirm)  return setError('The new passwords don’t match.')
    setBusy(true)
    try {
      await api.put('/auth/password', { current_password: current, new_password: next })
      setDone(true); setCurrent(''); setNext(''); setConfirm('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not change your password')
    } finally { setBusy(false) }
  }

  return (
    <Shell>
      <h1 className="text-lg font-semibold">Account</h1>
      <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>{user?.email}</p>

      <form onSubmit={onSubmit} className="mt-6 rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h2 className="font-semibold">Change password</h2>
        <input type="email" autoComplete="username" className="hidden" readOnly value={user?.email ?? ''}/>
        <label htmlFor="cur" className="mt-4 block text-sm font-medium">Current password</label>
        <input id="cur" type="password" autoComplete="current-password" required value={current}
          onChange={e => setCurrent(e.target.value)} className="tt-input mt-1.5"/>
        <label htmlFor="new" className="mt-4 block text-sm font-medium">New password</label>
        <input id="new" type="password" autoComplete="new-password" required value={next}
          onChange={e => setNext(e.target.value)} className="tt-input mt-1.5"/>
        <PasswordRules password={next}/>
        <label htmlFor="conf" className="mt-4 block text-sm font-medium">Confirm new password</label>
        <input id="conf" type="password" autoComplete="new-password" required value={confirm}
          onChange={e => setConfirm(e.target.value)} className="tt-input mt-1.5"/>
        {error && <p role="alert" className="mt-4 rounded-lg px-3 py-2 text-sm" style={{ background: 'var(--bad-soft)', color: 'var(--bad)' }}>{error}</p>}
        {done && <p role="status" className="mt-4 rounded-lg px-3 py-2 text-sm" style={{ background: 'var(--ok-soft)', color: 'var(--ok)' }}>Password changed. Your other devices have been signed out.</p>}
        <button type="submit" disabled={busy}
          className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl font-semibold text-white disabled:opacity-60"
          style={{ background: 'var(--navy)' }}>
          {busy && <Loader2 className="h-4 w-4 animate-spin"/>}{busy ? 'Saving…' : 'Change password'}
        </button>
      </form>
    </Shell>
  )
}
