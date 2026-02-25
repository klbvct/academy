'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLoadingAction } from '@/app/hooks/useLoadingAction'

interface User {
  id: number
  fullName: string
  email: string
  role: string
  birthDate?: string
  phone?: string
}

interface Test {
  id: number
  title: string
  description?: string
  price: number
  duration?: number
  questionsCount?: number
  hasAccess: boolean
  isCompleted?: boolean
  resultsPaid?: boolean
  completedAt?: string
  scores?: Record<string, any>
  recommendations?: string
  lastCompletedModule?: number // Прогресс теста
}

export default function DashboardPage() {
  const router = useRouter()
  const { executeWithLoading } = useLoadingAction()
  const [user, setUser] = useState<User | null>(null)
  const [tests, setTests] = useState<Test[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [purchasing, setPurchasing] = useState<number | null>(null)
  const [loadingResults, setLoadingResults] = useState<number | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token')
        
        if (!token) {
          router.push('/login')
          return
        }

        // Получаем данные пользователя
        const userResponse = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })

        const userData = await userResponse.json()

        if (userData.success) {
          // Если админ - перенаправляем в админку
          if (userData.user.role === 'admin') {
            router.push('/admin')
            return
          }
          setUser(userData.user)

          // Получаем информацию о тестах и статусе оплаты
          const testsResponse = await fetch('/api/user/tests', {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          })

          const testsData = await testsResponse.json()
          if (testsData.success) {
            const testsWithProgress = testsData.tests

            // Загрузить прогресс для каждого теста с доступом, который не завершен
            for (const test of testsWithProgress) {
              if (test.hasAccess && !test.isCompleted) {
                try {
                  const progressResponse = await fetch(`/api/tests/${test.id}/progress`, {
                    headers: {
                      'Authorization': `Bearer ${token}`,
                    },
                  })
                  if (progressResponse.ok) {
                    const progressData = await progressResponse.json()
                    if (progressData.success) {
                      test.lastCompletedModule = progressData.lastCompletedModule
                    }
                  }
                } catch (err) {
                  console.error(`Error loading progress for test ${test.id}:`, err)
                }
              }
            }

            setTests(testsWithProgress)
          }
        } else {
          localStorage.removeItem('token')
          router.push('/login')
        }
      } catch (err) {
        setError('Помилка при загруженні даних')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/')
  }

  const handlePurchaseTest = async (testId: number) => {
    setPurchasing(testId)
    await executeWithLoading(async () => {
      try {
        const token = localStorage.getItem('token')
        
        // Запрашиваем платежную ссылку LiqPay
        const response = await fetch('/api/liqpay/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ testId }),
        })

        const data = await response.json()

        if (data.success && data.checkoutUrl) {
          // Перенаправляем пользователя на платежную форму LiqPay
          window.location.href = data.checkoutUrl
        } else {
          alert(data.message || 'Помилка при оплаті')
          setPurchasing(null)
        }
      } catch (err) {
        console.error('Purchase error:', err)
        alert('Помилка при оплаті')
        setPurchasing(null)
      }
    })
  }

  const handlePayForResults = async (testId: number) => {
    setPurchasing(testId)
    await executeWithLoading(async () => {
      try {
        const token = localStorage.getItem('token')
        
        // Запрашиваем платежную ссылку для просмотра результатов
        const response = await fetch('/api/liqpay/checkout-results', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ testId }),
        })

        const data = await response.json()

        if (data.success && data.checkoutUrl) {
          // Перенаправляем пользователя на платежную форму LiqPay
          window.location.href = data.checkoutUrl
        } else {
          alert(data.message || 'Помилка при оплаті')
          setPurchasing(null)
        }
      } catch (err) {
        console.error('Payment error:', err)
        alert('Помилка при оплаті')
        setPurchasing(null)
      }
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">Завантаження...</p>
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error || 'Помилка завантаження'}</p>
          <Link href="/" className="text-primary hover:underline">Повернутися на головну</Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <h1 className="text-xl font-bold text-primary">Дизайн Освіти</h1>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-gray-600"><strong>{user.fullName}</strong>
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              Вийти
            </button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        
        {/* Welcome Section */}
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Ласкаво просимо, {user.fullName}!</h2>
        <p className="text-gray-600 mb-8">Це ваша персональна панель керування. Тут ви можете проходити тести, переглядати результати та отримувати рекомендації.</p>

        {/* Tests Section */}
        <h3 className="text-2xl font-bold mb-6">Доступні тести</h3>
        {tests.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-600">Нема доступних тестів</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test) => (
              <div key={test.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition flex flex-col">
                
                {/* Test Header */}
                <div className="p-6 border-b border-gray-200">
                  <h4 className="text-lg font-semibold mb-2">{test.title}</h4>
                  <p className="text-gray-600 text-sm mb-4">{test.description}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">⏱️ {test.duration} хв</p>
                    <span className="text-lg font-bold text-blue-600">{test.price} ₴</span>
                  </div>
                </div>

                {/* Test Status/Action */}
                <div className="flex-1 p-6 flex flex-col">
                  {!test.isCompleted && (
                    <>
                      {!test.hasAccess ? (
                        <button
                          onClick={() => handlePurchaseTest(test.id)}
                          disabled={purchasing === test.id}
                          className="w-full rounded-lg py-2 transition font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
                        >
                          {purchasing === test.id ? 'Обробка...' : 'Оплатити доступ до тесту'}
                        </button>
                      ) : (
                        <>
                          {/* Прогресс теста */}
                          {test.lastCompletedModule !== undefined && test.lastCompletedModule > 0 && (
                            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <p className="text-sm text-blue-800 font-semibold">⚡ Тест розпочато</p>
                              <p className="text-xs text-blue-700 mt-1">
                                Пройдено модулів: {test.lastCompletedModule} з 8
                              </p>
                              <div className="mt-2 w-full h-2 bg-white rounded-full overflow-hidden">
                                <div
                                  className="h-full transition-all rounded-full bg-blue-600"
                                  style={{ width: `${(test.lastCompletedModule / 8) * 100}%` }}
                                />
                              </div>
                            </div>
                          )}
                          <button
                            onClick={async () => {
                              setLoadingResults(test.id)
                              await executeWithLoading(async () => {
                                router.push(`/tests/${test.id}`)
                              })
                            }}
                            disabled={loadingResults === test.id}
                            className="w-full rounded-lg py-2 transition font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {loadingResults === test.id ? (
                              <>
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Завантаження...
                              </>
                            ) : (
                              test.lastCompletedModule && test.lastCompletedModule > 0 ? 'Продовжити тестування' : 'Почати тест'
                            )}
                          </button>
                        </>
                      )}
                    </>
                  )}

                  {test.isCompleted && (
                    <>
                      <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-green-800 font-semibold">✓ Завершено</p>
                        <p className="text-xs text-green-700 mt-1">
                          {test.completedAt ? new Date(test.completedAt).toLocaleDateString('uk-UA') : 'N/A'}
                        </p>
                      </div>

                      <Link
                        href={`/tests/${test.id}/results`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full mt-auto rounded-lg py-2 transition font-semibold text-white bg-blue-600 hover:bg-blue-700 flex items-center justify-center no-underline hover:no-underline"
                      >
                        Переглянути результати
                      </Link>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
