'use client'
import AuthFrame from '@/components/AuthFrame'
import LanguagePicker from '@/components/LanguagePicker'
import { useI18n } from '@/lib/i18n'

// Sign-in and invite screens: brand panel + form card, with the language choice above the form
export default function AuthCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  const { t } = useI18n()
  return (
    <AuthFrame eyebrow={t('auth.eyebrow')} headline={t('auth.headline')} blurb={t('auth.blurb')}>
      <div className="mb-3 flex justify-end"><LanguagePicker/></div>
      <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 10px 30px rgba(15,22,40,.06)' }}>
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--navy)' }}>{title}</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>{subtitle}</p>
        {children}
      </div>
    </AuthFrame>
  )
}
