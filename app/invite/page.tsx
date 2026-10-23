'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import AuthCard from '@/components/AuthCard'
import PasswordRules, { meetsRules } from '@/components/PasswordRules'
import { api, type AgentUser } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'

// The invite token arrives in the URL fragment (#token=…), which browsers never send to servers
export default function InvitePage() {
  const { signIn } = useAuth()
  const router = useRouter()
  const [token, setTokenValue] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const t = new URLSearchParams(window.location.hash.slice(1)).get('token') ?? ''
    setTokenValue(t)
    // Drop the token from the address bar and history once read
    window.history.replaceState(null, '', '/invite')
  }, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!meetsRules(password)) return setError('Your password doesn’t meet all the rules yet.')
    if (password !== confirm)  return setError('The passwords don’t match.')
    setBusy(true)
    try {
      const r = await api.post<{ token: string; user: AgentUser }>('/auth/accept-invite', { token, password })
      signIn(r.token, r.user)
      router.replace('/bookings')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not set your password')
    } finally { setBusy(false) }
  }

  return (
    <AuthCard title="Set your password" subtitle="Welcome to the TigerTail Agent Portal">
      {!token ? (
        <p className="mt-6 rounded-lg px-3 py-2 text-sm" style={{ background: 'var(--warn-soft)', color: 'var(--warn)' }}>
          This page needs the link from your invite email. Open the email and tap the button again.
        </p>
      ) : (
        <form onSubmit={onSubmit}>
          <label htmlFor="pw" className="mt-6 block text-sm font-medium">New password</label>
          <input id="pw" type="password" autoComplete="new-password" required value={password}
            onChange={e => setPassword(e.target.value)} className="tt-input mt-1.5"/>
          <PasswordRules password={password}/>
          <label htmlFor="pw2" className="mt-4 block text-sm font-medium">Confirm password</label>
          <input id="pw2" type="password" autoComplete="new-password" required value={confirm}
            onChange={e => setConfirm(e.target.value)} className="tt-input mt-1.5"/>
          {error && <p role="alert" className="mt-4 rounded-lg px-3 py-2 text-sm" style={{ background: 'var(--bad-soft)', color: 'var(--bad)' }}>{error}</p>}
          <button type="submit" disabled={busy}
            className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl font-semibold text-white disabled:opacity-60"
            style={{ background: 'var(--navy)' }}>
            {busy && <Loader2 className="h-4 w-4 animate-spin"/>}
            {busy ? 'Saving…' : 'Set password and sign in'}
          </button>
        </form>
      )}
    </AuthCard>
  )
}
