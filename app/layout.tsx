import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { I18nProvider } from '@/lib/i18n'

export const metadata: Metadata = {
  title: 'TigerTail Agent Portal',
  description: 'Bookings, shipment updates and documents for TigerTail POL agents',
  robots: { index: false, follow: false },
}

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#0D1B2E' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <I18nProvider>
          <AuthProvider>{children}</AuthProvider>
        </I18nProvider>
      </body>
    </html>
  )
}
