import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="max-w-6xl mx-auto px-4 py-20 text-center">
          <h2 className="text-5xl font-bold mb-6 text-gray-800">
            Знайдіть свою ідеальну професію
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Пройдіть профорієнтаційне тестування та отримайте персональні рекомендації для вашого надалі
          </p>
          <Link href="/register" className="inline-block px-8 py-3 bg-primary text-white rounded-lg text-lg hover:bg-blue-600 transition">
            Розпочати тестування
          </Link>
        </section>

        {/* Features Section */}
        <section className="bg-gray-50 py-20">
          <div className="max-w-6xl mx-auto px-4">
            <h3 className="text-3xl font-bold text-center mb-12">Як це працює?</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-4">📝</div>
                <h4 className="text-xl font-semibold mb-3">Проходьте тести</h4>
                <p className="text-gray-600">
                  Відповідайте на питання про ваші інтереси, навички та здібності
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-4">📊</div>
                <h4 className="text-xl font-semibold mb-3">Отримуйте результати</h4>
                <p className="text-gray-600">
                  Система аналізує ваші відповіді та визначає найкращі варіанти для вас
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <div className="text-4xl mb-4">🎓</div>
                <h4 className="text-xl font-semibold mb-3">Плануйте майбутнє</h4>
                <p className="text-gray-600">
                  Використовуйте рекомендації для вибору освітнього напрямку та кар'єри
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Tests Section */}
        <section className="max-w-6xl mx-auto px-4 py-20">
          <h3 className="text-3xl font-bold text-center mb-12">Доступні тести</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Тест Холланда', desc: '6 типів особистості', icon: '👤' },
              { title: 'Матриця компетенцій', desc: 'Аналіз ваших навичок', icon: '💪' },
              { title: 'Цінності й мотивація', desc: 'Що вас рухає вперед', icon: '🎯' },
            ].map((test, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
                <div className="text-4xl mb-3">{test.icon}</div>
                <h4 className="text-lg font-semibold mb-2">{test.title}</h4>
                <p className="text-gray-600 mb-4">{test.desc}</p>
                <button className="text-primary hover:font-semibold">
                  Дізнатися більше →
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary text-white py-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h3 className="text-3xl font-bold mb-4">Готові розпочати?</h3>
            <p className="text-lg mb-8 opacity-90">
              Зареєструйтеся зараз та почніть вивчати свої можливості за допомогою наших профорієнтаційних тестів
            </p>
            <Link href="/register" className="inline-block px-8 py-3 bg-white text-primary rounded-lg font-semibold hover:bg-gray-100 transition">
              Створити акаунт
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
