import Link from 'next/link'

export default function Header() {
  return (
    <header className="sticky top-0 bg-white shadow-sm z-40">
      <nav className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
          <h1 className="text-xl font-bold text-primary">Дизайн Освіти</h1>
        </Link>
        <div className="flex gap-4">
          <Link href="/login" className="px-4 py-2 text-primary hover:font-semibold">
            Вхід
          </Link>
          <Link href="/register" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition">
            Реєстрація
          </Link>
        </div>
      </nav>
    </header>
  )
}
