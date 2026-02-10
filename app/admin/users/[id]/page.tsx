'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: number
  fullName: string
  email: string
  phone?: string
  birthDate?: string
  role: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface TestAccess {
  testId: number
  testTitle: string
  testPrice: number
  hasAccess: boolean
  accessGrantedAt?: string
  paymentStatus: string
  paymentCompletedAt?: string
}

export default function UserDetailPage() {
  const router = useRouter()
  const params = useParams()
  const userId = params.id
  
  const [user, setUser] = useState<User | null>(null)
  const [testAccess, setTestAccess] = useState<TestAccess[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [isUpdatingAccess, setIsUpdatingAccess] = useState(false)
  const [accessUpdateError, setAccessUpdateError] = useState('')

  const [paymentStatus, setPaymentStatus] = useState<string>('unpaid')
  const [hasAccess, setHasAccess] = useState<boolean>(false)

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    birthDate: '',
    role: 'user' as 'user' | 'admin',
    isActive: true,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token')
        
        // Загружаем данные пользователя
        const userResponse = await fetch(`/api/admin/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!userResponse.ok) {
          throw new Error('Помилка завантаження користувача')
        }

        const userData = await userResponse.json()
        setUser(userData.user)
        
        // Преобразуем ISO дату в формат YYYY-MM-DD для input type="date"
        let formattedBirthDate = ''
        if (userData.user.birthDate) {
          const date = new Date(userData.user.birthDate)
          formattedBirthDate = date.toISOString().split('T')[0]
        }
        
        setFormData({
          fullName: userData.user.fullName,
          email: userData.user.email,
          phone: userData.user.phone || '',
          birthDate: formattedBirthDate,
          role: userData.user.role,
          isActive: userData.user.isActive,
        })

        // Загружаем информацию о платежах
        const paymentsResponse = await fetch(`/api/admin/users/${userId}/payments`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (paymentsResponse.ok) {
          const paymentsData = await paymentsResponse.json()
          setTestAccess(paymentsData.testAccess || [])
          
          // Инициализируем статусы для первого теста
          if (paymentsData.testAccess && paymentsData.testAccess.length > 0) {
            const firstTest = paymentsData.testAccess[0]
            setPaymentStatus(firstTest.paymentStatus)
            setHasAccess(firstTest.hasAccess)
          }
        }
      } catch (err) {
        setError('Помилка завантаження даних')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    if (userId) {
      fetchData()
    }
  }, [userId])

  const handleSave = async () => {
    setSaveError('')
    setSaveSuccess(false)

    if (!formData.fullName || !formData.email) {
      setSaveError('Ім\'я та email обов\'язкові')
      return
    }

    setIsSaving(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        setSaveError(data.message || 'Помилка при збереженні')
        return
      }

      setUser(data.user)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err) {
      console.error('Error saving user:', err)
      setSaveError('Помилка підключення до сервера')
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateTestAccess = async (newPaymentStatus: string, newHasAccess: boolean) => {
    if (testAccess.length === 0) return

    setIsUpdatingAccess(true)
    setAccessUpdateError('')

    try {
      const token = localStorage.getItem('token')
      const firstTest = testAccess[0]
      
      const response = await fetch(`/api/admin/users/${userId}/payments`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          testId: firstTest.testId,
          paymentStatus: newPaymentStatus,
          hasAccess: newHasAccess,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setAccessUpdateError(data.message || 'Помилка при оновленні')
        return
      }

      setPaymentStatus(newPaymentStatus)
      setHasAccess(newHasAccess)
      
      // Оновлюємо testAccess
      const updatedAccess = testAccess.map((test, idx) =>
        idx === 0
          ? { ...test, paymentStatus: newPaymentStatus, hasAccess: newHasAccess }
          : test
      )
      setTestAccess(updatedAccess)
    } catch (err) {
      console.error('Error updating access:', err)
      setAccessUpdateError('Помилка підключення до сервера')
    } finally {
      setIsUpdatingAccess(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Завантаження...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/admin" className="text-blue-600 hover:underline">
            Повернутися до списку
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link href="/admin" className="text-blue-600 hover:underline mb-4 inline-block">
          ← Повернутися до списку
        </Link>
        <h1 className="text-4xl font-bold text-gray-900">Редагування користувача</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
            {saveError && (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg">
                {saveError}
              </div>
            )}

            {saveSuccess && (
              <div className="bg-green-50 text-green-700 p-4 rounded-lg">
                ✓ Дані успішно збережені
              </div>
            )}

            {/* Personal Info Section */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Особисті дані</h2>
              
              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ім'я та прізвище
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Телефон
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Birth Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Дата народження
                  </label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Account Settings Section */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Налаштування акаунту</h2>
              
              <div className="space-y-4">
                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Роль
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as 'user' | 'admin' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="user">Користувач</option>
                    <option value="admin">Адміністратор</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Статус
                  </label>
                  <select
                    value={formData.isActive ? 'active' : 'blocked'}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="active">Активний</option>
                    <option value="blocked">Блокований</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="border-t border-gray-200 pt-6">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-semibold"
              >
                {isSaving ? 'Збереження...' : 'Зберегти зміни'}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar - User Info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Інформація</h3>

            <div>
              <p className="text-sm text-gray-600">ID користувача</p>
              <p className="font-mono text-lg">{user?.id}</p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Статус</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                formData.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {formData.isActive ? 'Активний' : 'Блокований'}
              </span>
            </div>

            <div>
              <p className="text-sm text-gray-600">Роль</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                formData.role === 'admin'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {formData.role === 'admin' ? 'Адмін' : 'User'}
              </span>
            </div>

            <hr className="my-4" />

            <div>
              <p className="text-sm text-gray-600">Дата реєстрації</p>
              <p className="text-sm">
                {user?.createdAt && new Date(user.createdAt).toLocaleDateString('uk-UA')}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Остання зміна</p>
              <p className="text-sm">
                {user?.updatedAt && new Date(user.updatedAt).toLocaleDateString('uk-UA')}
              </p>
            </div>

            {/* Test Sections */}
            <hr className="my-4" />
            
            {testAccess.length === 0 ? (
              <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-600">
                <p className="font-semibold">Статус тесту</p>
                <p className="mt-2">Користувач не має доступу до тестів</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-2">{testAccess[0].testTitle}</p>
                  <p className="text-xs text-gray-600 mb-3">{testAccess[0].testPrice} грн</p>

                  {accessUpdateError && (
                    <div className="bg-red-50 text-red-700 p-2 rounded text-xs mb-3">
                      {accessUpdateError}
                    </div>
                  )}

                  {/* Payment Status */}
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Оплата
                    </label>
                    <select
                      value={paymentStatus}
                      onChange={(e) => handleUpdateTestAccess(e.target.value, hasAccess)}
                      disabled={isUpdatingAccess}
                      className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                    >
                      <option value="unpaid">Не оплачено</option>
                      <option value="success">Оплачено</option>
                      <option value="pending">В обробці</option>
                    </select>
                  </div>

                  {/* Access Status */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Доступ до тесту
                    </label>
                    <select
                      value={hasAccess ? 'true' : 'false'}
                      onChange={(e) => handleUpdateTestAccess(paymentStatus, e.target.value === 'true')}
                      disabled={isUpdatingAccess}
                      className="w-full px-2 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                    >
                      <option value="false">Немає доступу</option>
                      <option value="true">Доступен</option>
                    </select>
                  </div>

                  {isUpdatingAccess && (
                    <p className="text-xs text-gray-500 mt-2">Оновлення...</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
