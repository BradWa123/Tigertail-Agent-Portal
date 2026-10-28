'use client'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import Shell from '@/components/Shell'
import PasswordRules, { meetsRules } from '@/components/PasswordRules'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { useI18n } from '@/lib/i18n'
import LanguagePicker from '@/components/LanguagePicker'

export default function AccountPage() {
  const { user } = useAuth()
  const { t } = useI18n()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setDone(false)
    if (!meetsRules(next)) return setError(t('pw.newNotMet'))
    if (next !== confirm)  return setError(t('pw.newMismatch'))
    setBusy(true)
    try {
      await api.put('/auth/password', { current_password: current, new_password: next })
      setDone(true); setCurrent(''); setNext(''); setConfirm('')
    } catch (err) {
      setError(err instanceof Error ? err.message : t('account.changeFailed'))
    } finally { setBusy(false) }
  }

  return (
    <Shell>
      <h1 className="text-lg font-semibold">{t('account.title')}</h1>
      <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>{user?.email}</p>

      <section className="mt-6 rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h2 className="font-semibold">{t('account.language')}</h2>
        <p className="mb-3 mt-1 text-sm" style={{ color: 'var(--muted)' }}>{t('account.languageHelp')}</p>
        <div className="inline-flex"><LanguagePicker/></div>
      </section>

      <form onSubmit={onSubmit} className="mt-4 rounded-2xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h2 className="font-semibold">{t('account.changePassword')}</h2>
        <input type="email" autoComplete="username" className="hidden" readOnly value={user?.email ?? ''}/>
        <label htmlFor="cur" className="mt-4 block text-sm font-medium">{t('pw.current')}</label>
        <input id="cur" type="password" autoComplete="current-password" required value={current}
          onChange={e => setCurrent(e.target.value)} className="tt-input mt-1.5"/>
        <label htmlFor="new" className="mt-4 block text-sm font-medium">{t('pw.new')}</label>
        <input id="new" type="password" autoComplete="new-password" required value={next}
          onChange={e => setNext(e.target.value)} className="tt-input mt-1.5"/>
        <PasswordRules password={next}/>
        <label htmlFor="conf" className="mt-4 block text-sm font-medium">{t('pw.confirmNew')}</label>
        <input id="conf" type="password" autoComplete="new-password" required value={confirm}
          onChange={e => setConfirm(e.target.value)} className="tt-input mt-1.5"/>
        {error && <p role="alert" className="mt-4 rounded-lg px-3 py-2 text-sm" style={{ background: 'var(--bad-soft)', color: 'var(--bad)' }}>{error}</p>}
        {done && <p role="status" className="mt-4 rounded-lg px-3 py-2 text-sm" style={{ background: 'var(--ok-soft)', color: 'var(--ok)' }}>{t('account.changed')}</p>}
        <button type="submit" disabled={busy}
          className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl font-semibold text-white disabled:opacity-60"
          style={{ background: 'var(--navy)' }}>
          {busy && <Loader2 className="h-4 w-4 animate-spin"/>}{busy ? t('common.saving') : t('account.changePassword')}
        </button>
      </form>
    </Shell>
  )
}
