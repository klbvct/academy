import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, getTokenFromHeader } from '@/lib/jwt'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = getTokenFromHeader(authHeader)

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const userId = decoded.userId
    const { testId, module, answers } = await request.json()

    // Перевірити, чи користувач має доступ до цього тесту
    const testAccess = await prisma.testAccess.findFirst({
      where: {
        userId,
        testId: parseInt(testId),
      },
    })

    if (!testAccess || !testAccess.hasAccess) {
      return NextResponse.json({ error: 'No access to this test' }, { status: 403 })
    }

    // Знайти або створити результат тесту
    let testResult = await prisma.testResult.findFirst({
      where: {
        userId,
        testId: parseInt(testId),
      },
    })

    if (!testResult) {
      testResult = await prisma.testResult.create({
        data: {
          userId,
          testId: parseInt(testId),
          data: JSON.stringify({}),
        },
      })
    }

    // Оновити дані модуля
    const currentData = JSON.parse(testResult.data || '{}')
    currentData[`module${module}`] = answers

    await prisma.testResult.update({
      where: {
        id: testResult.id,
      },
      data: {
        data: JSON.stringify(currentData),
      },
    })

    return NextResponse.json({
      success: true,
      message: `Модуль ${module} збережено`,
    })
  } catch (error) {
    console.error('Error saving answers:', error)
    return NextResponse.json(
      { error: 'Failed to save answers' },
      { status: 500 }
    )
  }
}
