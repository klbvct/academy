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
  hasResults: boolean
  testCompletedAt?: string
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
  const [isResettingResults, setIsResettingResults] = useState(false)
  const [resetError, setResetError] = useState('')
  const [resetSuccess, setResetSuccess] = useState(false)

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

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
      
      // Оновлюємо testAccess
      const updatedAccess = testAccess.map((test, idx) =>
        idx === 0
          ? { ...test, paymentStatus: newPaymentStatus }
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

  const handleResetTestResults = async () => {
    if (testAccess.length === 0) return

    setIsResettingResults(true)
    setResetError('')
    setResetSuccess(false)

    try {
      const token = localStorage.getItem('token')
      const firstTest = testAccess[0]
      
      const response = await fetch(`/api/admin/users/${userId}/reset-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          testId: firstTest.testId,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setResetError(data.message || 'Помилка при скиданні результатів')
        return
      }

      // Обновляем локальный стейт: доступ закрыт, оплата сброшена
      setPaymentStatus('unpaid')
      setHasAccess(false)
      setTestAccess(prev => prev.map(t =>
        t.testId === firstTest.testId
          ? { ...t, hasAccess: false, paymentStatus: 'unpaid', hasResults: false, testCompletedAt: undefined, accessGrantedAt: undefined, paymentCompletedAt: undefined }
          : t
      ))

      setResetSuccess(true)
      setTimeout(() => setResetSuccess(false), 3000)
    } catch (err) {
      console.error('Error resetting test:', err)
      setResetError('Помилка підключення до сервера')
    } finally {
      setIsResettingResults(false)
    }
  }

  const handleDeleteUser = async () => {
    setIsDeleting(true)
    setDeleteError('')
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await response.json()

      if (!response.ok) {
        setDeleteError(data.message || 'Помилка при видаленні')
        setIsDeleting(false)
        return
      }

      // Успішно — повертаємось до списку
      router.push('/admin')
    } catch (err) {
      console.error('Error deleting user:', err)
      setDeleteError('Помилка підключення до сервера')
      setIsDeleting(false)
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
                  <label className="block text-base font-medium text-gray-700 mb-2">
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
                  <label className="block text-base font-medium text-gray-700 mb-2">
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
                  <label className="block text-base font-medium text-gray-700 mb-2">
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
                  <label className="block text-base font-medium text-gray-700 mb-2">
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
                  <label className="block text-base font-medium text-gray-700 mb-2">
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
                  <label className="block text-base font-medium text-gray-700 mb-2">
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
            <div className="border-t border-gray-200 pt-6 flex flex-col gap-3">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-semibold"
              >
                {isSaving ? 'Збереження...' : 'Зберегти зміни'}
              </button>
              <button
                onClick={() => { setDeleteError(''); setShowDeleteModal(true) }}
                className="w-full px-6 py-3 bg-white border border-red-300 text-red-600 rounded-lg hover:bg-red-50 hover:border-red-400 transition font-semibold"
              >
                Видалити акаунт
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar - User Info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Інформація</h3>

            <div>
              <p className="text-base text-gray-600">ID користувача</p>
              <p className="font-mono text-lg">{user?.id}</p>
            </div>

            <div>
              <p className="text-base text-gray-600">Статус</p>
              <span className={`inline-block px-3 py-1 rounded-full text-base font-semibold ${
                formData.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {formData.isActive ? 'Активний' : 'Блокований'}
              </span>
            </div>

            <div>
              <p className="text-base text-gray-600">Роль</p>
              <span className={`inline-block px-3 py-1 rounded-full text-base font-semibold ${
                formData.role === 'admin'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {formData.role === 'admin' ? 'Адміністратор' : 'Користувач'}
              </span>
            </div>

            <hr className="my-4" />

            <div>
              <p className="text-base text-gray-600">Дата реєстрації</p>
              <p className="text-base">
                {user?.createdAt && new Date(user.createdAt).toLocaleDateString('uk-UA')}
              </p>
            </div>

            <div>
              <p className="text-base text-gray-600">Остання зміна</p>
              <p className="text-base">
                {user?.updatedAt && new Date(user.updatedAt).toLocaleDateString('uk-UA')}
              </p>
            </div>

            {/* Test Sections */}
            <hr className="my-4" />
            
            {testAccess.length === 0 ? (
              <div className="bg-gray-50 p-4 rounded-lg text-base text-gray-600">
                <p className="font-semibold">Статус тесту</p>
                <p className="mt-2">Користувач не має доступу до тестів</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-base font-semibold text-gray-900 mb-2">{testAccess[0].testTitle}</p>
                  <p className="text-xs text-gray-600 mb-3">{testAccess[0].testPrice} грн</p>

                  {accessUpdateError && (
                    <div className="bg-red-50 text-red-700 p-2 rounded text-xs mb-3">
                      {accessUpdateError}
                    </div>
                  )}

                  {resetError && (
                    <div className="bg-red-50 text-red-700 p-2 rounded text-xs mb-3">
                      {resetError}
                    </div>
                  )}

                  {resetSuccess && (
                    <div className="bg-green-50 text-green-700 p-2 rounded text-xs mb-3">
                      ✓ Результати скинуто
                    </div>
                  )}

                  {/* Payment Status */}
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Оплата
                    </label>
                    <select
                      value={paymentStatus}
                      onChange={(e) => handleUpdateTestAccess(e.target.value, e.target.value === 'success')}
                      disabled={isUpdatingAccess}
                      className="w-full px-2 py-2 border border-gray-300 rounded text-base focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50"
                    >
                      <option value="unpaid">Не оплачено</option>
                      <option value="success">Оплачено</option>
                      <option value="pending">В обробці</option>
                    </select>
                    {testAccess[0].paymentCompletedAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        Дата оплати: {new Date(testAccess[0].paymentCompletedAt).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                    {testAccess[0].testCompletedAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        Дата проходження тесту: {new Date(testAccess[0].testCompletedAt).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>

                  {isUpdatingAccess && (
                    <p className="text-xs text-gray-500 mt-2">Оновлення...</p>
                  )}

                  <hr className="my-4" />

                  {/* View Test Answers */}
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-700 mb-2">Перегляд відповідей</p>
                    {testAccess[0].hasResults ? (
                      <Link
                        href={`/admin/users/${userId}/test-answers/${testAccess[0].testId}`}
                        className="block w-full px-2 py-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition font-semibold text-center no-underline hover:no-underline"
                      >
                        Переглянути відповіді
                      </Link>
                    ) : (
                      <button
                        disabled
                        className="w-full px-2 py-2 bg-gray-300 text-gray-500 text-xs rounded font-semibold cursor-not-allowed"
                      >
                        Переглянути відповіді
                      </button>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {testAccess[0].hasResults 
                        ? 'Переглянути всі відповіді користувача по модулям'
                        : 'Користувач ще не проходив тестування'}
                    </p>
                  </div>

                  <hr className="my-4" />

                  {/* Reset Test Results */}
                  <div>
                    <p className="text-xs font-medium text-gray-700 mb-2">Скидання результатів</p>
                    {testAccess[0].hasResults || testAccess[0].paymentStatus === 'success' ? (
                      <>
                        <button
                          onClick={handleResetTestResults}
                          disabled={isResettingResults}
                          className="w-full px-2 py-2 bg-orange-600 text-white text-xs rounded hover:bg-orange-700 transition disabled:opacity-50 font-semibold"
                        >
                          {isResettingResults ? 'Скидання...' : 'Скинути результати та оплату'}
                        </button>
                        <p className="text-xs text-gray-500 mt-1">Видалить результати і дозволить пройти тест заново</p>
                      </>
                    ) : (
                      <>
                        <button
                          disabled
                          className="w-full px-2 py-2 bg-gray-300 text-gray-500 text-xs rounded font-semibold cursor-not-allowed"
                        >
                          Скинути результати та оплату
                        </button>
                        <p className="text-xs text-gray-500 mt-1">Немає результатів або оплати для скидання</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center px-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Видалити акаунт?</h3>
                <p className="text-base text-gray-500 mt-0.5">Цю дію неможливо скасувати</p>
              </div>
            </div>

            <p className="text-base text-gray-600 mb-2">
              Буде безповоротно видалено акаунт <strong className="text-gray-900">{user?.fullName}</strong> ({user?.email}) та всі пов'язані дані:
            </p>
            <ul className="text-base text-gray-500 list-disc list-inside mb-6 space-y-1">
              <li>Результати тестування</li>
              <li>Дані про оплати</li>
              <li>Доступи до тестів</li>
            </ul>

            {deleteError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-base text-red-700">
                {deleteError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleDeleteUser}
                disabled={isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-2.5 px-4 rounded-lg transition flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Видалення...</span>
                  </>
                ) : (
                  <span>Так, видалити</span>
                )}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2.5 px-4 rounded-lg transition disabled:opacity-50"
              >
                Скасувати
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
