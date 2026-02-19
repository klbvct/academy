import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, getTokenFromHeader } from '@/lib/jwt'

export async function GET(
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
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const userId = decoded.userId
    const testId = parseInt(params.id)

    const testResult = await prisma.testResult.findFirst({
      where: {
        userId,
        testId,
      },
      include: {
        user: true,
      },
    })

    if (!testResult) {
      return NextResponse.json({ error: 'Test result not found' }, { status: 404 })
    }

    // Проверяем оплачены ли результаты
    const resultPayment = await prisma.payment.findFirst({
      where: {
        userId,
        testId,
        type: 'results',
        status: 'success',
      },
    })

    const isResultsPaid = !!resultPayment

    return NextResponse.json({
      success: true,
      isResultsPaid: isResultsPaid,
      user: {
        name: testResult.user?.fullName || 'Користувач',
        birthdate: testResult.user?.birthDate || null,
        email: testResult.user?.email || null,
      },
      data: {
        scores: testResult.scores ? JSON.parse(testResult.scores) : {},
        completedAt: testResult.completedAt,
        answers: testResult.data ? JSON.parse(testResult.data) : {},
        recommendations: testResult.recommendations,
        score: testResult.scores ? calculateTotalScore(JSON.parse(testResult.scores)) : 0,
      },
    })
  } catch (error) {
    console.error('Error fetching results:', error)
    return NextResponse.json(
      { error: 'Failed to fetch results' },
      { status: 500 }
    )
  }
}

function calculateTotalScore(scores: Record<string, any>): number {
  const values = Object.values(scores).filter((v) => typeof v === 'number')
  if (values.length === 0) return 0
  const sum = values.reduce((a, b) => (a as number) + (b as number), 0)
  return Math.round((sum as number) / values.length)
}
