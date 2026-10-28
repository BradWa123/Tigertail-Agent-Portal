'use client'
import { Globe } from 'lucide-react'
import { LANGS, useI18n, type Lang } from '@/lib/i18n'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/lib/api'

// A native <select> so it works with phone pickers and screen readers out of the box
export default function LanguagePicker({ dark = false }: { dark?: boolean }) {
  const { lang, setLang, t } = useI18n()
  const { user } = useAuth()
  // Signed in: also save it to the account, so other devices and TigerTail's emails use it
  const choose = (l: Lang) => { setLang(l); if (user) api.put('/auth/language', { lang: l }).catch(() => {}) }
  return (
    <label className={`lang-picker ${dark ? 'lang-picker-dark' : ''} relative flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-lg px-2 text-sm font-medium`}
      style={{ color: dark ? '#FFFFFF' : 'var(--text)', border: `1px solid ${dark ? 'rgba(255,255,255,0.22)' : 'var(--border)'}`, background: dark ? 'transparent' : 'var(--surface)' }}>
      <Globe className="h-4 w-4 shrink-0" style={{ color: dark ? '#A8BDD0' : 'var(--muted)' }} aria-hidden/>
      {/* In the dark header on phones only the globe shows; the invisible select still covers it, so a tap opens the picker */}
      <select value={lang} onChange={e => choose(e.target.value as Lang)} aria-label={t('lang.label')}
        className={`cursor-pointer appearance-none bg-transparent pr-1 outline-none ${dark ? 'absolute inset-0 opacity-0 sm:static sm:opacity-100' : ''}`}
        style={{ color: 'inherit' }}>
        {LANGS.map(l => <option key={l.code} value={l.code} style={{ color: '#0F1628' }}>{l.name}</option>)}
      </select>
    </label>
  )
}
