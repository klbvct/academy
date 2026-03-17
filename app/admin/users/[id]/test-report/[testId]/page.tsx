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

        const response = await fetch(`/api/admin/users/${userId}/test-report/${testId}`)

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
            <p style={{ fontSize: '14px', textAlign: 'left', marginBottom: '10px', lineHeight: '1.6' }}>Перед Вами ваш унікальний Дизайн освіти. <strong style={{ color: '#1e3a8a' }}>Результат формування індивідуальної освітньої траекторії</strong>, що враховує унікальні особливості, інтереси, здібності та життєві цілі кожної людини. Його мета — допомогти усвідомлено підійти до вибору навчання і сформувати такий освітній шлях, який максимально відповідає потенціалу та прагненням особистості.</p>
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
              <li style={{ marginTop: '1rem' }}><strong style={{ color: '#1e3a8a' }}>Уважно вивчіть ваші індивідуальні показники</strong>. Важливо зрозуміти, які напрямки навчання відповідають тим чи іншим задаткам, інтересам, талантам і здібностям. Наступним кроком для вас стане вибір освітньо-професійного напрямку і рівню кваліфікації.</li>
              <li style={{ marginTop: '1rem' }}>Після цього варто визначити <strong style={{ color: '#1e3a8a' }}>галузь знань</strong>, яка вам найбільше відгукується, і дослідити університети, де можна її вивчати. У багатьох університетах існують <strong style={{ color: '#1e3a8a' }}>підготовчі програми</strong>, які допомагають краще підготуватися до навчання та адаптуватися до академічного середовища. Я часто рекомендую абітурієнтам проходити такі програми перед вступом до університету, адже вони значно підвищують шанси на успішний старт навчання.</li>
              <li style={{ marginTop: '1rem' }}>Також важливо звернути увагу на <strong style={{ color: '#1e3a8a' }}>додаткову підготовку з профільних предметів</strong>. Університети та спеціалізовані факультети часто приділяють особливу увагу результатам саме з тих дисциплін, які є ключовими для обраного напряму.</li>
              <li style={{ marginTop: '1rem' }}>Оптимально починати <strong style={{ color: '#1e3a8a' }}>цілеспрямовану підготовку до вступу вже з 9 класу</strong>. Це дає достатньо часу, щоб визначитися з напрямом, посилити академічні знання та підготувати необхідні документи для вступу.</li>
              <li style={{ marginTop: '1rem' }}>Як обрати один напрям серед кількох можливих? Важливо поєднати <strong style={{ color: '#1e3a8a' }}>три ключові фактори: інтерес, здібності та мотивацію</strong>. Саме ця комбінація допомагає зрозуміти, у якому напрямі буде легше розвиватися і досягати результатів.</li>
              <li style={{ marginTop: '1rem' }}>Варто пам&apos;ятати, що <strong style={{ color: '#1e3a8a' }}>бакалаврат — це фундаментальна освіта</strong>, на якій буде будуватися ваша подальша професійна траєкторія. Ці кілька років можуть стати потужною інвестицією у майбутню кар&apos;єру, якщо обрати напрям усвідомлено і використати можливості навчання максимально. <strong style={{ color: '#1e3a8a' }}>Чим більш фундаментальним і широким є напрям бакалаврату</strong>, тим більше можливостей для подальшої спеціалізації та розвитку він відкриває.</li>
              <li style={{ marginTop: '1rem' }}>Сучасний ринок праці також змінюється. <strong style={{ color: '#1e3a8a' }}>Монопрофесії поступово відходять у минуле</strong>, і все більше цінуються фахівці, які поєднують знання та навички з різних галузей. Саме тому важливо навчитися <strong style={{ color: '#1e3a8a' }}>комбінувати компетенції</strong> та розвивати міждисциплінарне мислення.</li>
              <li style={{ marginTop: '1rem' }}>На етапі вступу до університету не варто намагатися визначити <strong style={{ color: '#1e3a8a' }}>одну професію на все життя</strong>. Сучасна освіта працює інакше: спочатку обирається <strong style={{ color: '#1e3a8a' }}>галузь або напрям навчання</strong>, а вже в процесі навчання з&apos;являється можливість спеціалізуватися та обрати конкретну професійну роль. Головне, щоб напрямок навчання був актуальним і передбачав велику кількість професійних варіацій.</li>
              <li style={{ marginTop: '1rem' }}>Під час вибору освітнього напряму варто враховувати динаміку сучасного ринку праці. Деякі спеціальності поступово стають <strong style={{ color: '#1e3a8a' }}>«професіями-пенсіонерами»</strong> — тобто такими, що з часом втрачають актуальність через технологічні зміни. Тому важливо оцінювати не лише популярність професії сьогодні, а й <strong style={{ color: '#1e3a8a' }}>її перспективи в найближчі 10–15 років</strong>.</li>
            </ol>
            <p>Найбільш точно та глибоко інтерпретувати результати тестування може <strong style={{ color: '#1e3a8a' }}>освітній консультант</strong>, який допоможе поєднати отримані дані з реальними можливостями навчання та кар’єрного розвитку. Водночас, якщо ви самостійно можете визначити напрямок навчання, який вам підходить, — це чудовий результат і важливий крок до усвідомленого вибору освіти.</p>
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
