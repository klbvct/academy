export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 py-8 mt-auto">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h4 className="text-white font-semibold mb-4">Дизайн Освіти</h4>
            <p>Платформа для розкриття вашого потенціалу</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Навігація</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white">Про нас</a></li>
              <li><a href="#" className="hover:text-white">Тести</a></li>
              <li><a href="#" className="hover:text-white">Контакти</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Допомога</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white">FAQ</a></li>
              <li><a href="#" className="hover:text-white">Умови використання</a></li>
              <li><a href="#" className="hover:text-white">Політика приватності</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-8 text-center">
          <p>&copy; 2026 Дизайн Освіти. Всі права захищені.</p>
        </div>
      </div>
    </footer>
  )
}
