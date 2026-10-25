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
      <header className="on-dark sticky top-0 z-30 flex items-center gap-3 px-4 py-2.5" style={{ background: 'var(--navy)' }}>
        <Link href="/bookings" aria-label="Bookings">
          <Image src="/logo.svg" alt="TigerTail Logistics" width={100} height={47} priority className="h-auto w-[88px] sm:w-[100px]"/>
        </Link>
        <div className="min-w-0 flex-1 border-l pl-3" style={{ borderColor: 'rgba(255,255,255,0.18)' }}>
          <div className="truncate text-sm font-semibold text-white">{user.agent.name}</div>
          <div className="truncate text-xs" style={{ color: '#A8BDD0' }}>{user.name}</div>
        </div>
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = path.startsWith(href)
            return (
              <Link key={href} href={href} aria-current={active ? 'page' : undefined}
                className="flex min-h-11 items-center gap-2 px-3 text-sm font-medium"
                style={{ color: active ? '#FFFFFF' : '#A8BDD0', borderBottom: `3px solid ${active ? 'var(--gold)' : 'transparent'}` }}>
                <Icon className="h-4 w-4"/>{label}
              </Link>
            )
          })}
        </nav>
        <button onClick={signOut} className="flex h-11 w-11 items-center justify-center rounded-lg" aria-label="Sign out" style={{ color: '#A8BDD0' }}>
          <LogOut className="h-5 w-5"/>
        </button>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-5">{children}</main>

      <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-2 md:hidden" style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} aria-current={path.startsWith(href) ? 'page' : undefined}
            className="flex h-16 flex-col items-center justify-center gap-1 text-xs font-semibold"
            style={{ color: path.startsWith(href) ? 'var(--navy)' : 'var(--muted)', borderTop: `3px solid ${path.startsWith(href) ? 'var(--gold)' : 'transparent'}` }}>
            <Icon className="h-5 w-5"/>{label}
          </Link>
        ))}
      </nav>
    </div>
  )
}
