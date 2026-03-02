'use client'

import Link from 'next/link'

export default function Oferta() {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-6 prose prose-sm">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:underline">
            ← Повернутися на сайт
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-8">ПУБЛІЧНИЙ ДОГОВІР (ОФЕРТА)</h1>
        <p className="text-gray-600 mb-6">про надання послуг з профорієнтаційного тестування</p>

        <div className="text-gray-700 space-y-6">
          <p>
            Цей договір є офіційною та публічною пропозицією Виконавця укласти договір надання послуг,
            представлених на сайті{' '}
            <a href="https://academy.education-design.com.ua/" className="text-blue-600 hover:underline">
              https://academy.education-design.com.ua/
            </a>
            . Даний договір є публічним, тобто відповідно до статті 633 Цивільного кодексу України, його умови є однаковими для всіх користувачів. Шляхом оплати послуг або проходження тестування
            користувач у повному обсязі приймає умови цього Договору.
          </p>

          <section>
            <h2 className="text-2xl font-bold mb-4">1. Визначення термінів</h2>
            <ul className="list-decimal list-inside space-y-2 ml-4">
              <li>
                <strong>Публічна оферта</strong> — публічна пропозиція Виконавця укласти договір надання послуг дистанційним способом.
              </li>
              <li>
                <strong>Послуга</strong> — надання доступу до профорієнтаційного тестування та отримання результатів тестування в електронному вигляді.
              </li>
              <li>
                <strong>Виконавець</strong> — ТОВ «ОТЦ ЄВРОПА» (код ЄДРПОУ 39292789).
              </li>
              <li>
                <strong>Користувач</strong> — будь-яка дієздатна особа, яка акцептувала умови цього Договору.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. Предмет Договору</h2>
            <ul className="list-decimal list-inside space-y-2 ml-4">
              <li>
                Виконавець зобов'язується надати Користувачу доступ до профорієнтаційного тестування, а Користувач зобов'язується оплатити та прийняти Послугу на умовах цього Договору.
              </li>
              <li>
                Моментом повного прийняття умов вважається дата оплати Послуги Користувачем на сайті.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. Порядок отримання Послуги</h2>
            <ul className="list-decimal list-inside space-y-2 ml-4">
              <li>Користувач самостійно оформлює замовлення на сайті.</li>
              <li>Доступ до тестування надається Користувачу автоматично або після отримання підтвердження оплати.</li>
              <li>
                Результати тестування надаються в електронному вигляді на сайті або надсилаються на вказану Користувачем електронну адресу.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Ціна та Порядок розрахунків</h2>
            <ul className="list-decimal list-inside space-y-2 ml-4">
              <li>Ціни на Послуги вказані на сайті Виконавця у гривнях.</li>
              <li>Розрахунки здійснюються за допомогою платіжних систем, вказаних на сайті.</li>
              <li>Зобов'язання з оплати вважаються виконаними з моменту надходження коштів на рахунок Виконавця.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Права та обов'язки Сторін</h2>
            
            <h3 className="text-lg font-semibold mb-2">5.1. Виконавець зобов'язаний:</h3>
            <ul className="list-disc list-inside space-y-1 ml-4 mb-4">
              <li>Надати Послугу якісно та у відповідності до умов цього Договору.</li>
              <li>Не розголошувати персональні дані Користувача третім особам.</li>
            </ul>

            <h3 className="text-lg font-semibold mb-2">5.2. Користувач зобов'язується:</h3>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Ознайомитися з умовами Договору до моменту оплати.</li>
              <li>Надати достовірні дані (E-mail, ім'я) для отримання Послуги.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. Повернення коштів</h2>
            <ul className="list-decimal list-inside space-y-2 ml-4">
              <li>
                Оскільки Послуга має характер цифрового контенту та надається миттєво після оплати, повернення коштів після отримання доступу до тестування або отримання його результатів не здійснюється, згідно з чинним законодавством України.
              </li>
              <li>
                У разі технічних помилок з боку Виконавця, що унеможливили проходження тесту, Користувач має право вимагати повторного надання доступу або повернення коштів протягом 14 днів.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">7. Конфіденційність</h2>
            <ul className="list-decimal list-inside space-y-2 ml-4">
              <li>Користувач надає згоду на обробку персональних даних для виконання умов цього Договору.</li>
              <li>
                Виконавець гарантує захист даних відповідно до Закону України «Про захист персональних даних».
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">8. Реквізити Виконавця</h2>
            <div className="bg-gray-50 p-4 rounded border border-gray-200 space-y-1">
              <p><strong>ТОВ «ОТЦ ЄВРОПА»</strong></p>
              <p>Код ЄДРПОУ: 39292789</p>
              <p>Адреса: Україна, м. Запоріжжя, вул. Дзержинського, оф. 84</p>
              <p>IBAN: UA593133990000026006055725575 в АТ «ПРИВАТБАНК»</p>
            </div>
          </section>

          <div className="mt-12 text-center">
            <Link href="/" className="text-blue-600 hover:underline text-lg">
              Повернутися на сайт
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
