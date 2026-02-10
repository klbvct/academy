'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface User {
  id: number
  fullName: string
  email: string
  birthDate?: string
  phone?: string
  role: string
  isActive: boolean
  createdAt: string
}

export default function AdminPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState<number | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch('/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) {
          throw new Error('Помилка завантаження користувачів')
        }

        const data = await response.json()
        setUsers(data.users)
      } catch (err) {
        setError('Помилка завантаження даних')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const handleToggleStatus = async (userId: number, currentStatus: boolean) => {
    setUpdating(userId)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      if (!response.ok) {
        throw new Error('Помилка при оновленні')
      }

      // Оновляємо статус у списку
      setUsers(users.map(u => (u.id === userId ? { ...u, isActive: !currentStatus } : u)))
    } catch (err) {
      console.error('Error toggling status:', err)
    } finally {
      setUpdating(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('uk-UA')
  }

  if (isLoading) {
    return <div className="text-center text-gray-600 py-8">Завантаження...</div>
  }

  if (error) {
    return <div className="text-center text-red-600 py-8">{error}</div>
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Користувачі</h1>
        <p className="text-gray-600 mt-2">Всього користувачів: <span className="font-bold text-lg">{users.length}</span></p>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Ім'я</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Телефон</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Роль</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Статус</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Дата реєстрації</th>
                {/* <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Дія</th> */}
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    Немає користувачів
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr 
                    key={user.id} 
                    onClick={() => router.push(`/admin/users/${user.id}`)}
                    className="border-b border-gray-200 hover:bg-blue-50 cursor-pointer transition"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{user.fullName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.phone || '—'}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'admin'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role === 'admin' ? 'Адмін' : 'User'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.isActive ? 'Активний' : 'Блокований'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(user.createdAt)}
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
