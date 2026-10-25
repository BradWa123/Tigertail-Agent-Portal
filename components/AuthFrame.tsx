import Image from 'next/image'

// Sign-in layout shared by the control tower, customer portal and Agent Portal.
// Navy brand panel (as on tigertaillogistics.com) beside a light form; stacks on phones.
export default function AuthFrame({ eyebrow, headline, blurb, children }: {
  eyebrow: string; headline: string; blurb: string; children: React.ReactNode
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]" style={{ background: 'var(--bg)' }}>
      <aside className="on-dark relative flex flex-col justify-between overflow-hidden px-6 py-6 sm:px-10 lg:px-14 lg:py-14"
        style={{ background: 'var(--navy)' }}>
        <Image src="/logo.svg" alt="TigerTail Logistics" width={220} height={103} priority
          className="h-auto w-[150px] lg:w-[220px]"/>
        <div className="mt-6 hidden lg:block">
          <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--gold)' }}>{eyebrow}</p>
          <h2 className="mt-4 max-w-md text-4xl font-semibold leading-tight text-white">{headline}</h2>
          <div className="mt-6 h-px w-16" style={{ background: 'var(--gold)' }}/>
          <p className="mt-6 max-w-md text-base leading-relaxed" style={{ color: '#A8BDD0' }}>{blurb}</p>
        </div>
        <p className="mt-3 text-sm lg:hidden" style={{ color: '#A8BDD0' }}>{eyebrow}</p>
        <p className="hidden text-sm lg:block" style={{ color: '#8A9DB8' }}>tigertaillogistics.com</p>
        {/* Brand swoosh, decorative */}
        <svg aria-hidden="true" className="pointer-events-none absolute -bottom-24 -right-24 hidden h-[420px] w-[420px] opacity-[0.07] lg:block" viewBox="0 0 200 200">
          <path d="M10 150 C 60 60, 140 40, 190 60" stroke="#C9A96E" strokeWidth="14" fill="none" strokeLinecap="round"/>
          <path d="M30 175 C 80 95, 150 85, 195 100" stroke="#7DAEB0" strokeWidth="10" fill="none" strokeLinecap="round"/>
        </svg>
      </aside>
      <main className="flex items-start justify-center px-4 py-8 sm:px-8 lg:items-center">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  )
}
