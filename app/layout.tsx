import type { Metadata } from 'next'
import './globals.css'
import { AppProviders } from '@/app/components/AppProviders'

export const metadata: Metadata = {
  title: 'Платформа профорієнтаційного тестування',
  description: 'Допоможемо вам знайти свою професію',
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="uk">
      <body className="font-sans">
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  )
}
