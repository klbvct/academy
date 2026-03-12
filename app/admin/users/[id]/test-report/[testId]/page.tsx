'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Module1ProfessionalVector } from '@/app/components/results/Module1ProfessionalVector'
import { Module2Interests } from '@/app/components/results/Module2Interests'
import { Module3ThinkingTypes } from '@/app/components/results/Module3ThinkingTypes'
import { Module4_6MotivationValues } from '@/app/components/results/Module4_6MotivationValues'
import { Module5Intelligences } from '@/app/components/results/Module5Intelligences'
import { Module7HollandRIASEC } from '@/app/components/results/Module7HollandRIASEC'
import { Module8PerceptionTypes } from '@/app/components/results/Module8PerceptionTypes'

interface TestResults {
  score: number
  completedAt: string
  scores: Record<string, any>
  answers: Record<string, any>
  recommendations: any
}

interface UserData {
  name: string
  birthdate?: string
}

export default function AdminTestReportPage() {
  const params = useParams()
  const userId = params.id as string
  const testId = params.testId as string
  const contentRef = useRef<HTMLDivElement>(null)

  const [results, setResults] = useState<TestResults | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadResults = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')

        const response = await fetch(`/api/admin/users/${userId}/test-report/${testId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) {
          setError('Помилка при завантаженні результатів')
          setLoading(false)
          return
        }

        const data = await response.json()
        setUserData(data.user)
        setResults(data.data)
      } catch (err) {
        console.error('Error loading results:', err)
        setError('Помилка при завантаженні результатів')
      } finally {
        setLoading(false)
      }
    }

    loadResults()
  }, [userId, testId])

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Завантаження результатів тестування...</p>
        </div>
      </div>
    )
  }

  if (error || !results) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Помилка при завантаженні'}</p>
          <Link href={`/admin/users/${userId}/test-answers/${testId}`} className="text-blue-600 hover:underline">
            Повернутися до відповідей
          </Link>
        </div>
      </div>
    )
  }

  const completedAt = new Date(results.completedAt)
  const birthDateFormatted = userData?.birthdate
    ? new Date(userData.birthdate).toLocaleDateString('uk-UA', { year: 'numeric', month: '2-digit', day: '2-digit' })
    : 'Не вказано'

  let recommendationsObj: any = null
  if (results.recommendations) {
    if (typeof results.recommendations === 'string') {
      try {
        recommendationsObj = JSON.parse(results.recommendations)
      } catch {
        recommendationsObj = { text: results.recommendations }
      }
    } else {
      recommendationsObj = results.recommendations
    }
  }

  return (
    <>
      {/* Admin toolbar */}
      <div className="fixed top-5 right-5 z-50 flex gap-2 print:hidden">
        <Link
          href={`/admin/users/${userId}/test-answers/${testId}`}
          className="px-4 py-2 bg-gray-600 text-white text-base rounded-lg hover:bg-gray-700 transition font-semibold"
        >
          ← Відповіді
        </Link>
        <button
          onClick={handlePrint}
          className="px-4 py-2 text-white text-base rounded-lg font-semibold transition hover:scale-105"
          style={{ background: '#bb2d2d' }}
        >
          Друк / PDF
        </button>
      </div>

      {/* Report content */}
      <div ref={contentRef} className="min-h-screen bg-white" style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
        {/* Header */}
        <header
          className="text-center p-16 mb-8"
          style={{
            background: 'linear-gradient(135deg, #0c68f5 0%, #1e3a8a 100%)',
            color: 'white',
            borderRadius: '0 0 20px 20px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            marginBottom: '40px',
          }}
        >
          <h1 className="text-5xl font-bold mb-3 uppercase tracking-wider" style={{ letterSpacing: '2px' }}>
            ДИЗАЙН ОСВІТИ
          </h1>
          <p className="text-lg" style={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: '300' }}>
            Звіт профорієнтаційного тестування
          </p>
          <p className="text-base mt-2 print:hidden" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            👁 Перегляд адміністратора
          </p>
        </header>

        <div className="max-w-4xl mx-auto px-5" style={{ paddingBottom: '40px' }}>
          {/* Info table */}
          <section className="mb-10" style={{ pageBreakInside: 'avoid' }}>
            <table
              className="w-full border-collapse"
              style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '20px' }}
            >
              <tbody>
                <tr>
                  <th style={{ background: '#0c68f5', color: 'white', padding: '12px', textAlign: 'left', fontWeight: '600', width: '40%' }}>
                    Ім&apos;я та прізвище
                  </th>
                  <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>{userData?.name || 'Не вказано'}</td>
                </tr>
                <tr>
                  <th style={{ background: '#0c68f5', color: 'white', padding: '12px', textAlign: 'left', fontWeight: '600' }}>
                    Дата народження
                  </th>
                  <td style={{ padding: '12px', borderBottom: '1px solid #e5e7eb' }}>{birthDateFormatted}</td>
                </tr>
                <tr>
                  <th style={{ background: '#0c68f5', color: 'white', padding: '12px', textAlign: 'left', fontWeight: '600' }}>
                    Дата тестування
                  </th>
                  <td style={{ padding: '12px' }}>
                    {completedAt.toLocaleDateString('uk-UA', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* Highlight box */}
          <section className="mb-10 p-5 rounded" style={{ background: '#ddd6fe36', pageBreakInside: 'avoid' }}>
            <p style={{ fontSize: '14px', textAlign: 'left', marginBottom: '10px', lineHeight: '1.6' }}>Перед Вами ваш унікальний Дизайн освіти. <strong style={{ color: '1e3a8a' }}>Результат формування індивідуальної освітньої траекторії</strong>, що враховує унікальні особливості, інтереси, здібності та життєві цілі кожної людини. Його мета — допомогти усвідомлено підійти до вибору навчання і сформувати такий освітній шлях, який максимально відповідає потенціалу та прагненням особистості.</p>
            <p style={{ fontSize: '14px', textAlign: 'left', marginBottom: '10px', lineHeight: '1.6' }}>На основі цих даних формується цілісна картина ваших здібностей і схильностей, що може стати орієнтиром під час вибору напряму навчання та майбутньої професії.</p>
            <p style={{ fontSize: '14px', textAlign: 'left', marginBottom: '10px', lineHeight: '1.6' }}>У межах цього підходу освіта розглядається як <strong style={{ color: '#1e3a8a' }}>гнучка система</strong>, яку можна поєднувати з різних сучасних форматів і типів навчання: академічних програм, міжнародної освіти, онлайн-курсів, практичного досвіду, міждисциплінарних напрямів та індивідуальних освітніх проєктів.</p>
            <p style={{ fontSize: '14px', textAlign: 'left', marginBottom: '0', lineHeight: '1.6' }}>Створення власного дизайну освіти передбачає <strong style={{ color: '#1e3a8a' }}>усвідомлений вибір освітніх можливостей і інструментів</strong>, що допомагають не лише отримати знання, а й розвинути сильні сторони, сформувати професійні компетенції та знайти свій напрямок у майбутній кар’єрі.</p>
          </section>

          {/* Table of contents */}
          <section className="mb-10" style={{ pageBreakInside: 'avoid' }}>
            <h2 className="text-2xl font-bold mb-4 pb-2" style={{ color: '#1e3a8a', borderBottom: '2px solid #0c68f5' }}>
              Зміст
            </h2>
            <div className="grid grid-cols-2 gap-5">
              <div>
                {[
                  'Професійна спрямованість',
                  'Індивідуальні інтереси і здібності в навчанні',
                  'Домінуючі типи мислення',
                  'Мотивація та цінності',
                  'Співвідношення типів інтелекту',
                ].map((item, i) => (
                  <div key={i} className="flex justify-between mb-2 p-3 rounded" style={{ background: '#f3f4f6', fontSize: '14px' }}>
                    <span>{item}</span>
                    <span className="font-bold" style={{ color: '#0c68f5' }}>{String(i + 1).padStart(2, '0')}</span>
                  </div>
                ))}
              </div>
              <div>
                {[
                  'Типологія професійних інтересів за Голландом',
                  'Типологія сприйняття',
                  'Рекомендації до вибору професійних напрямків',
                  'Підготовка до вступу',
                ].map((item, i) => (
                  <div key={i} className="flex justify-between mb-2 p-3 rounded" style={{ background: '#f3f4f6', fontSize: '14px' }}>
                    <span>{item}</span>
                    <span className="font-bold" style={{ color: '#0c68f5' }}>{String(i + 6).padStart(2, '0')}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ========== MODULE COMPONENTS ========== */}
          {results.scores && (
            <>
              {(results.scores.m1_nature !== undefined || results.scores.m1_technic !== undefined) && (
                <Module1ProfessionalVector scores={results.scores} recommendations={recommendationsObj} />
              )}
              {(results.scores.m2_naturalScience !== undefined || results.scores.m2_engineering !== undefined) && (
                <Module2Interests scores={results.scores} />
              )}
              {(results.scores.m3_artistic !== undefined || results.scores.m3_theoretical !== undefined) && (
                <Module3ThinkingTypes scores={results.scores} />
              )}
              {(results.scores.m4_values !== undefined || results.scores.m6_strongMotivator !== undefined) && (
                <Module4_6MotivationValues scores={results.scores} />
              )}
              {(results.scores.m5_linguistic !== undefined || results.scores.m5_logicalMathematical !== undefined) && (
                <Module5Intelligences scores={results.scores} />
              )}
              {(results.scores.m7_r !== undefined || results.scores.m7_i !== undefined) && (
                <Module7HollandRIASEC scores={results.scores} />
              )}
              {(results.scores.m8_visual !== undefined || results.scores.m8_auditory !== undefined) && (
                <Module8PerceptionTypes scores={results.scores} />
              )}
            </>
          )}

          {/* ========== RECOMMENDATIONS ========== */}
          <section className="mb-10" style={{ pageBreakInside: 'avoid' }}>
            <h2 className="text-2xl font-bold mb-4 pb-2" style={{ color: '#1e3a8a', borderBottom: '2px solid #0c68f5' }}>
              <span style={{
                display: 'inline-block', width: '50px', height: '50px',
                backgroundColor: '#f3f4f6', color: '#0c68f5', borderRadius: '8px',
                textAlign: 'center', lineHeight: '50px', fontWeight: 'bold',
                fontSize: '20px', marginRight: '12px', verticalAlign: 'middle'
              }}>08</span>
              Рекомендації до вибору професійних напрямків
            </h2>

            {recommendationsObj?.text ? (
              <div style={{ margin: '25px 0', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
                {formatRecommendationsText(recommendationsObj.text)}
              </div>
            ) : (
              <div style={{ margin: '25px 0', padding: '25px', background: '#fef3c7', borderLeft: '4px solid #f59e0b', borderRadius: '8px' }}>
                <p style={{ color: '#92400E', fontWeight: 'bold', marginBottom: '8px' }}>Рекомендації не згенеровані</p>
                <p style={{ color: '#78350F', fontSize: '14px' }}>
                  Користувач ще не сплатив за результати або не відкривав сторінку результатів після оплати.
                </p>
              </div>
            )}
          </section>

          {/* ========== PREPARATION FOR ADMISSION ========== */}
          <section className="mb-10" style={{ pageBreakInside: 'avoid' }}>
            <h2 className="text-2xl font-bold mb-4 pb-2" style={{ color: '#1e3a8a', borderBottom: '2px solid #0c68f5' }}>
              <span style={{
                display: 'inline-block', width: '50px', height: '50px',
                backgroundColor: '#f3f4f6', color: '#0c68f5', borderRadius: '8px',
                textAlign: 'center', lineHeight: '50px', fontWeight: 'bold',
                fontSize: '20px', marginRight: '12px', verticalAlign: 'middle'
              }}>09</span>
              Підготовка до вступу
            </h2>
            <ol style={{ marginLeft: '30px', lineHeight: '1.6', listStyleType: 'decimal', fontSize: '14px'}}>
              <li style={{ marginTop: '1rem' }}>Вивчити представлені напрямки навчання та їх значення. Зрозуміти, що вивчатиметься в рамках цих напрямків, ознайомитись з планом навчання.</li>
              <li style={{ marginTop: '1rem' }}>Вибрати галузь знань та дізнатися в ВНЗ, які цікавлять, можливість підготовчих програм.</li>
              <li style={{ marginTop: '1rem' }}>Розглянути можливість додаткових професійних занять з профільним предметам.</li>
              <li style={{ marginTop: '1rem' }}>Цілеспрямована підготовка до вступу починається з 9 класу, в ідеалі.</li>
              <li style={{ marginTop: '1rem' }}>Дані тесту дають можливість зрозуміти, у яких напрямках є схильності на даний момент.</li>
              <li style={{ marginTop: '1rem' }}>Оцінюємо знання англійської та можливість здачі міжнародних іспитів. Крім англійської вчимо БУДЬ-ЯКУ ІНШУ поширену іноземну мову!</li>
              <li style={{ marginTop: '1rem' }}>Запам&apos;ятайте! Бакалаврат – базова освіта, на якій буде засновано ваше подальше професійне життя.</li>
              <li style={{ marginTop: '1rem' }}>Чим базовіший, фундаментальний напрямок вивчається на бакалавріаті, тим більше її складові стануть у нагоді надалі.</li>
              <li style={{ marginTop: '1rem' }}>Монопрофесії вже у минулому. Комбінуйте навички з різних галузей знань.</li>
              <li style={{ marginTop: '1rem' }}>Не забувайте про цифрові навички, які межують з основною спеціальністю.</li>
            </ol>
          </section>

          {/* Footer */}
          <footer className="pt-5 text-center" style={{ marginTop: '50px', borderTop: '2px solid #e5e7eb', color: '#6b7280', fontSize: '10px' }}>
            <p style={{ marginBottom: '5px' }}>
              Звіт створено {completedAt.toLocaleDateString('uk-UA')} о{' '}
              {completedAt.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p style={{ marginBottom: 0 }}>Сучасна профорієнтаційна методика &quot;Дизайн Освіти&quot;</p>
          </footer>
        </div>
      </div>

      <style>{`
        @media print {
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body { margin: 0; padding: 0; }
          .fixed { display: none !important; }
        }
      `}</style>
    </>
  )
}

function formatRecommendationsText(text: string): React.ReactNode {
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []

  lines.forEach((line, idx) => {
    const trimmed = line.trim()
    if (trimmed === '') {
      elements.push(<div key={`empty-${idx}`} style={{ height: '8px' }} />)
      return
    }
    if (trimmed.match(/^[12]\.\s+/) || trimmed.match(/професійні напрямки/i)) {
      elements.push(
        <h2 key={`header-${idx}`} className="text-2xl font-bold mb-4 pb-2"
          style={{ color: '#1e3a8a', borderBottom: '2px solid #0c68f5', marginTop: idx > 0 ? '30px' : '0' }}>
          {trimmed.replace(/^[12]\.\s+/, '')}
        </h2>
      )
      return
    }
    if (trimmed.match(/^Напрямок \d+:/)) {
      elements.push(
        <div key={`direction-${idx}`} style={{ marginTop: '20px', marginBottom: '10px', fontSize: '15px', fontWeight: 'bold', color: '#1e3a8a' }}>
          {trimmed}
        </div>
      )
      return
    }
    if (trimmed.match(/^Можливі посади/)) {
      const colonIndex = trimmed.indexOf(':')
      if (colonIndex !== -1) {
        elements.push(
          <div key={`positions-${idx}`} style={{ fontSize: '14px', marginTop: '10px', marginBottom: '6px' }}>
            <span style={{ fontWeight: '500', color: '#1e3a8a' }}>{trimmed.substring(0, colonIndex + 1)}</span>
            <span style={{ fontWeight: 'normal', color: '#000000' }}> {trimmed.substring(colonIndex + 1).trim()}</span>
          </div>
        )
      }
      return
    }
    elements.push(
      <p key={`text-${idx}`} style={{ fontSize: '14px', color: '#000000', lineHeight: '1.7', marginBottom: '10px', marginTop: '0' }}>
        {trimmed}
      </p>
    )
  })

  return <>{elements}</>
}
