import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, getTokenFromHeader } from '@/lib/jwt'
import { getLiqPayInstance } from '@/lib/liqpay'

// POST - создать платеж на LiqPay
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
    const existingAccess = await prisma.testAccess.findFirst({
      where: {
        userId: decoded.userId,
        testId: testId,
      },
    })

    if (existingAccess?.hasAccess) {
      return NextResponse.json(
        { success: false, message: 'У вас вже є доступ до цього тесту' },
        { status: 400 }
      )
    }

    // Получаем данные пользователя
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        fullName: true,
        email: true,
        phone: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Користувач не знайдений' },
        { status: 404 }
      )
    }

    // Создаем платеж в БД со статусом pending
    const orderId = `ORDER_${decoded.userId}_${testId}_${Date.now()}`
    
    const payment = await prisma.payment.create({
      data: {
        userId: decoded.userId,
        testId: testId,
        orderId: orderId,
        amount: test.price || 0,
        currency: 'UAH',
        type: 'access',
        description: `Платеж за тест: ${test.title}`,
        status: 'pending',
      },
    })

    // Генерируем платежную ссылку через LiqPay
    const liqpay = getLiqPayInstance()
    
    // Получаем базовый URL (для локального тестирования и production)
    const protocol = request.headers.get('x-forwarded-proto') || 'http'
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:3000'
    const baseUrl = `${protocol}://${host}`

    const checkoutUrl = liqpay.generateCheckoutLink({
      amount: payment.amount,
      orderId: payment.orderId,
      description: payment.description || `Тест`,
      resultUrl: `${baseUrl}/dashboard`,
      serverUrl: `${baseUrl}/api/liqpay/callback`,
      customerFirstName: user.fullName.split(' ')[0],
      customerPhone: user.phone || undefined,
      customerEmail: user.email,
    })

    return NextResponse.json({
      success: true,
      checkoutUrl: checkoutUrl,
      orderId: payment.orderId,
    })
  } catch (error) {
    console.error('LiqPay checkout error:', error)
    return NextResponse.json(
      { success: false, message: 'Помилка при створенні платежу' },
      { status: 500 }
    )
  }
}
