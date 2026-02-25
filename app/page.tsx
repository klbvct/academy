'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

function useVisible() {
  const [ids, setIds] = useState<Set<string>>(new Set())
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting && e.target.id)
            setIds((prev) => new Set([...prev, e.target.id]))
        })
      },
      { threshold: 0.1 }
    )
    document.querySelectorAll('[data-reveal]').forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])
  return ids
}

const problems = [
  { icon: '🎯', text: 'Не можете визначити свої таланти та здібності' },
  { icon: '📈', text: 'Не знаєте, в якій сфері ви зможете розвиватися успішно' },
  { icon: '💭', text: 'Сумніваєтесь у своїх силах і правильності вибору' },
  { icon: '🎓', text: 'Не можете обрати напрямок навчання' },
  { icon: '🌍', text: 'Хочете обрати актуальну галузь для побудови кар&#39;єри' },
  { icon: '✅', text: 'Отримати впевненість у виборі професії та напрямку навчання' },
]

const advantages = [
  {
    badge: '01', icon: '⚡',
    title: 'Швидко, доступно, самостійно',
    desc: 'Простота доступу та низький поріг входу — пройдіть тест у будь-який зручний момент без зайвих кроків.',
  },
  {
    badge: '02', icon: '🔬',
    title: 'Сучасна авторська методика',
    desc: 'Тест поєднує перевірені міжнародні методики з урахуванням глобальних тенденцій в освіті та впливу AI на майбутні професії.',
  },
  {
    badge: '03', icon: '🤖',
    title: 'Тренди ринку праці та AI',
    desc: 'Аналіз враховує вплив штучного інтелекту та технологій на ринок праці — щоб ваш вибір був актуальним сьогодні та завтра.',
  },
  {
    badge: '04', icon: '📦',
    title: 'Повний пакет у вашому кабінеті',
    desc: 'Особистий освітній кабінет, онлайн-тест, детальний письмовий звіт та індивідуальний навчальний профіль — все в одному місці.',
  },
  {
    badge: '05', icon: '🧠',
    title: 'Когнітивні здібності та таланти',
    desc: 'Аналізуємо не лише інтереси, а й ваші когнітивні здібності, сильні та слабкі сторони — те, на що можна спиратися у виборі.',
  },
  {
    badge: '06', icon: '🗺️',
    title: 'Індивідуальна освітня карта',
    desc: 'Не просто перелік професій — а індивідуальна карта галузей, у яких ви можете досягти успіху і обирати серед десятків напрямків.',
  },
]

const steps = [
  'Реєстрація і створення особистого кабінету.',
  'Покупка доступу до тестування.',
  'Проходьте тест у зручний для вас час (≈ 60 хвилин). Відповідайте чесно — так результати будуть максимально точними.',
  'Тест складається з 8 модулів. До кожного — докладний опис та інструкція. Можна зберегти прогрес і продовжити пізніше.',
  'Отримуєш розгорнутий аналіз: вектори спрямованості, типи мислення, мотивація, цінності, типологія інтересів, особливості сприйняття.',
  'Отримуєш рекомендації до вибору напрямків навчання.',
  'Доступ до результатів тестування залишається у особистому кабінеті назавжди.',
]

const cls = (visible: Set<string>, id: string) =>
  `transition-all duration-700 ${visible.has(id) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`

