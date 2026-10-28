'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, Lock } from 'lucide-react'
import AuthCard from '@/components/AuthCard'
import { api, type AgentUser } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { useI18n } from '@/lib/i18n'

export default function SignInPage() {
  const { user, loading, signIn } = useAuth()
  const router = useRouter()
  const { t } = useI18n()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [show, setShow] = useState(false)

  useEffect(() => { if (!loading && user) router.replace('/bookings') }, [loading, user, router])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true); setError('')
    try {
      const r = await api.post<{ token: string; user: AgentUser }>('/auth/login', { email, password })
      signIn(r.token, r.user)
      router.replace('/bookings')
    } catch (err) {
      setError(err instanceof Error ? err.message : t('signIn.failed'))
    } finally { setBusy(false) }
  }

  return (
    <AuthCard title={t('signIn.title')} subtitle={t('signIn.subtitle')}>
      <form onSubmit={onSubmit}>
        <label htmlFor="email" className="mt-6 block text-sm font-medium">{t('signIn.email')}</label>
        <input id="email" type="email" autoComplete="username" required value={email}
          onChange={e => setEmail(e.target.value)} className="tt-input mt-1.5"/>
        <label htmlFor="password" className="mt-4 block text-sm font-medium">{t('signIn.password')}</label>
        <div className="relative mt-1.5">
          <input id="password" type={show ? 'text' : 'password'} autoComplete="current-password" required value={password}
            onChange={e => setPassword(e.target.value)} className="tt-input" style={{ paddingRight: 48 }}/>
          <button type="button" onClick={() => setShow(v => !v)} aria-label={show ? t('signIn.hide') : t('signIn.show')}
            className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center" style={{ color: 'var(--muted)' }}>
            {show ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
          </button>
        </div>
        {error && <p role="alert" className="mt-4 rounded-lg px-3 py-2 text-sm" style={{ background: 'var(--bad-soft)', color: 'var(--bad)' }}>{error}</p>}
        <button type="submit" disabled={busy}
          className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl font-semibold text-white disabled:opacity-60"
          style={{ background: 'var(--navy)' }}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin"/> : <Lock className="h-4 w-4"/>}
          {busy ? t('signIn.busy') : t('signIn.button')}
        </button>
        <p className="mt-5 text-center text-xs" style={{ color: 'var(--muted)' }}>
          {t('signIn.forgot')}
        </p>
      </form>
    </AuthCard>
  )
}
