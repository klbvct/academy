'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [isLoading, setIsLoading] = useState(false)
  const [isValidating, setIsValidating] = useState(true)
  const [isValidToken, setIsValidToken] = useState(false)
  const [userName, setUserName] = useState('')
  const [error, setError] = useState('')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  // Проверяем валидность токена при загрузке
  useEffect(() => {
    if (!token) {
      setError('Невалідне посилання для відновлення пароля')
      setIsValidating(false)
      return
    }

    const validateToken = async () => {
      try {
        const response = await fetch(`/api/auth/reset-password?token=${token}`)
        const data = await response.json()

        if (response.ok && data.success) {
          setIsValidToken(true)
          setUserName(data.userName || '')
        } else {
          setError(data.message || 'Невалідне або закінчене посилання для відновлення пароля')
        }
      } catch (err) {
        setError('Помилка при перевірці посилання')
      } finally {
        setIsValidating(false)
      }
    }

    validateToken()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')

    // Валидация
    if (!password || !confirmPassword) {
      setPasswordError('Будь ласка, заповніть всі поля')
      return
    }

    if (password !== confirmPassword) {
      setPasswordError('Паролі не збігаються')
      return
    }

    if (password.length < 6) {
      setPasswordError('Пароль повинен бути не менше 6 символів')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password,
          confirmPassword,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Сохраняем токен и перенаправляем в кабинет
        localStorage.setItem('token', data.token)
        setIsSuccess(true)

        // Перенаправляем через 2 секунды
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } else {
        setPasswordError(data.message || 'Ошибка при изменении пароля')
      }
    } catch (err) {
      setPasswordError('Помилка підключення до сервера')
    } finally {
      setIsLoading(false)
    }
  }

  if (isValidating) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-600">Перевірка посилання...</p>
        </main>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-1 max-w-md w-full mx-auto py-12 px-4">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold text-center text-gray-900 mb-4">Помилка</h1>
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
              <p className="text-red-800">{error}</p>
            </div>
            <div className="text-center">
              <Link href="/forgot-password" className="text-blue-600 hover:text-blue-700 font-medium">
                Спробувати ще раз
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!isValidToken) {
    return null // Показываем error выше
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-1 max-w-md w-full mx-auto py-12 px-4 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="mb-4">
              <p className="text-4xl">✅</p>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Готово!</h1>
            <p className="text-gray-600 mb-4">
              Ваш пароль успішно змінен.
            </p>
            <p className="text-gray-600 text-sm">
              Ви будете перенаправлені в кабінет...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-md w-full mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
            Встановити новий пароль
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Привіт, {userName}! Введіть новий пароль для вашого облікового запису.
          </p>

          {passwordError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{passwordError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Новий пароль
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
              <p className="text-xs text-gray-500 mt-1">Мінімум 6 символів</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Підтвердіть пароль
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !password || !confirmPassword}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
            >
              {isLoading ? 'Збереження...' : 'Встановити новий пароль'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Повернутись на вхід
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
