import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, getTokenFromHeader } from '@/lib/jwt'

// GET - получить информацию о платежах пользователя
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const admin = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        isActive: true,
      },
    })

    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Адміністратор не знайдений' },
        { status: 403 }
      )
    }

    if (!admin.isActive) {
      return NextResponse.json(
        { success: false, message: 'Ваш акаунт заблокирован' },
        { status: 403 }
      )
    }

    const userId = parseInt(params.id)

    // Получаем информацию о платежах и доступе к тестам
    const payments = await prisma.payment.findMany({
      where: { userId },
      select: {
        id: true,
        orderId: true,
        amount: true,
        status: true,
        description: true,
        createdAt: true,
        completedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    const testAccess = await prisma.testAccess.findMany({
      where: { userId },
      select: {
        id: true,
        testId: true,
        hasAccess: true,
        accessGrantedAt: true,
        test: {
          select: {
            id: true,
            title: true,
            price: true,
          },
        },
        payment: {
          select: {
            status: true,
            completedAt: true,
          },
        },
      },
    })

    // Форматируем ответ
    const formattedTestAccess = testAccess.map(access => ({
      id: access.id,
      testId: access.testId,
      testTitle: access.test.title,
      testPrice: access.test.price,
      hasAccess: access.hasAccess,
      accessGrantedAt: access.accessGrantedAt,
      paymentStatus: access.payment?.status || 'unpaid',
      paymentCompletedAt: access.payment?.completedAt,
    }))

    return NextResponse.json({
      success: true,
      payments,
      testAccess: formattedTestAccess,
    })
  } catch (error) {
    console.error('Get user payments error:', error)
    return NextResponse.json(
      { success: false, message: 'Помилка на сервері' },
      { status: 500 }
    )
  }
}

// PATCH - обновить статус доступа и платежа
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const admin = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        isActive: true,
      },
    })

    if (!admin || !admin.isActive) {
      return NextResponse.json(
        { success: false, message: 'Доступ запрещен' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { testId, paymentStatus, hasAccess } = body
    const userId = parseInt(params.id)

    if (!testId) {
      return NextResponse.json(
        { success: false, message: 'testId є обов\'язковим' },
        { status: 400 }
      )
    }

    // Обновляем или создаем платеж
    let paymentId: number | null = null

    // Ищем существующий платеж для этого пользователя
    let existingPayment = await prisma.payment.findFirst({
      where: {
        userId,
      },
      select: { id: true },
    })

    if (paymentStatus === 'success') {
      // Если платежа нет, создаем новый
      if (!existingPayment) {
        const newPayment = await prisma.payment.create({
          data: {
            userId,
            orderId: `ORDER_${userId}_${testId}_${Date.now()}`,
            amount: 0,
            status: 'success',
            completedAt: new Date(),
          },
        })
        paymentId = newPayment.id
      } else {
        // Обновляем существующий платеж на success
        await prisma.payment.update({
          where: { id: existingPayment.id },
          data: {
            status: 'success',
            completedAt: new Date(),
          },
        })
        paymentId = existingPayment.id
      }
    } else if (paymentStatus === 'unpaid' && existingPayment) {
      // Обновляем существующий платеж на unpaid
      await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          status: 'unpaid',
          completedAt: null,
        },
      })
      paymentId = existingPayment.id
    } else if (paymentStatus === 'pending' && existingPayment) {
      // Обновляем существующий платеж на pending
      await prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          status: 'pending',
        },
      })
      paymentId = existingPayment.id
    }

    // Обновляем или создаем доступ к тесту
    const testAccessData: any = {
      hasAccess,
    }

    if (hasAccess) {
      testAccessData.accessGrantedAt = new Date()
    }

    if (paymentId) {
      testAccessData.paymentId = paymentId
    }

    const updatedAccess = await prisma.testAccess.upsert({
      where: {
        userId_testId: {
          userId,
          testId,
        },
      },
      update: testAccessData,
      create: {
        userId,
        testId,
        ...testAccessData,
      },
      select: {
        id: true,
        testId: true,
        hasAccess: true,
        accessGrantedAt: true,
        test: {
          select: {
            title: true,
            price: true,
          },
        },
        payment: {
          select: {
            status: true,
            completedAt: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      testAccess: {
        id: updatedAccess.id,
        testId: updatedAccess.testId,
        testTitle: updatedAccess.test.title,
        testPrice: updatedAccess.test.price,
        hasAccess: updatedAccess.hasAccess,
        accessGrantedAt: updatedAccess.accessGrantedAt,
        paymentStatus: paymentStatus,
      },
    })
  } catch (error) {
    console.error('Update payment error:', error)
    return NextResponse.json(
      { success: false, message: 'Помилка на сервері' },
      { status: 500 }
    )
  }
}
