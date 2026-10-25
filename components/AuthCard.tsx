import AuthFrame from '@/components/AuthFrame'

// Sign-in and invite screens: brand panel + form card
export default function AuthCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <AuthFrame eyebrow="Agent Portal" headline="Bookings and updates, in one place."
      blurb="For TigerTail’s origin agents: receive bookings, confirm with the line, add containers and record milestones — from your phone.">
      <div className="rounded-2xl p-6 sm:p-8" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 10px 30px rgba(15,22,40,.06)' }}>
        <h1 className="text-2xl font-semibold" style={{ color: 'var(--navy)' }}>{title}</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>{subtitle}</p>
        {children}
      </div>
    </AuthFrame>
  )
}
