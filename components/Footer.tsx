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
            <h4 className="text-white font-semibold mb-4">Контакти</h4>
            <ul className="space-y-2 text-base">
              <li className="text-white font-medium">ТОВ «ОТЦ ЄВРОПА»</li>
              <li>Код ЄДРПОУ: 39292789</li>
              <li>Україна, м. Запоріжжя,<br />вул. Дзержинського, оф. 84</li>
              <li>
                <a href="tel:+380663223011" className="hover:text-white">+380663223011</a>
              </li>
              <li>
                <a href="mailto:admin@education-design.com.ua" className="hover:text-white">admin@education-design.com.ua</a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Допомога</h4>
            <ul className="space-y-2">
              <li><a href="/oferta" className="hover:text-white">Договір оферти</a></li>
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
