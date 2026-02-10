import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, getTokenFromHeader } from '@/lib/jwt'
import crypto from 'crypto'

// POST - создать платеж для тестирования
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { testId } = body

    if (!testId) {
      return NextResponse.json(
        { success: false, message: 'testId є обов\'язковим' },
        { status: 400 }
      )
    }

    // Проверяем существует ли тест
    const test = await prisma.test.findUnique({
      where: { id: testId },
    })

    if (!test) {
      return NextResponse.json(
        { success: false, message: 'Тест не знайдений' },
        { status: 404 }
      )
    }

    // Проверяем есть ли уже доступ
    const existingAccess = await prisma.testAccess.findUnique({
      where: {
        userId_testId: {
          userId: decoded.userId,
          testId: testId,
        },
      },
    })

    if (existingAccess?.hasAccess) {
      return NextResponse.json(
        { success: false, message: 'У вас вже є доступ до цього тесту' },
        { status: 400 }
      )
    }

    // Создаем платеж
    const orderId = `ORDER_${decoded.userId}_${testId}_${Date.now()}`
    
    const payment = await prisma.payment.create({
      data: {
        userId: decoded.userId,
        orderId: orderId,
        amount: test.price || 0,
        currency: 'UAH',
        description: `Платеж за тест: ${test.title}`,
        status: 'success', // Для демонстрации сразу успешный платеж
      },
    })

    // Обновляем доступ к тесту (upsert - создает или обновляет)
    const testAccess = await prisma.testAccess.upsert({
      where: {
        userId_testId: {
          userId: decoded.userId,
          testId: testId,
        },
      },
      update: {
        paymentId: payment.id,
        hasAccess: true,
        accessGrantedAt: new Date(),
      },
      create: {
        userId: decoded.userId,
        testId: testId,
        paymentId: payment.id,
        hasAccess: true,
        accessGrantedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        orderId: payment.orderId,
        status: payment.status,
      },
      testAccess: {
        hasAccess: testAccess.hasAccess,
        accessGrantedAt: testAccess.accessGrantedAt,
      },
    })
  } catch (error) {
    console.error('Create payment error:', error)
    return NextResponse.json(
      { success: false, message: 'Помилка на сервері' },
      { status: 500 }
    )
  }
}
