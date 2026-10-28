'use client'
import { CheckCircle2 } from 'lucide-react'
import { useI18n, type MessageKey } from '@/lib/i18n'

// Mirrors the backend rule (utils/password.js) so problems show before submitting
export const RULES: { label: MessageKey; test: (p: string) => boolean }[] = [
  { label: 'pw.rule.length',  test: p => p.length >= 12 },
  { label: 'pw.rule.upper',   test: p => /[A-Z]/.test(p) },
  { label: 'pw.rule.number',  test: p => /[0-9]/.test(p) },
  { label: 'pw.rule.special', test: p => /[^A-Za-z0-9]/.test(p) },
]
export const meetsRules = (p: string) => RULES.every(r => r.test(p))

export default function PasswordRules({ password }: { password: string }) {
  const { t } = useI18n()
  return (
    <ul className="mt-2 space-y-1 text-xs">
      {RULES.map(r => {
        const ok = r.test(password)
        return (
          <li key={r.label} className="flex items-center gap-1.5" style={{ color: ok ? 'var(--ok)' : 'var(--muted)' }}>
            <CheckCircle2 className="h-3.5 w-3.5" style={{ opacity: ok ? 1 : 0.35 }}/>{t(r.label)}
          </li>
        )
      })}
    </ul>
  )
}
