import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, getTokenFromHeader } from '@/lib/jwt'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = getTokenFromHeader(authHeader)

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Не авторизовано' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Невалідний токен' },
        { status: 401 }
      )
    }

    // Проверяем, является ли пользователь администратором
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    })

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Доступ запрещен' },
        { status: 403 }
      )
    }

    // Проверяем, не заблокирован ли администратор
    if (!user.isActive) {
      return NextResponse.json(
        { success: false, message: 'Ваш акаунт заблокирован' },
        { status: 403 }
      )
    }

    // Получаем список всех пользователей (без паролей)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        birthDate: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(
      { success: true, users },
      { status: 200 }
    )
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { success: false, message: 'Помилка на сервері' },
      { status: 500 }
    )
  }
}
