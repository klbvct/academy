import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, getTokenFromHeader } from '@/lib/jwt'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = getTokenFromHeader(authHeader)

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const userId = parseInt(params.id)
    const { testId } = await request.json()

    if (!testId) {
      return NextResponse.json({ error: 'testId is required' }, { status: 400 })
    }

    // Удаляем результаты теста
    await prisma.testResult.deleteMany({
      where: {
        userId,
        testId: parseInt(testId),
      },
    })

    // Удаляем платежи для результатов этого теста
    await prisma.payment.deleteMany({
      where: {
        userId,
        testId: parseInt(testId),
        type: 'results',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Результаты теста успешно сброшены',
    })
  } catch (error) {
    console.error('Error resetting test:', error)
    return NextResponse.json(
      { error: 'Failed to reset test' },
      { status: 500 }
    )
  }
}
