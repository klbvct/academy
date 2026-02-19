import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, getTokenFromHeader } from '@/lib/jwt'

// GET - get full test result for any user (admin only, no payment check)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; testId: string } }
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
    const testId = parseInt(params.testId)

    const testResult = await prisma.testResult.findFirst({
      where: { userId, testId },
      include: { user: true },
    })

    if (!testResult) {
      return NextResponse.json({ error: 'Test result not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      isResultsPaid: true, // Admin can always see results
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
        score: 0,
      },
    })
  } catch (error) {
    console.error('Error fetching admin test report:', error)
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 })
  }
}
