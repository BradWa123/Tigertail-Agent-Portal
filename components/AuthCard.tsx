import Image from 'next/image'

// Centred card used by the sign-in and invite screens
export default function AuthCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl p-6 sm:p-8" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="mb-6 flex justify-center">
          <Image src="/logo-dark.svg" alt="TigerTail Logistics" width={170} height={70} style={{ objectFit: 'contain' }} priority/>
        </div>
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>{subtitle}</p>
        {children}
      </div>
    </div>
  )
}
