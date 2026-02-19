import type { Metadata } from 'next'
import './globals.css'
import { AppProviders } from '@/app/components/AppProviders'

export const metadata: Metadata = {
  title: 'Платформа профорієнтаційного тестування',
  description: 'Допоможемо вам знайти свою професію',
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="uk">
      <body>
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  )
}
