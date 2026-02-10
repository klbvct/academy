'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          router.push('/login')
          return
        }

        const response = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) {
          router.push('/login')
          return
        }

        const data = await response.json()
        if (data.user?.role === 'admin') {
          setIsAdmin(true)
        } else {
          router.push('/dashboard')
        }
      } catch (error) {
        console.error('Admin check error:', error)
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAdmin()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-600">Завантаження...</p>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-red-600">Доступ запрещен</p>
      </div>
    )
  }

  return (
    <div className="flex bg-gray-50">
      <AdminSidebar />
      <main className="ml-64 flex-1 min-h-screen">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
