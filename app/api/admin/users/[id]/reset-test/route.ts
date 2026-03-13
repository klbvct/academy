import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, getTokenFromRequest } from '@/lib/jwt'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = getTokenFromRequest(request)

    if (!token) {
      return NextResponse.json({ error: 'Не авторизовано' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Доступ заборонено' }, { status: 403 })
    }

    const userId = parseInt(params.id)
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Невалідний ID користувача' }, { status: 400 })
    }
    const { testId } = await request.json()

    if (!testId) {
      return NextResponse.json({ error: 'testId є обов\'язковим' }, { status: 400 })
    }

    // Удаляем результаты теста
    await prisma.testResult.deleteMany({
      where: {
        userId,
        testId: parseInt(testId),
      },
    })

    // Удаляем платежи для этого теста (access и results)
    await prisma.payment.deleteMany({
      where: {
        userId,
        testId: parseInt(testId),
      },
    })

    // Сбрасываем доступ к тесту (hasAccess = false)
    await prisma.testAccess.updateMany({
      where: {
        userId,
        testId: parseInt(testId),
      },
      data: {
        hasAccess: false,
        accessGrantedAt: null,
        paymentId: null,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Результати, оплату та доступ до тесту успішно скинуто',
    })
  } catch (error) {
    console.error('Error resetting test:', error)
    return NextResponse.json(
      { error: 'Помилка при скиданні тесту' },
      { status: 500 }
    )
  }
}
