'use client'
import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Inbox, UserCog, LogOut } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const NAV = [
  { href: '/bookings', label: 'Bookings', icon: Inbox },
  { href: '/account',  label: 'Account',  icon: UserCog },
]

// Signed-in frame: compact header, and a bottom tab bar on phones
export default function Shell({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const path = usePathname()

  useEffect(() => { if (!loading && !user) router.replace('/') }, [loading, user, router])
  if (loading || !user) return <div className="flex min-h-screen items-center justify-center" style={{ color: 'var(--muted)' }}>Loading…</div>

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <header className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <Image src="/logo-dark.svg" alt="TigerTail Logistics" width={96} height={40} style={{ objectFit: 'contain' }} priority/>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">{user.agent.name}</div>
          <div className="truncate text-xs" style={{ color: 'var(--muted)' }}>{user.name}</div>
        </div>
        <nav className="hidden md:flex items-center gap-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium"
              style={path.startsWith(href) ? { background: 'var(--bg)', color: 'var(--navy)' } : { color: 'var(--muted)' }}>
              <Icon className="h-4 w-4"/>{label}
            </Link>
          ))}
        </nav>
        <button onClick={signOut} className="flex h-11 w-11 items-center justify-center rounded-lg" aria-label="Sign out" style={{ color: 'var(--muted)' }}>
          <LogOut className="h-5 w-5"/>
        </button>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-5">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-2 md:hidden" style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className="flex h-16 flex-col items-center justify-center gap-1 text-xs font-medium"
            style={{ color: path.startsWith(href) ? 'var(--navy)' : 'var(--muted)' }}>
            <Icon className="h-5 w-5"/>{label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
