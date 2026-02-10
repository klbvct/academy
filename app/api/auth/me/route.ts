import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, getTokenFromHeader } from '@/lib/jwt'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    const token = getTokenFromHeader(authHeader)

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Токен не знайдений' },
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

    // Отримуємо користувача з БД
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        birthDate: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Користувач не знайдений' },
        { status: 401 }
      )
    }

    // Перевіряємо, чи користувач активний
    if (!user.isActive) {
      return NextResponse.json(
        { success: false, message: 'Ваш акаунт заблокований' },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error) {
    console.error('Get current user error:', error)
    return NextResponse.json(
      { success: false, message: 'Помилка сервера' },
      { status: 500 }
    )
  }
}
