import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Платформа профорієнтаційного тестування',
  description: 'Допоможемо вам знайти свою професію',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="uk">
      <body>{children}</body>
    </html>
  )
}
