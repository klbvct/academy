import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, getTokenFromHeader } from '@/lib/jwt'

// GET - получить все доступные тесты и статус оплаты текущего пользователя
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

    // Получаем все тесты с информацией о доступе текущего пользователя
    const tests = await prisma.test.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        duration: true,
        questionsCount: true,
        access: {
          where: {
            userId: decoded.userId,
          },
          select: {
            hasAccess: true,
            payment: {
              select: {
                status: true,
                completedAt: true,
              },
            },
          },
        },
      },
    })

    // Форматируем ответ
    const formattedTests = tests.map(test => {
      const userAccess = test.access[0]
      const isPaid = userAccess?.payment?.status === 'success'
      
      return {
        id: test.id,
        title: test.title,
        description: test.description,
        price: test.price || 0,
        duration: test.duration,
        questionsCount: test.questionsCount,
        hasAccess: userAccess?.hasAccess || false,
        isPaid: isPaid,
        paymentStatus: userAccess?.payment?.status || 'unpaid',
      }
    })

    return NextResponse.json({
      success: true,
      tests: formattedTests,
    })
  } catch (error) {
    console.error('Get tests error:', error)
    return NextResponse.json(
      { success: false, message: 'Помилка на сервері' },
      { status: 500 }
    )
  }
}