export default function Home() {
  const visible = useVisible()

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1">

        {/* ── HERO ── */}
        <section className="relative overflow-hidden bg-white pt-20 pb-28 md:pt-28 md:pb-36">
          {/* gradient orbs */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-blue-100/70 blur-3xl" />
            <div className="absolute top-10 -right-32 h-80 w-80 rounded-full bg-blue-100/40 blur-2xl" />
            <div className="absolute bottom-0 -left-32 h-64 w-64 rounded-full bg-blue-50/40 blur-2xl" />
          </div>

          <div className="max-w-4xl mx-auto px-6 text-center">
            {/* pill badge */}
            <div id="h-badge" data-reveal="" style={{ transitionDelay: '0ms' }}
              className={`inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700 mb-6 ${cls(visible, 'h-badge')}`}>
              <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
              Сучасне комплексне кар&#39;єрне тестування
            </div>

            <h1 id="h-title" data-reveal="" style={{ transitionDelay: '80ms' }}
              className={`font-sans text-4xl md:text-6xl font-bold tracking-tight text-gray-900 leading-tight mb-6 ${cls(visible, 'h-title')}`}>
              Отримай індивідуальну{' '}
              <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                профорієнтаційну діагностику
              </span>
            </h1>

            <p id="h-sub" data-reveal="" style={{ transitionDelay: '160ms' }}
              className={`text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 ${cls(visible, 'h-sub')}`}>
              Онлайн-платформа для створення чіткої стратегії освіти та вибору майбутньої професії
            </p>

            <div id="h-cta" data-reveal="" style={{ transitionDelay: '240ms' }}
              className={`flex flex-col sm:flex-row gap-4 justify-center ${cls(visible, 'h-cta')}`}>
              <Link href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-0.5 transition-all duration-200">
                Розпочати тестування →
              </Link>
              <Link href="/login"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-8 py-3.5 text-base font-semibold text-gray-700 hover:border-gray-300 hover:bg-gray-50 hover:-translate-y-0.5 transition-all duration-200">
                Увійти в кабінет
              </Link>
            </div>
          </div>

          {/* mock UI card */}
          <div id="h-card" data-reveal="" style={{ transitionDelay: '360ms' }}
            className={`mt-16 max-w-3xl mx-auto px-6 ${cls(visible, 'h-card')}`}>
            <div className="rounded-2xl border border-gray-100 bg-white shadow-2xl shadow-gray-100 overflow-hidden">
              {/* browser bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50/80">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-yellow-400" />
                <span className="h-3 w-3 rounded-full bg-green-400" />
                <span className="ml-3 flex-1 rounded-md bg-gray-100 h-6 text-xs flex items-center px-3 text-gray-400">
                  axis-career.com/dashboard
                </span>
              </div>
              {/* content */}
              <div className="p-6 bg-gradient-to-br from-blue-50/40 via-white to-blue-50/40 min-h-[220px]">
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">A</div>
                  <div>
                    <div className="h-3 w-36 rounded-full bg-gray-800" />
                    <div className="h-2.5 w-24 rounded-full bg-gray-300 mt-1.5" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[['🎯','Вектор','спрямованості'],['🧠','Типи','мислення'],['🔥','Мотивація','та цінності']].map(([emoji, l1, l2], i) => (
                    <div key={i} className="rounded-xl border border-blue-100 bg-white p-3 shadow-sm">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-lg mb-2">{emoji}</div>
                      <div className="h-2 w-full bg-gray-200 rounded-full" />
                      <div className="h-2 w-3/4 bg-gray-100 rounded-full mt-1" />
                      <p className="text-[10px] text-gray-400 mt-1.5">{l1} {l2}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-2.5 w-32 bg-gray-800 rounded-full" />
                    <span className="text-xs font-bold text-blue-600">98%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100">
                    <div className="h-2 w-[98%] rounded-full bg-gradient-to-r from-blue-500 to-blue-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── PROBLEM ── */}
        <section className="py-24 bg-gray-50">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-14">
              <div id="pb-badge" data-reveal="" style={{ transitionDelay: '0ms' }}
                className={`inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-600 mb-4 shadow-sm ${cls(visible, 'pb-badge')}`}>
                Чи знайоме вам це?
              </div>
              <h2 id="pb-h" data-reveal="" style={{ transitionDelay: '100ms' }}
                className={`font-sans text-3xl md:text-4xl font-bold text-gray-900 ${cls(visible, 'pb-h')}`}>
                Проблема та рішення
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {problems.map((p, i) => (
                <div key={i} id={`pb-${i}`} data-reveal="" style={{ transitionDelay: `${i * 70}ms` }}
                  className={`flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md hover:border-blue-100 hover:-translate-y-1 transition-all duration-300 ${cls(visible, `pb-${i}`)}`}>
                  <span className="text-2xl flex-shrink-0">{p.icon}</span>
                  <p className="text-sm text-gray-600 leading-relaxed">{p.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── ADVANTAGES ── */}
        <section className="py-24 bg-white">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <div id="av-badge" data-reveal="" style={{ transitionDelay: '0ms' }}
                className={`inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700 mb-4 ${cls(visible, 'av-badge')}`}>
                Чому ми?
              </div>
              <h2 id="av-h" data-reveal="" style={{ transitionDelay: '100ms' }}
                className={`font-sans text-3xl md:text-4xl font-bold text-gray-900 ${cls(visible, 'av-h')}`}>
                Переваги та Цінність
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {advantages.map((a, i) => (
                <div key={i} id={`av-${i}`} data-reveal="" style={{ transitionDelay: `${i * 70}ms` }}
                  className={`flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md hover:border-blue-100 hover:-translate-y-1 transition-all duration-300 ${cls(visible, `av-${i}`)}`}>
                  <div className="flex-shrink-0 h-11 w-11 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-xl">
                    {a.icon}
                  </div>
                  <div>
                    <div className="text-xs font-mono text-blue-500 font-semibold mb-1">{a.badge}</div>
                    <h3 className="font-semibold text-gray-900 mb-2 leading-snug">{a.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{a.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="py-24 bg-gray-50">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
              <div id="hw-badge" data-reveal="" style={{ transitionDelay: '0ms' }}
                className={`inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-600 mb-4 shadow-sm ${cls(visible, 'hw-badge')}`}>
                Простий процес
              </div>
              <h2 id="hw-h" data-reveal="" style={{ transitionDelay: '100ms' }}
                className={`font-sans text-3xl md:text-4xl font-bold text-gray-900 ${cls(visible, 'hw-h')}`}>
                Як це Працює
              </h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
              {/* steps */}
              <div id="hw-steps" data-reveal="" style={{ transitionDelay: '0ms' }}
                className={`space-y-3 ${cls(visible, 'hw-steps')}`}>
                {steps.map((s, i) => (
                  <div key={i} className="flex items-start gap-4 group">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-blue-200 group-hover:scale-110 transition-transform">
                      {i + 1}
                    </div>
                    <div className="flex-1 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm group-hover:border-blue-100 group-hover:shadow-md transition-all duration-200">
                      <p className="text-sm text-gray-600 leading-relaxed">{s}</p>
                    </div>
                  </div>
                ))}
              </div>
              {/* media placeholder */}
              <div id="hw-media" data-reveal="" style={{ transitionDelay: '200ms' }}
                className={`${cls(visible, 'hw-media')}`}>
                <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white overflow-hidden aspect-[4/3] flex flex-col items-center justify-center gap-3 text-gray-400">
                  <div className="text-5xl">🎬</div>
                  <p className="text-sm font-medium">Демо реєстрації та тестування</p>
                  <p className="text-xs text-gray-300">GIF / відео</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── RESULTS ── */}
        <section className="py-24 bg-white">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-12">
              <div id="rs-badge" data-reveal="" style={{ transitionDelay: '0ms' }}
                className={`inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700 mb-4 ${cls(visible, 'rs-badge')}`}>
                Результат
              </div>
              <h2 id="rs-h" data-reveal="" style={{ transitionDelay: '100ms' }}
                className={`font-sans text-3xl md:text-4xl font-bold text-gray-900 ${cls(visible, 'rs-h')}`}>
                Що отримаєте після тестування
              </h2>
            </div>
            <div id="rs-media" data-reveal="" style={{ transitionDelay: '200ms' }}
              className={`${cls(visible, 'rs-media')}`}>
              <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 overflow-hidden aspect-video flex flex-col items-center justify-center gap-3 text-gray-400">
                <div className="text-6xl">📊</div>
                <p className="text-base font-medium">Демо звіту тестування</p>
                <p className="text-sm text-gray-300">GIF зі звітом</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-24 bg-gray-50">
          <div className="max-w-3xl mx-auto px-6">
            <div id="cta-card" data-reveal="" style={{ transitionDelay: '0ms' }}
              className={`relative rounded-3xl bg-gradient-to-br from-blue-600 to-blue-700 p-10 md:p-14 text-center shadow-2xl shadow-blue-200 overflow-hidden ${cls(visible, 'cta-card')}`}>
              {/* decorative circles */}
              <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/5" />
              <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/5" />

              <h2 className="relative font-sans text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                Отримай індивідуальну<br />
                <span className="text-blue-200">профорієнтаційну діагностику</span>
              </h2>
              <p className="relative text-blue-200 text-lg mb-10">
                Пройдіть тестування і отримайте персональні рекомендації
              </p>
              <div className="relative flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-blue-700 shadow-lg hover:bg-blue-50 hover:-translate-y-0.5 transition-all duration-200">
                  Розпочати тестування →
                </Link>
                <Link href="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 backdrop-blur-sm px-8 py-3.5 text-base font-semibold text-white hover:bg-white/20 hover:-translate-y-0.5 transition-all duration-200">
                  Вже є акаунт
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  )
}
