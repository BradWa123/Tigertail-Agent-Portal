import { CheckCircle2 } from 'lucide-react'

// Mirrors the backend rule (utils/password.js) so problems show before submitting
export const RULES = [
  { label: '12 or more characters', test: (p: string) => p.length >= 12 },
  { label: 'An uppercase letter',   test: (p: string) => /[A-Z]/.test(p) },
  { label: 'A number',              test: (p: string) => /[0-9]/.test(p) },
  { label: 'A special character',   test: (p: string) => /[^A-Za-z0-9]/.test(p) },
]
export const meetsRules = (p: string) => RULES.every(r => r.test(p))

export default function PasswordRules({ password }: { password: string }) {
  return (
    <ul className="mt-2 space-y-1 text-xs">
      {RULES.map(r => {
        const ok = r.test(password)
        return (
          <li key={r.label} className="flex items-center gap-1.5" style={{ color: ok ? 'var(--ok)' : 'var(--muted)' }}>
            <CheckCircle2 className="h-3.5 w-3.5" style={{ opacity: ok ? 1 : 0.35 }}/>{r.label}
          </li>
        )
      })}
    </ul>
  )
}
