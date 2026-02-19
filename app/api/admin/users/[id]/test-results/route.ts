import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, getTokenFromHeader } from '@/lib/jwt'

interface TestResult {
  id: number
  userId: number
  testId: number
  data: string | null
  completedAt: Date | null
  test: {
    id: number
    title: string
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify admin token
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ message: 'Не авторизовано' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ message: 'Доступ заборонено' }, { status: 403 })
    }

    const userId = parseInt(params.id)
    
    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
      }
    })

    if (!user) {
      return NextResponse.json({ message: 'Користувача не знайдено' }, { status: 404 })
    }

    // Get test results
    const results = await prisma.testResult.findMany({
      where: { userId },
      include: {
        test: {
          select: {
            id: true,
            title: true,
          }
        }
      }
    })

    // Parse and format results
    const formattedResults = results.map((result: TestResult) => {
      let parsedData = {}
      try {
        parsedData = result.data ? JSON.parse(result.data) : {}
      } catch (e) {
        console.error('Error parsing test data:', e)
      }

      // Check if recommendations have been generated
      const hasRecommendations = !!(result as any).recommendations && 
        (result as any).recommendations !== 'Рекомендації недоступні'

      return {
        testId: result.testId,
        testTitle: result.test.title,
        data: parsedData,
        completedAt: result.completedAt,
        hasRecommendations,
      }
    })

    return NextResponse.json({ 
      user,
      results: formattedResults,
    })
  } catch (error) {
    console.error('Error fetching test results:', error)
    return NextResponse.json({ message: 'Помилка сервера' }, { status: 500 })
  }
}
