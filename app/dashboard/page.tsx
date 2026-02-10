'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
  isPaid: boolean
  paymentStatus: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [tests, setTests] = useState<Test[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [purchasing, setPurchasing] = useState<number | null>(null)

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
            setTests(testsData.tests)
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
    try {
      setPurchasing(testId)
      const token = localStorage.getItem('token')
      
      const response = await fetch('/api/user/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ testId }),
      })

      const data = await response.json()

      if (data.success) {
        // Оновлюємо тести після покупки
        const updatedTests = tests.map(test =>
          test.id === testId ? { ...test, isPaid: true, paymentStatus: 'success', hasAccess: true } : test
        )
        setTests(updatedTests)
      } else {
        alert(data.message || 'Помилка при оплаті')
      }
    } catch (err) {
      console.error('Purchase error:', err)
      alert('Помилка при оплаті')
    } finally {
      setPurchasing(null)
    }
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
        <p className="text-gray-600 mb-8">Це ваша персональна панель керування. Тут ви можете переглядати свої результати тестів, отримувати рекомендації та планувати свій освітній шлях.</p>

        {/* Tests Section */}
        <div>
          <h3 className="text-2xl font-bold mb-6">Доступні тести</h3>
          {tests.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-600">Нема доступних тестів</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tests.map((test) => (
                <div key={test.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition">
                  <h4 className="text-lg font-semibold mb-2">{test.title}</h4>
                  <p className="text-gray-600 mb-4">{test.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-gray-500">⏱️ {test.duration} хв</p>
                    <span className="text-lg font-bold text-blue-600">{test.price} грн</span>
                  </div>
                  
                  {/* Payment Status */}
                  <div className="mb-4">
                    {test.isPaid ? (
                      <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                        Оплачено
                      </span>
                    ) : (
                      <span className="inline-block bg-gray-100 text-gray-800 text-xs font-semibold px-3 py-1 rounded-full">
                        Не оплачено
                      </span>
                    )}
                  </div>
                  
                  <button
                    onClick={() => {
                      if (test.hasAccess) {
                        // Перейти на тест
                        router.push(`/tests/${test.id}`)
                      } else {
                        handlePurchaseTest(test.id)
                      }
                    }}
                    disabled={purchasing === test.id}
                    className={`w-full rounded-lg py-2 transition font-semibold disabled:opacity-50 ${
                      test.hasAccess
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-primary text-white hover:bg-blue-600'
                    }`}
                  >
                    {purchasing === test.id
                      ? 'Обробка...'
                      : test.hasAccess
                      ? 'Почати тест'
                      : 'Купити'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold mb-6">Ваші результати</h3>
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-600">Ви ще не пройшли жодних тестів</p>
            <p className="text-gray-500 text-sm mt-2">Розпочніть перший тест вище, щоб побачити результати</p>
          </div>
        </div>
      </main>
    </div>
  )
}
