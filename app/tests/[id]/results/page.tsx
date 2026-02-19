'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { Module1ProfessionalVector } from '@/app/components/results/Module1ProfessionalVector'
import { Module2Interests } from '@/app/components/results/Module2Interests'
import { Module3ThinkingTypes } from '@/app/components/results/Module3ThinkingTypes'
import { Module4_6MotivationValues } from '@/app/components/results/Module4_6MotivationValues'
import { Module5Intelligences } from '@/app/components/results/Module5Intelligences'
import { Module7HollandRIASEC } from '@/app/components/results/Module7HollandRIASEC'
import { Module8PerceptionTypes } from '@/app/components/results/Module8PerceptionTypes'
import { useLoadingAction } from '@/app/hooks/useLoadingAction'

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

export default function ResultsPage() {
  const router = useRouter()
  const params = useParams()
  const testId = params.id as string
  const contentRef = useRef<HTMLDivElement>(null)
  const { executeWithLoading } = useLoadingAction()

  const [results, setResults] = useState<TestResults | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isResultsPaid, setIsResultsPaid] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [purchasing, setPurchasing] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [showButton, setShowButton] = useState(false)
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false)
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // Only enable scroll-based visibility after results are loaded and access is granted
    if (!results || !isResultsPaid || isGeneratingPDF) {
      setShowButton(false)
      return
    }

    // Show button initially when content is ready
    setShowButton(true)

    const handleScroll = () => {
      // Show button if at the top
      if (window.scrollY === 0) {
        setShowButton(true)
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current)
        }
        return
      }

      setShowButton(false)
      
      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
      
      // Show button again after scrolling stops (2 seconds)
      scrollTimeoutRef.current = setTimeout(() => {
        setShowButton(true)
      }, 10000)
    }

    window.addEventListener('scroll', handleScroll)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [results, isResultsPaid, isGeneratingPDF])

  // Helper function to generate recommendations
  const generateRecommendations = async (id: string): Promise<any> => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/tests/${id}/generate-recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Failed to generate recommendations:', data.message)
        return null
      }

      if (data.success && data.data) {
        return data.data
      }
      return null
    } catch (error) {
      console.error('Error generating recommendations:', error)
      return null
    }
  }

  useEffect(() => {
    const loadResults = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')

        const response = await fetch(`/api/tests/${testId}/results`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          setError('Помилка при завантаженні результатів')
          setLoading(false)
          return
        }

        const data = await response.json()
        setIsResultsPaid(data.isResultsPaid)
        setUserData(data.user)

        // If results are paid and recommendations don't exist, auto-generate them before showing page
        if (data.isResultsPaid && !data.data.recommendations) {
          console.log('Auto-generating recommendations before showing results...')
          try {
            const recommendations = await generateRecommendations(testId)
            if (recommendations) {
              data.data.recommendations = recommendations
              console.log('Recommendations auto-generated successfully')
            } else {
              console.warn('Auto-generation failed, user can manually trigger it later')
              // Still show the page, just without recommendations
            }
          } catch (err) {
            console.error('Error during auto-generation:', err)
            // Continue to show page without recommendations
          }
        }

        setResults(data.data)
      } catch (err) {
        console.error('Error loading results:', err)
        setError('Помилка при завантаженні результатів')
      } finally {
        setLoading(false)
      }
    }

    loadResults()
  }, [testId])

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return
    try {
      setIsGeneratingPDF(true)
      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        logging: false,
        allowTaint: true,
        backgroundColor: '#ffffff',
      })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = pdfWidth - 20
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      let yPosition = 10
      pdf.addImage(imgData, 'PNG', 10, yPosition, imgWidth, imgHeight)
      let remainingHeight = imgHeight - pdfHeight + 20
      while (remainingHeight > 0) {
        pdf.addPage()
        yPosition = -remainingHeight + pdfHeight - 10
        pdf.addImage(imgData, 'PNG', 10, yPosition, imgWidth, imgHeight)
        remainingHeight -= pdfHeight - 20
      }
      const filename = userData?.name
        ? `профорієнтаційний-тест-${userData.name}.pdf`
        : 'профорієнтаційний-тест.pdf'
      pdf.save(filename)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Помилка при створенні PDF. Спробуйте потім.')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  const handleGenerateRecommendations = async () => {
    setIsGeneratingRecommendations(true)
    await executeWithLoading(async () => {
      try {
        const recommendations = await generateRecommendations(testId)
        
        if (!recommendations) {
          alert('Не вдалося згенерувати рекомендації. Спробуйте пізніше.')
          setIsGeneratingRecommendations(false)
          return
        }

        // Update results with new recommendations
        setResults(prev => prev ? {
          ...prev,
          recommendations: recommendations
        } : null)
        alert('Рекомендації успішно згенеровані!')
      } catch (error) {
        console.error('Error generating recommendations:', error)
        alert('Помилка при генерації рекомендацій. Перевірте підключення до інтернету.')
      } finally {
        setIsGeneratingRecommendations(false)
      }
    })
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
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            Повернутися до кабінету
          </Link>
        </div>
      </div>
    )
  }

  // Paywall
  if (!isResultsPaid) {
    const handlePayment = async () => {
      setPurchasing(true)
      await executeWithLoading(async () => {
        try {
          const token = localStorage.getItem('token')
          const response = await fetch('/api/liqpay/checkout-results', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ testId: parseInt(testId) }),
          })
          const data = await response.json()
          if (data.success && data.checkoutUrl) {
            window.location.href = data.checkoutUrl
          } else {
            alert(data.message || 'Помилка при оплаті')
            setPurchasing(false)
          }
        } catch (err) {
          console.error('Payment error:', err)
          alert('Помилка при оплаті')
          setPurchasing(false)
        }
      })
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full" style={{ boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)' }}>
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold mb-2">Заблоковано</h2>
            <p className="text-gray-600 mb-4">
              Щоб переглянути повні результати тестування з інтерпретацією, необхідно оплатити доступ
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-3xl font-bold" style={{ color: '#0c68f5' }}>99 ₴</p>
              <p className="text-gray-600 text-sm">Одноразова оплата</p>
            </div>
          </div>
          <button
            onClick={handlePayment}
            disabled={purchasing}
            className="w-full py-3 rounded-lg font-semibold text-white transition-all disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #0c68f5 0%, #764ba2 100%)' }}
          >
            {purchasing ? 'Обробка...' : 'Оплатити'}
          </button>
          <Link href="/dashboard" className="block text-center mt-4 text-gray-600 hover:text-gray-800 transition">
            Повернутися до кабінету
          </Link>
        </div>
      </div>
    )
  }

  const completedAt = new Date(results.completedAt)
  const birthDateFormatted = userData?.birthdate
    ? new Date(userData.birthdate).toLocaleDateString('uk-UA', { year: 'numeric', month: '2-digit', day: '2-digit' })
    : 'Не вказано'

  // Parse recommendations if string - recalculate every time results changes
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
      {/* Print/PDF button */}
      <div className="fixed top-5 right-5 z-50 flex flex-col items-end gap-2 print:hidden" style={{
        opacity: showButton ? 1 : 0,
        visibility: showButton ? 'visible' : 'hidden',
        transition: 'opacity 0.3s ease-in-out, visibility 0.3s ease-in-out'
      }}>
        <div className="bg-white/95 rounded-lg shadow-sm p-3 text-right max-w-xs">
          <p className="text-xs text-gray-600">
            💡 Натисніть кнопку, щоб роздрукувати або зберегти звіт як PDF
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            disabled={isGeneratingPDF}
            aria-label="Друкувати або зберегти результати як PDF"
            className="text-white px-6 py-3 rounded-lg font-semibold text-sm transition-all hover:scale-105 flex items-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: '#bb2d2d' }}
          >
            <span>{isGeneratingPDF ? 'Генерація PDF...' : 'Друк / Зберегти PDF'}</span>
          </button>
        </div>
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
          <section
            className="mb-10 p-5 rounded"
            style={{
              background: '#ddd6fe36',
              pageBreakInside: 'avoid',
            }}
          >
            <p style={{ fontSize: '12px', color: '#1e3a8a', fontWeight: 'bold', textAlign: 'left', marginBottom: 0, lineHeight: '1.6' }}>
              Дизайн Освіти – не просто тест, це процес формування індивідуальної освітньої траєкторії для кожного.
              Створення власного дизайну освіти із сучасних видів та типів навчання, враховуючи унікальні особистості та цілі особистості.
            </p>
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
                  <div
                    key={i}
                    className="flex justify-between mb-2 p-3 rounded"
                    style={{ background: '#f3f4f6', fontSize: '12px' }}
                  >
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
                  <div
                    key={i}
                    className="flex justify-between mb-2 p-3 rounded"
                    style={{ background: '#f3f4f6', fontSize: '12px' }}
                  >
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
              {/* Module 1: Professional Vector*/}
              {(results.scores.m1_nature !== undefined || results.scores.m1_technic !== undefined) && (
                <Module1ProfessionalVector scores={results.scores} recommendations={recommendationsObj} />
              )}

              {/* Module 2: Interests */}
              {(results.scores.m2_naturalScience !== undefined || results.scores.m2_engineering !== undefined) && (
                <Module2Interests scores={results.scores} />
              )}

              {/* Module 3: Thinking Types */}
              {(results.scores.m3_artistic !== undefined || results.scores.m3_theoretical !== undefined) && (
                <Module3ThinkingTypes scores={results.scores} />
              )}

              {/* Module 4+6: Motivation & Values (combined) */}
              {(results.scores.m4_values !== undefined || results.scores.m6_strongMotivator !== undefined) && (
                <Module4_6MotivationValues scores={results.scores} />
              )}

              {/* Module 5: Intelligences */}
              {(results.scores.m5_linguistic !== undefined || results.scores.m5_logicalMathematical !== undefined) && (
                <Module5Intelligences scores={results.scores} />
              )}

              {/* Module 7: Holland RIASEC */}
              {(results.scores.m7_r !== undefined || results.scores.m7_i !== undefined) && (
                <Module7HollandRIASEC scores={results.scores} />
              )}

              {/* Module 8: Perception Types */}
              {(results.scores.m8_visual !== undefined || results.scores.m8_auditory !== undefined) && (
                <Module8PerceptionTypes scores={results.scores} />
              )}
            </>
          )}

          {/* ========== RECOMMENDATIONS ========== */}
          <section className="mb-10" style={{ pageBreakInside: 'avoid' }}>
            <h2 className="text-2xl font-bold mb-4 pb-2" style={{ color: '#1e3a8a', borderBottom: '2px solid #0c68f5' }}>
              <span style={{
                display: 'inline-block',
                width: '50px',
                height: '50px',
                backgroundColor: '#f3f4f6',
                color: '#0c68f5',
                borderRadius: '8px',
                textAlign: 'center',
                lineHeight: '50px',
                fontWeight: 'bold',
                fontSize: '20px',
                marginRight: '12px',
                verticalAlign: 'middle'
              }}>
                08
              </span>
              Рекомендації до вибору професійних напрямків
            </h2>
            <p style={{ marginBottom: '20px', lineHeight: '1.6', fontSize: '13px', fontWeight: 'bold' }}>
              На основі комплексного аналізу ваших результатів тестування рекомендуємо наступні професійні напрямки та фахи для навчання:
            </p>

            {recommendationsObj?.text ? (
              <>
                <div style={{ margin: '25px 0', padding: '20px', background: '#f8f9fa', borderRadius: '8px' }}>
                  {formatRecommendationsText(recommendationsObj.text)}
                </div>
              </>
            ) : (
              /* Fallback: show raw recommendations text or placeholder */
              <div style={{ margin: '25px 0', padding: '25px', background: '#fef3c7', borderLeft: '4px solid #f59e0b', borderRadius: '8px' }}>
                {typeof results.recommendations === 'string' && results.recommendations && results.recommendations !== 'Рекомендації недоступні' ? (
                  <>
                    <p style={{ fontSize: '12px', color: '#1e3a8a', fontWeight: 'bold', marginBottom: '10px' }}>
                      Персональні рекомендації:
                    </p>
                    <p style={{ fontSize: '11px', color: '#374151', lineHeight: '1.6', whiteSpace: 'pre-line', marginBottom: 0 }}>
                      {results.recommendations}
                    </p>
                  </>
                ) : (
                  <>
                    <h4 style={{ color: '#92400E', marginTop: 0 }}>Завантажити рекомендації</h4>
                    <p style={{ color: '#78350F', marginBottom: '20px', lineHeight: '1.6' }}>
                      На основі комплексного аналізу ваших результатів буде створено персоналізовані рекомендації щодо професійних напрямків та спеціальностей для навчання.
                    </p>
                    <button
                      onClick={handleGenerateRecommendations}
                      disabled={isGeneratingRecommendations}
                      className="px-6 py-3 rounded-lg font-semibold text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed print:hidden"
                      style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 4px 6px rgba(16, 185, 129, 0.3)' }}
                    >
                      {isGeneratingRecommendations ? 'Завантаження рекомендацій...' : 'Завантажити рекомендації'}
                    </button>
                  </>
                )}
              </div>
            )}
          </section>

          {/* ========== PREPARATION FOR ADMISSION ========== */}
          <section className="mb-10" style={{ pageBreakInside: 'avoid' }}>
            <h2 className="text-2xl font-bold mb-4 pb-2" style={{ color: '#1e3a8a', borderBottom: '2px solid #0c68f5' }}>
              <span style={{
                display: 'inline-block',
                width: '50px',
                height: '50px',
                backgroundColor: '#f3f4f6',
                color: '#0c68f5',
                borderRadius: '8px',
                textAlign: 'center',
                lineHeight: '50px',
                fontWeight: 'bold',
                fontSize: '20px',
                marginRight: '12px',
                verticalAlign: 'middle'
              }}>
                9
              </span>
              Підготовка до вступу
            </h2>
            <ol style={{ marginLeft: '30px', lineHeight: '1.6', listStyleType: 'decimal' }}>
              <li style={{ marginTop: '1rem' }}>
                Вивчити представлені напрямки навчання та їх значення. Зрозуміти, що вивчатиметься в рамках цих напрямків,
                ознайомитись з планом навчання.
              </li>
              <li style={{ marginTop: '1rem' }}>
                Вибрати галузь знань та дізнатися в ВНЗ, які цікавлять, можливість підготовчих програм. Я завжди рекомендую
                абітурієнтам проходити підготовчу програму перед університетом – це дає додаткові привілеї під час вступу.
              </li>
              <li style={{ marginTop: '1rem' }}>
                Розглянути можливість додаткових професійних занять з профільним предметам. Спеціалізовані факультети звертають
                особливу увагу на кількість балів за профілем.
              </li>
              <li style={{ marginTop: '1rem' }}>
                Цілеспрямована підготовка до вступу починається з 9 класу, в ідеалі.
              </li>
              <li style={{ marginTop: '1rem' }}>
                Дані тесту дають можливість зрозуміти, у яких напрямках є схильності на даний момент. Як зупинитися на чомусь
                одному? До ваших нахилів та інтересів ви додаєте вашу мотивацію. Так буде простіше зрозуміти на чому зупинити
                свій вибір зараз.
              </li>
              <li style={{ marginTop: '1rem' }}>
                Оцінюємо знання англійської та можливість здачі міжнародних іспитів для отримання сертифіката під час вирішення
                навчатися за кордоном. Крім англійської вчимо БУДЬ-ЯКУ ІНШУ поширену іноземну мову! Мови в сучасному світі – вже
                не додаткова, а для більшості професій – обов&apos;язкова навичка.
              </li>
              <li style={{ marginTop: '1rem' }}>
                Запам&apos;ятайте! Бакалаврат – базова освіта, на якій буде засновано ваше подальше професійне життя. Ці 3-4 роки
                можна провчитися з величезною користю для подальшої кар&apos;єри, а можна просто витратити і починати все спочатку.
              </li>
              <li style={{ marginTop: '1rem' }}>
                Чим базовіший, фундаментальний напрямок вивчається на бакалавріаті, тим більше її складові стануть у нагоді
                надалі.
              </li>
              <li style={{ marginTop: '1rem' }}>
                Монопрофесії вже у минулому. Сучасні люди здатні здобути не одну професійну навичку в різних сферах. Комбінуйте
                навички з різних галузей знань. Це цікаво і дає величезну перевагу у майбутньому.
              </li>
              <li style={{ marginTop: '1rem' }}>
                Не забувайте про цифрові навички, які межують з основною спеціальністю. Сьогодні фахівець в будь-якій галузі
                повинен працювати в умовах цифровізації і технологізації.
              </li>
            </ol>

            {/* Contact block */}
            <div
              style={{
                marginTop: '30px',
                padding: '20px',
                background: '#f0f9ff',
                border: '2px solid #0284c7',
                borderRadius: '12px',
              }}
            >
              <h3 style={{ marginTop: 0, color: '#0c68f5' }}>Контакти</h3>
              <p>
                <strong>Автор проекту:</strong> Калабухова Мар&apos;яна
              </p>
              <p>
                <strong>Telegram:</strong> @edu_carrier_design – Гранти, Стипендії, Новини освіти
              </p>
              <p>
                <strong>Сайт Дизайн Освіти:</strong>{' '}
                <a href="https://education-design.com.ua/" style={{ color: '#0c68f5' }}>
                  https://education-design.com.ua/
                </a>
              </p>
            </div>
          </section>

          {/* Footer */}
          <footer
            className="pt-5 text-center"
            style={{ marginTop: '50px', borderTop: '2px solid #e5e7eb', color: '#6b7280', fontSize: '10px' }}
          >
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
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          body { margin: 0; padding: 0; }
          .fixed { display: none !important; }
          div[ref] { box-shadow: none; }
        }
      `}</style>
    </>
  )
}

// ========== HELPER: Format AI-generated recommendations with styling ==========
function formatRecommendationsText(text: string): React.ReactNode {
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []
  
  lines.forEach((line, idx) => {
    const trimmed = line.trim()
    
    // Пропускаем пустые строки
    if (trimmed === '') {
      elements.push(<div key={`empty-${idx}`} style={{ height: '8px' }} />)
      return
    }
    
    // Секции: "1. Пріоритетні..." или "2. Альтернативні..." или просто "Пріоритетні професійні напрямки"
    if (trimmed.match(/^[12]\.\s+/) || trimmed.match(/професійні напрямки/i)) {
      const sectionText = trimmed.replace(/^[12]\.\s+/, '')
      elements.push(
        <h2 
          key={`header-${idx}`} 
          className="text-2xl font-bold mb-4 pb-2" 
          style={{ 
            color: '#1e3a8a', 
            borderBottom: '2px solid #0c68f5',
            marginTop: idx > 0 ? '30px' : '0'
          }}
        >
          {sectionText}
        </h2>
      )
      return
    }
    
    // Напрямок X: - выделенные подзаголовки направлений
    if (trimmed.match(/^Напрямок \d+:/)) {
      elements.push(
        <div 
          key={`direction-${idx}`} 
          style={{ 
            marginTop: '20px', 
            marginBottom: '10px',
            fontSize: '15px',
            fontWeight: 'bold',
            color: '#1e3a8a'
          }}
        >
          {trimmed}
        </div>
      )
      return
    }
    
    // Можливі посади та кар'єрний розвиток: - подсекция
    if (trimmed.match(/^Можливі посади/)) {
      const colonIndex = trimmed.indexOf(':')
      if (colonIndex !== -1) {
        const header = trimmed.substring(0, colonIndex + 1) // включая двоеточие
        const content = trimmed.substring(colonIndex + 1).trim() // текст после двоеточия
        
        elements.push(
          <div 
            key={`positions-${idx}`} 
            style={{ 
              fontSize: '14px',
              marginTop: '10px',
              marginBottom: '6px'
            }}
          >
            <span style={{ fontWeight: '500', color: '#1e3a8a' }}>{header}</span>
            {content && <span style={{ fontWeight: 'normal', color: '#000000' }}> {content}</span>}
          </div>
        )
      } else {
        // если нет двоеточия, рендерим весь текст синим
        elements.push(
          <div 
            key={`positions-${idx}`} 
            style={{ 
              fontSize: '14px',
              fontWeight: 'bold',
              marginTop: '10px',
              marginBottom: '6px',
              color: '#1e3a8a'
            }}
          >
            {trimmed}
          </div>
        )
      }
      return
    }
    
    // Обычный текст
    elements.push(
      <p 
        key={`text-${idx}`} 
        style={{ 
          fontSize: '14px',
          color: '#000000',
          lineHeight: '1.7',
          marginBottom: '10px',
          marginTop: '0'
        }}
      >
        {trimmed}
      </p>
    )
  })
  
  return <>{elements}</>
}

// ========== HELPER: Build psychological map data from scores ==========
// REMOVED: buildPsychologicalMap function deleted (section no longer used)
/*
function buildPsychologicalMap(scores: Record<string, any>) {
  // 1. Intellectual potential (dominant thinking type)
  const thinkingMap: Record<string, string> = {
    m3_artistic: 'Художнє (наочно-образне)',
    m3_theoretical: 'Теоретичне',
    m3_practical: 'Практичне',
    m3_creative: 'Творче (продуктивне)',
    m3_convergent: 'Конвергентне',
    m3_intuitive: 'Інтуїтивне',
    m3_analytical: 'Аналітичне',
  }
  const thinkingKeys = Object.keys(thinkingMap)
  let dominantThinking = ''
  let maxThinking = -1
  thinkingKeys.forEach((k) => {
    const val = typeof scores[k] === 'number' ? scores[k] : (scores[k]?.percentageExample || 0)
    if (val > maxThinking) {
      maxThinking = val
      dominantThinking = k
    }
  })
  const thinkingLabel = thinkingMap[dominantThinking] || 'Не визначено'

  // 2. Character traits from thinking + Holland
  const thinkingTraits: Record<string, string[]> = {
    m3_artistic: ['Уява', 'Креативність', 'Емоційність'],
    m3_theoretical: ['Аналітичність', 'Логічність', 'Систематичність'],
    m3_practical: ['Виваженість', 'Прагматичність', 'Реалістичність'],
    m3_creative: ['Оригінальність', 'Інноваційність', 'Гнучкість'],
    m3_convergent: ['Точність', 'Концентрація', 'Цілеспрямованість'],
    m3_intuitive: ['Проникливість', 'Передбачення', 'Чутливість'],
    m3_analytical: ['Критичність', 'Детальність', 'Обґрунтованість'],
  }
  let characterTraits = [...(thinkingTraits[dominantThinking] || [])]

  const hollandTraitsMap: Record<string, string> = {
    m7_r: 'Практичність',
    m7_i: 'Допитливість',
    m7_a: 'Творчість',
    m7_s: 'Емпатія',
    m7_e: 'Лідерство',
    m7_c: 'Організованість',
  }
  const hollandKeys = ['m7_r', 'm7_i', 'm7_a', 'm7_s', 'm7_e', 'm7_c']
  let topHolland = ''
  let maxHolland = -1
  hollandKeys.forEach((k) => {
    const val = Number(scores[k]) || 0
    if (val > maxHolland) {
      maxHolland = val
      topHolland = k
    }
  })
  if (topHolland && hollandTraitsMap[topHolland]) {
    characterTraits.push(hollandTraitsMap[topHolland])
  }
  characterTraits = [...new Set(characterTraits)].slice(0, 3)

  // 3. Self-control (based on motivation scores)
  const strongM = Number(scores.m6_strongMotivator) || 0
  const moderateM = Number(scores.m6_moderate) || 0
  const weakM = Number(scores.m6_weak) || 0
  const demoM = Number(scores.m6_demotivator) || 0
  const motCount = [strongM, moderateM, weakM, demoM].filter((v) => v > 0).length
  const avgMotivation = motCount > 0 ? (strongM + moderateM + weakM + demoM) / motCount : 0
  const selfControl = avgMotivation >= 60 ? 'Високий' : avgMotivation >= 30 ? 'Середній' : 'Потребує розвитку'

  // 4. Inclinations
  const inclinationMap: Record<string, string> = {
    m3_artistic: 'Творчість',
    m3_theoretical: 'Наукова діяльність',
    m3_practical: 'Практична діяльність',
    m3_creative: 'Креативні проєкти',
    m3_convergent: 'Стратегічне планування',
    m3_intuitive: 'Інтуїтивне прийняття рішень',
    m3_analytical: 'Аналітика',
  }
  const hollandInclinationMap: Record<string, string> = {
    m7_r: 'Технічна робота',
    m7_i: 'Дослідження',
    m7_a: 'Мистецтво',
    m7_s: 'Робота з людьми',
    m7_e: 'Підприємництво',
    m7_c: 'Організаційна діяльність',
  }
  let inclinations: string[] = []
  const sortedThinking = thinkingKeys
    .map((k) => ({ k, v: typeof scores[k] === 'number' ? scores[k] : (scores[k]?.percentageExample || 0) }))
    .sort((a, b) => b.v - a.v)
    .slice(0, 3)
  sortedThinking.forEach(({ k }) => {
    if (inclinationMap[k]) inclinations.push(inclinationMap[k])
  })
  const sortedHolland = hollandKeys
    .map((k) => ({ k, v: Number(scores[k]) || 0 }))
    .sort((a, b) => b.v - a.v)
    .slice(0, 2)
  sortedHolland.forEach(({ k }) => {
    if (hollandInclinationMap[k]) inclinations.push(hollandInclinationMap[k])
  })
  inclinations = [...new Set(inclinations)].slice(0, 4)

  // 5. Value orientations (top 3 from ranked values)
  const valueOrientations: string[] = []
  if (scores.m4_values && typeof scores.m4_values === 'object') {
    const vals = Object.entries(scores.m4_values)
      .filter(([, v]) => typeof v === 'number')
      .sort(([, a], [, b]) => (a as number) - (b as number))
      .slice(0, 3) as [string, number][]
    vals.forEach(([v]) => valueOrientations.push(v.charAt(0).toUpperCase() + v.slice(1)))
  }

  // 6. RIASEC code
  const sortedRiasec = hollandKeys
    .map((k) => ({ letter: k.replace('m7_', '').toUpperCase(), typeKey: k, score: Number(scores[k]) || 0 }))
    .sort((a, b) => b.score - a.score)
  const riasecCode = sortedRiasec.slice(0, 3).map((t) => t.letter).join('')

  const riasecTypeNames: Record<string, string> = {
    m7_r: 'Realistic (Практик)',
    m7_i: 'Investigative (Мислитель. Дослідник)',
    m7_a: 'Artistic (Творець)',
    m7_s: 'Social (Помічник)',
    m7_e: 'Enterprising (Лідер)',
    m7_c: 'Conventional (Організатор)',
  }
  const riasecDescriptions: Record<string, string> = {
    m7_r: 'Орієнтація на роботу з інструментами, машинами, природою',
    m7_i: 'Аналіз, наукове мислення, вирішення складних завдань',
    m7_a: 'Самовираження, творчість, нестандартні рішення',
    m7_s: 'Робота з людьми, допомога, навчання, турбота',
    m7_e: 'Управління, організація, досягнення цілей',
    m7_c: 'Порядок, структура, робота з даними',
  }

  const riasecTypes = sortedRiasec.slice(0, 3).map((t) => ({
    type: t.typeKey,
    name: riasecTypeNames[t.typeKey] || t.typeKey,
    description: riasecDescriptions[t.typeKey] || '',
  }))

  return { thinkingLabel, characterTraits, selfControl, inclinations, valueOrientations, riasecCode, riasecTypes }
}
*/