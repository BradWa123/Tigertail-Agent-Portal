'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Lock } from 'lucide-react'
import AuthCard from '@/components/AuthCard'
import { api, type AgentUser } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

export default function SignInPage() {
  const { user, loading, signIn } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { if (!loading && user) router.replace('/bookings') }, [loading, user, router])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setError('')
    try {
      const r = await api.post<{ token: string; user: AgentUser }>('/auth/login', { email, password })
      signIn(r.token, r.user)
      router.replace('/bookings')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed')
    } finally { setBusy(false) }
  }

  return (
    <AuthCard title="Agent sign in" subtitle="TigerTail Logistics — POL agents">
      <form onSubmit={onSubmit}>
        <label htmlFor="email" className="mt-6 block text-sm font-medium">Email</label>
        <input id="email" type="email" autoComplete="username" required value={email}
          onChange={e => setEmail(e.target.value)} className="tt-input mt-1.5"/>
        <label htmlFor="password" className="mt-4 block text-sm font-medium">Password</label>
        <input id="password" type="password" autoComplete="current-password" required value={password}
          onChange={e => setPassword(e.target.value)} className="tt-input mt-1.5"/>
        {error && <p role="alert" className="mt-4 rounded-lg px-3 py-2 text-sm" style={{ background: 'var(--bad-soft)', color: 'var(--bad)' }}>{error}</p>}
        <button type="submit" disabled={busy}
          className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl font-semibold text-white disabled:opacity-60"
          style={{ background: 'var(--navy)' }}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin"/> : <Lock className="h-4 w-4"/>}
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
        <p className="mt-5 text-center text-xs" style={{ color: 'var(--muted)' }}>
          Forgotten your password? Ask your TigerTail contact to send a reset link.
        </p>
      </form>
    </AuthCard>
  )
}
