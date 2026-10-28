'use client'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import en, { type Messages } from '@/locales/en'
import zhCN from '@/locales/zh-CN'
import zhTW from '@/locales/zh-TW'
import vi from '@/locales/vi'
import de from '@/locales/de'
import fr from '@/locales/fr'
import nl from '@/locales/nl'
import pl from '@/locales/pl'
import es from '@/locales/es'
import { setFormatLocale } from '@/lib/format'

// Every language the portal offers. `name` is shown in that language so people can find their own.
export const LANGS = [
  { code: 'en',    name: 'English',          messages: en },
  { code: 'zh-CN', name: '简体中文',          messages: zhCN },
  { code: 'zh-TW', name: '繁體中文',          messages: zhTW },
  { code: 'vi',    name: 'Tiếng Việt',       messages: vi },
  { code: 'de',    name: 'Deutsch',          messages: de },
  { code: 'fr',    name: 'Français',         messages: fr },
  { code: 'nl',    name: 'Nederlands',       messages: nl },
  { code: 'pl',    name: 'Polski',           messages: pl },
  { code: 'es',    name: 'Español',          messages: es },
] as const

export type Lang = (typeof LANGS)[number]['code']
export type MessageKey = keyof Messages
type Vars = Record<string, string | number>

const STORAGE_KEY = 'ttl-lang'
const isLang = (v: unknown): v is Lang => LANGS.some(l => l.code === v)

// First visit: the browser's preferred language if we have it (zh-HK/zh-Hant → Traditional), else English
function detect(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (isLang(saved)) return saved
  } catch {}
  for (const raw of typeof navigator !== 'undefined' ? navigator.languages ?? [] : []) {
    const l = raw.toLowerCase()
    if (l.startsWith('zh')) return /hant|tw|hk|mo/.test(l) ? 'zh-TW' : 'zh-CN'
    const base = LANGS.find(x => x.code === l.split('-')[0])
    if (base) return base.code
  }
  return 'en'
}

interface I18n {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: MessageKey, vars?: Vars) => string
}

const I18nContext = createContext<I18n | null>(null)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')

  useEffect(() => { setLangState(detect()) }, [])

  useEffect(() => {
    document.documentElement.lang = lang
    setFormatLocale(lang === 'en' ? 'en-GB' : lang)
  }, [lang])

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    try { localStorage.setItem(STORAGE_KEY, l) } catch {}
  }, [])

  const t = useCallback((key: MessageKey, vars?: Vars) => {
    const dict = LANGS.find(l => l.code === lang)?.messages ?? en
    const text: string = dict[key] ?? en[key]
    return vars ? text.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m)) : text
  }, [lang])

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider')
  return ctx
}
