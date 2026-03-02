'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import {
  Target,
  TrendUp,
  Question,
  GraduationCap,
  Globe,
  CheckCircle,
  Lightning,
  Flask,
  Robot,
  Package,
  Brain,
  MapTrifold,
  ChartBar,
  ArrowRight,
  CaretLeft,
  CaretRight,
} from '@phosphor-icons/react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { EffectCards, Autoplay, Navigation } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
import 'swiper/css'
import 'swiper/css/effect-cards'
import 'swiper/css/navigation'

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
  { icon: <Target size={28} weight="duotone" className="text-blue-500" />, text: 'Не можете визначити свої таланти та здібності' },
  { icon: <TrendUp size={28} weight="duotone" className="text-blue-500" />, text: 'Не знаєте, в якій сфері ви зможете розвиватися успішно' },
  { icon: <Question size={28} weight="duotone" className="text-blue-500" />, text: 'Сумніваєтесь у своїх силах і правильності вибору' },
  { icon: <GraduationCap size={28} weight="duotone" className="text-blue-500" />, text: 'Не можете обрати напрямок навчання' },
  { icon: <Globe size={28} weight="duotone" className="text-blue-500" />, text: 'Хочете обрати актуальну галузь для побудови кар`єри' },
  { icon: <CheckCircle size={28} weight="duotone" className="text-blue-500" />, text: 'Отримати впевненість у виборі професії та напрямку навчання' },
]

const advantages = [
  {
    badge: '01', icon: <Lightning size={22} weight="duotone" className="text-blue-600" />,
    title: 'Швидко, доступно, самостійно',
    desc: 'Простота доступу та низький поріг входу — пройдіть тест у будь-який зручний момент без зайвих кроків.',
  },
  {
    badge: '02', icon: <Flask size={22} weight="duotone" className="text-blue-600" />,
    title: 'Сучасна авторська методика',
    desc: 'Тест поєднує перевірені міжнародні методики з урахуванням глобальних тенденцій в освіті та впливу AI на майбутні професії.',
  },
  {
    badge: '03', icon: <Robot size={22} weight="duotone" className="text-blue-600" />,
    title: 'Тренди ринку праці та AI',
    desc: 'Аналіз враховує вплив штучного інтелекту та технологій на ринок праці — щоб ваш вибір був актуальним сьогодні та завтра.',
  },
  {
    badge: '04', icon: <Package size={22} weight="duotone" className="text-blue-600" />,
    title: 'Повний пакет у вашому кабінеті',
    desc: 'Особистий освітній кабінет, онлайн-тест, детальний письмовий звіт та індивідуальний навчальний профіль — все в одному місці.',
  },
  {
    badge: '05', icon: <Brain size={22} weight="duotone" className="text-blue-600" />,
    title: 'Когнітивні здібності та таланти',
    desc: 'Аналізуємо не лише інтереси, а й ваші когнітивні здібності, сильні та слабкі сторони — те, на що можна спиратися у виборі.',
  },
  {
    badge: '06', icon: <MapTrifold size={22} weight="duotone" className="text-blue-600" />,
    title: 'Індивідуальна освітня карта',
    desc: 'Не просто перелік професій — а індивідуальна карта галузей, у яких ви можете досягти успіху і обирати серед десятків напрямків.',
  },
]

