import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AppProviders } from '@/app/components/AppProviders'

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
})

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
    <html lang="uk" className={inter.variable}>
      <body className="font-sans">
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  )
}
