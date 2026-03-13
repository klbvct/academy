import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyTokenAndUser, getTokenFromRequest } from '@/lib/jwt'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = getTokenFromRequest(request)

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await verifyTokenAndUser(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token or account blocked' }, { status: 401 })
    }

    const userId = user.id
    const testId = parseInt(params.id)

    // Перевіряємо що користувач має доступ і завершив тест
    const testAccess = await prisma.testAccess.findFirst({
      where: { userId, testId },
    })

    if (!testAccess || !testAccess.hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

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

    return NextResponse.json({
      success: true,
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