const steps = [
  'Реєстрація і створення особистого кабінету.',
  'Покупка доступу до тестування (вартість — 1700 грн).',
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
  const videoRef = useRef<HTMLVideoElement>(null)
  const swiperRef = useRef<SwiperType | null>(null)
  const resultsSectionRef = useRef<HTMLDivElement>(null)
  const [gallery] = useState<string[]>(Array.from({ length: 16 }, (_, i) => `/landing/Result_${i + 1}.webp`))

  useEffect(() => {
    const t = setTimeout(() => videoRef.current?.play(), 500)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const section = resultsSectionRef.current
    if (!section) return
    let startTimer: ReturnType<typeof setTimeout> | null = null
    const obs = new IntersectionObserver(
      ([entry]) => {
        const swiper = swiperRef.current
        if (!swiper) return
        if (entry.isIntersecting) {
          startTimer = setTimeout(() => swiper.autoplay.start(), 0)
        } else {
          if (startTimer) clearTimeout(startTimer)
          swiper.autoplay.stop()
        }
      },
      { threshold: 0.2 }
    )
    obs.observe(section)
    return () => { obs.disconnect(); if (startTimer) clearTimeout(startTimer) }
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1">

        {/* ── HERO ── */}
        <section className="relative overflow-hidden bg-white pt-20 pb-28 md:pt-20 md:pb-36">
          {/* gradient orbs */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-blue-100/70 blur-3xl" />
            <div className="absolute top-10 -right-32 h-80 w-80 rounded-full bg-blue-100/40 blur-2xl" />
            <div className="absolute bottom-0 -left-32 h-64 w-64 rounded-full bg-blue-50/40 blur-2xl" />
          </div>

          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* LEFT: Text Content */}
              <div>
                {/* pill badge */}
                <div id="h-badge" data-reveal="" style={{ transitionDelay: '0ms' }}
                  className={`inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs sm:text-sm font-medium text-blue-700 mb-6 ${cls(visible, 'h-badge')}`}>
                  <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                  Сучасне комплексне кар&#39;єрне тестування
                </div>

                <h1 id="h-title" data-reveal="" style={{ transitionDelay: '80ms' }}
                  className={`font-sans text-4xl md:text-5xl font-bold tracking-tight text-gray-900 leading-tight mb-6 ${cls(visible, 'h-title')}`}>
                  Отримай індивідуальну{' '}
                  <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                    профорієнтаційну діагностику
                  </span>
                </h1>

                <p id="h-sub" data-reveal="" style={{ transitionDelay: '160ms' }}
                  className={`text-lg text-gray-500 mb-10 ${cls(visible, 'h-sub')}`}>
                  Онлайн-платформа для створення чіткої стратегії освіти та вибору майбутньої професії
                </p>

                <div id="h-cta" data-reveal="" style={{ transitionDelay: '240ms' }}
                  className={`flex flex-col gap-4 ${cls(visible, 'h-cta')}`}>
                  <Link href="/register"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-200 hover:shadow-blue-300 hover:-translate-y-0.5 transition-all duration-200 w-fit">
                    Розпочати тестування <ArrowRight size={18} weight="bold" />
                  </Link>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-2xl font-bold text-gray-900">1 700 грн</span>
                    <span className="w-px h-6 bg-blue-400/50" />
                    <span className="text-sm text-gray-400">повний доступ</span>
                  </div>
                </div>
              </div>

              {/* RIGHT: Video block */}
              <div id="h-image" data-reveal="" style={{ transitionDelay: '360ms' }}
                className={`flex justify-center ${cls(visible, 'h-image')}`}>
                <div className="relative w-full max-w-lg">
                  {/* glow behind */}
                  <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-blue-200/50 to-blue-100/30 blur-2xl -z-10" />
                  {/* card */}
                  <div className="rounded-2xl overflow-hidden border border-white/80 shadow-2xl shadow-blue-100/60 bg-white/60 backdrop-blur-sm">
                    {/* top bar */}
                    <div className="flex items-center gap-1.5 px-4 h-9 bg-gray-100/80 border-b border-gray-200/60">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                      <div className="flex-1 mx-3 h-4 rounded-full bg-gray-200/80 flex items-center px-2">
                        <span className="text-[9px] text-gray-400 tracking-wide truncate">education-design.com.ua/report</span>
                      </div>
                    </div>
                    {/* video */}
                    <video
                      ref={videoRef}
                      className="w-full aspect-video object-cover block"
                      src="/landing/proforiientatsiine-testuvannia.mp4"
                      poster="/landing/background_hero.webp"
                      muted
                      loop
                      playsInline
                      preload="auto"
                    />
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
              <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-medium text-gray-600 mb-4 shadow-sm">
                Чи знайоме вам це?
              </div>
              <h2 className="font-sans text-3xl md:text-4xl font-bold text-gray-900">
                Проблема та рішення
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {problems.map((p, i) => (
                <div key={i}
                  className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md hover:border-blue-100 hover:-translate-y-1 transition-all duration-300">
                  <span className="flex-shrink-0 mt-0.5">{p.icon}</span>
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
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700 mb-4">
                Чому ми?
              </div>
              <h2 className="font-sans text-3xl md:text-4xl font-bold text-gray-900">
                Переваги та Цінність
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {advantages.map((a, i) => (
                <div key={i}
                  className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md hover:border-blue-100 hover:-translate-y-1 transition-all duration-300">
                  <div className="flex-shrink-0 h-11 w-11 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
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
                  <div key={i} className="flex items-center gap-4 group">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-blue-200 group-hover:scale-110 transition-transform">
                      {i + 1}
                    </div>
                    <div className="flex-1 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm group-hover:border-blue-100 group-hover:shadow-md transition-all duration-200">
                      <p className="text-sm text-gray-600 leading-relaxed">{s}</p>
                    </div>
                  </div>
                ))}
              </div>
              {/* media: how it works video */}
              <div id="hw-media" data-reveal="" style={{ transitionDelay: '200ms' }}
                className={`${cls(visible, 'hw-media')}`}>
                <div className="relative w-full rounded-2xl overflow-hidden border border-white/80 shadow-2xl shadow-blue-100/60 bg-white/60 backdrop-blur-sm">
                  {/* top bar */}
                  <div className="flex items-center gap-1.5 px-4 h-9 bg-gray-100/80 border-b border-gray-200/60">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                    <div className="flex-1 mx-3 h-4 rounded-full bg-gray-200/80 flex items-center px-2">
                      <span className="text-[9px] text-gray-400 tracking-wide truncate">education-design.com.ua/tests</span>
                    </div>
                  </div>
                  <video
                    className="w-full aspect-video object-cover block"
                    src="/landing/roadmap-proforiientatsiine-testuvannia.mp4"
                    muted
                    loop
                    playsInline
                    autoPlay
                    preload="auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── RESULTS ── */}
        <section className="py-24 bg-white" ref={resultsSectionRef}>
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700 mb-4">
                Результат
              </div>
              <h2 className="font-sans text-3xl md:text-4xl font-bold text-gray-900">
                Що отримаєте після тестування
              </h2>
            </div>

            {/* Swiper Cards Effect */}
            <div className="flex justify-center">
              <div style={{ width: '260px' }}>
                <Swiper
                  effect="cards"
                  grabCursor
                  loop
                  modules={[EffectCards, Autoplay, Navigation]}
                  autoplay={{ delay: 1000, disableOnInteraction: false, pauseOnMouseEnter: true, waitForTransition: true }}
                  navigation={{
                    nextEl: '.results-next',
                    prevEl: '.results-prev',
                  }}
                  onSwiper={(swiper) => {
                    swiperRef.current = swiper
                    swiper.autoplay.stop()
                  }}
                  className="results-swiper"
                >
                  {gallery.map((src, i) => (
                    <SwiperSlide key={i}>
                      <div
                        className="rounded-xl overflow-hidden border border-blue-100 shadow-md bg-blue-50"
                        style={{ aspectRatio: '210 / 297', padding: 16, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <img
                          src={src}
                          alt={`result-${i}`}
                          className="block"
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
                {/* custom nav arrows */}
                <div className="flex justify-center gap-4 mt-6">
                  <button className="results-prev bg-white border border-gray-200 rounded-full p-2.5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all">
                    <CaretLeft size={20} className="text-gray-600" />
                  </button>
                  <button className="results-next bg-white border border-gray-200 rounded-full p-2.5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all">
                    <CaretRight size={20} className="text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── AUTHOR ── */}
        <section className="py-24 bg-gray-50">
          <div className="max-w-5xl mx-auto px-6">

            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700 mb-4">
                Автор методики
              </div>
              <h2 className="font-sans text-3xl md:text-4xl font-bold text-gray-900">
                Мар&#39;яна Калабухова
              </h2>
            </div>

            {/* Card */}
            <div className="rounded-3xl overflow-hidden shadow-xl border border-gray-100 bg-white grid grid-cols-1 md:grid-cols-[320px_1fr]">

              {/* Left — photo + dark overlay */}
              <div className="relative min-h-[360px] md:min-h-0">
                <img
                  src="/landing/mariana_about.webp"
                  alt="Мар'яна Калабухова — автор методики"
                  className="absolute inset-0 w-full h-full object-cover object-top"
                />
                {/* gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 via-blue-900/20 to-transparent md:bg-gradient-to-r md:from-transparent md:to-blue-900/10" />
              </div>

              {/* Right — content */}
              <div className="p-8 md:p-12 flex flex-col justify-center gap-8">

                {/* bio */}
                <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                  Автор профорієнтаційної методики <span className="font-semibold text-gray-900">Дизайн Освіти</span>, консультант з освіти за кордоном, навчання і кар&#39;єри, ментор, ступінь <span className="font-semibold text-blue-600">PhD</span>.
                </p>

                {/* stats row */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { num: '11+', label: 'років досвіду' },
                    { num: '700+', label: 'консультацій' },
                    { num: '5', label: 'років в університеті' },
                    { num: 'PhD', label: 'науковий ступінь' },
                  ].map(({ num, label }) => (
                    <div key={label} className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-4">
                      <div className="text-2xl font-bold text-blue-600 leading-none mb-1">{num}</div>
                      <div className="text-xs text-gray-500 leading-snug">{label}</div>
                    </div>
                  ))}
                </div>

                {/* tagline */}
                <p className="text-sm text-gray-500 leading-relaxed border-l-2 border-blue-300 pl-4 italic">
                  11+ років досвіду підготовки і зарахування учнів і студентів в найкращі навчальні заклади світу
                </p>

              </div>
            </div>

          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-24 bg-blue-600">
          <div className="max-w-3xl mx-auto px-6">
            <div id="cta-card" data-reveal="" style={{ transitionDelay: '0ms' }}
              className={`relative rounded-3xl bg-blue-600 p-10 md:p-14 text-center shadow-2xl shadow-blue-200 overflow-hidden ${cls(visible, 'cta-card')}`}>
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
              <div className="relative flex flex-col items-center gap-5 justify-center">
                <Link href="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-blue-700 shadow-lg hover:bg-blue-50 hover:-translate-y-0.5 transition-all duration-200">
                  Розпочати тестування <ArrowRight size={18} weight="bold" />
                </Link>
                <div className="flex items-center gap-2 text-blue-200">
                  <span className="text-xl font-bold text-white">1 700 грн</span>
                  <span className="w-px h-4 bg-blue-400/50" />
                  <span className="text-sm">повний доступ</span>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  )
}
