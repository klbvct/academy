'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminSidebar() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen fixed left-0 top-0 pt-6">
      <div className="px-6 mb-8">
        <h2 className="text-2xl font-bold text-blue-400">Дизайн Освіти</h2>
        <p className="text-sm text-gray-400">Адмініструра</p>
      </div>

      <nav className="space-y-2 px-4">
        <Link
          href="/admin"
          className={`block px-4 py-3 rounded-lg transition ${
            isActive('/admin') || isActive('/admin/')
              ? 'bg-blue-600 text-white'
              : 'text-gray-300 hover:bg-gray-800'
          }`}
        >
          Користувачі
        </Link>
      </nav>

      <div className="absolute bottom-6 left-4 right-4 border-t border-gray-700 pt-4">
        <button
          onClick={() => {
            localStorage.removeItem('token')
            window.location.href = '/login'
          }}
          className="w-full px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-lg text-sm transition text-left"
        >
          🚪 Вийти
        </button>
      </div>
    </aside>
  )
}
