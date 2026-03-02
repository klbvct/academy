'use client'

import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function Oferta() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 py-16">
          {/* Посилання назад */}
          <div className="mb-6">
            <Link href="/" className="text-sm text-blue-600 hover:underline">
              ← Повернутися на сайт
            </Link>
          </div>

          {/* Заголовок */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700 mb-6">
              Юридична інформація
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              ПУБЛІЧНИЙ ДОГОВІР (ОФЕРТА)
            </h1>
            <p className="text-lg text-gray-500">
              про надання послуг з профорієнтаційного тестування
            </p>
          </div>

          {/* Вступний текст */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
            <p className="text-gray-600 leading-relaxed">
              Цей договір є офіційною та публічною пропозицією Виконавця укласти договір надання послуг,
              представлених на сайті{' '}
              <a href="https://academy.education-design.com.ua/" className="text-blue-600 hover:underline">
                https://academy.education-design.com.ua/
              </a>
              . Даний договір є публічним, тобто відповідно до статті 633 Цивільного кодексу України,
              його умови є однаковими для всіх користувачів. Шляхом оплати послуг або проходження
              тестування користувач у повному обсязі приймає умови цього Договору.
            </p>
          </div>

          {/* Розділи */}
          <div className="space-y-4">

            {/* 1 */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">1. Визначення термінів</h2>
              <ol className="space-y-3 list-decimal list-inside text-gray-600">
                <li className="leading-relaxed">
                  <strong className="text-gray-800">Публічна оферта</strong> — публічна пропозиція Виконавця укласти договір надання послуг дистанційним способом.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-gray-800">Послуга</strong> — надання доступу до профорієнтаційного тестування та отримання результатів тестування в електронному вигляді.
                </li>
                <li className="leading-relaxed">
                  <strong className="text-gray-800">Виконавець</strong> — ТОВ «ОТЦ ЄВРОПА» (код ЄДРПОУ 39292789).
                </li>
                <li className="leading-relaxed">
                  <strong className="text-gray-800">Користувач</strong> — будь-яка дієздатна особа, яка акцептувала умови цього Договору.
                </li>
              </ol>
            </div>

            {/* 2 */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">2. Предмет Договору</h2>
              <ol className="space-y-3 list-decimal list-inside text-gray-600">
                <li className="leading-relaxed">
                  Виконавець зобов'язується надати Користувачу доступ до профорієнтаційного тестування, а Користувач зобов'язується оплатити та прийняти Послугу на умовах цього Договору.
                </li>
                <li className="leading-relaxed">
                  Моментом повного прийняття умов вважається дата оплати Послуги Користувачем на сайті.
                </li>
              </ol>
            </div>

            {/* 3 */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">3. Порядок отримання Послуги</h2>
              <ol className="space-y-3 list-decimal list-inside text-gray-600">
                <li className="leading-relaxed">Користувач самостійно оформлює замовлення на сайті.</li>
                <li className="leading-relaxed">Доступ до тестування надається Користувачу автоматично або після отримання підтвердження оплати.</li>
                <li className="leading-relaxed">Результати тестування надаються в електронному вигляді на сайті або надсилаються на вказану Користувачем електронну адресу.</li>
              </ol>
            </div>

            {/* 4 */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">4. Ціна та Порядок розрахунків</h2>
              <ol className="space-y-3 list-decimal list-inside text-gray-600">
                <li className="leading-relaxed">Ціни на Послуги вказані на сайті Виконавця у гривнях.</li>
                <li className="leading-relaxed">Розрахунки здійснюються за допомогою платіжних систем, вказаних на сайті.</li>
                <li className="leading-relaxed">Зобов'язання з оплати вважаються виконаними з моменту надходження коштів на рахунок Виконавця.</li>
              </ol>
            </div>

            {/* 5 */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">5. Права та обов'язки Сторін</h2>
              <p className="font-semibold text-gray-800 mb-2">5.1. Виконавець зобов'язаний:</p>
              <ul className="space-y-2 mb-4 text-gray-600">
                <li className="flex items-start gap-2 leading-relaxed">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                  Надати Послугу якісно та у відповідності до умов цього Договору.
                </li>
                <li className="flex items-start gap-2 leading-relaxed">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                  Не розголошувати персональні дані Користувача третім особам.
                </li>
              </ul>
              <p className="font-semibold text-gray-800 mb-2">5.2. Користувач зобов'язується:</p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2 leading-relaxed">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                  Ознайомитися з умовами Договору до моменту оплати.
                </li>
                <li className="flex items-start gap-2 leading-relaxed">
                  <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                  Надати достовірні дані (E-mail, ім'я) для отримання Послуги.
                </li>
              </ul>
            </div>

            {/* 6 */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">6. Повернення коштів</h2>
              <ol className="space-y-3 list-decimal list-inside text-gray-600">
                <li className="leading-relaxed">
                  Оскільки Послуга має характер цифрового контенту та надається миттєво після оплати, повернення коштів після отримання доступу до тестування або отримання його результатів не здійснюється, згідно з чинним законодавством України.
                </li>
                <li className="leading-relaxed">
                  У разі технічних помилок з боку Виконавця, що унеможливили проходження тесту, Користувач має право вимагати повторного надання доступу або повернення коштів протягом 14 днів.
                </li>
              </ol>
            </div>

            {/* 7 */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">7. Конфіденційність</h2>
              <ol className="space-y-3 list-decimal list-inside text-gray-600">
                <li className="leading-relaxed">Користувач надає згоду на обробку персональних даних для виконання умов цього Договору.</li>
                <li className="leading-relaxed">Виконавець гарантує захист даних відповідно до Закону України «Про захист персональних даних».</li>
              </ol>
            </div>

            {/* 8 */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">8. Реквізити Виконавця</h2>
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 space-y-2 text-gray-700">
                <p className="font-semibold text-gray-900">ТОВ «ОТЦ ЄВРОПА»</p>
                <p>Код ЄДРПОУ: <span className="font-medium">39292789</span></p>
                <p>Адреса: Україна, м. Запоріжжя, вул. Дзержинського, оф. 84</p>
                <p>IBAN: <span className="font-medium">UA593133990000026006055725575</span> в АТ «ПРИВАТБАНК»</p>
              </div>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  )
}
