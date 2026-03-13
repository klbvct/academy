/**
 * API Endpoint: Generate AI Career Recommendations
 * POST /api/tests/[id]/generate-recommendations
 * 
 * Generates personalized career path recommendations using Gemini AI
 * based on completed test modules (1-8).
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, getTokenFromRequest } from '@/lib/jwt'
import { generateCareerRecommendations } from '@/lib/gemini'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Authenticate user
    const token = getTokenFromRequest(request)

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const userId = decoded.userId
    const testId = parseInt(params.id)

    // 2. Fetch test result
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
      return NextResponse.json(
        { error: 'Test result not found' },
        { status: 404 }
      )
    }

    // 3. Check if test is completed
    if (!testResult.completedAt) {
      return NextResponse.json(
        { 
          error: 'Test not completed',
          message: 'Завершіть всі модулі тестування перед генерацією рекомендацій' 
        },
        { status: 400 }
      )
    }

    // 4. Parse scores
    const scores = testResult.scores ? JSON.parse(testResult.scores) : {}

    // 5. Validate that enough modules are completed
    const hasModule1 = scores.m1_nature !== undefined
    const hasModule2 = scores.m2_naturalScience !== undefined
    const hasModule3 = scores.m3_artistic !== undefined
    const hasModule5 = scores.m5_linguistic !== undefined
    const hasModule7 = scores.m7_r !== undefined

    if (!hasModule1 || !hasModule2 || !hasModule3) {
      return NextResponse.json(
        {
          error: 'Insufficient data',
          message: 'Необхідно завершити хоча б модулі 1, 2 та 3 для генерації рекомендацій'
        },
        { status: 400 }
      )
    }

    // 6. Generate recommendations using Gemini AI
    console.log(`🤖 Generating recommendations for test ${testId}, user ${userId}...`)
    console.log(`📊 Scores keys: ${Object.keys(scores).join(', ')}`)
    
    const recommendations = await generateCareerRecommendations(
      scores,
      testResult.user?.fullName || undefined
    )

    console.log(`🤖 Gemini response type:`, typeof recommendations)
    console.log(`🤖 Gemini response:`, recommendations)

    if (!recommendations) {
      console.error(`❌ No recommendations returned from Gemini`)
      return NextResponse.json(
        {
          error: 'AI service unavailable',
          message: 'Не вдалося згенерувати рекомендації. Спробуйте пізніше або зверніться до адміністратора.'
        },
        { status: 503 }
      )
    }

    // 7. Save recommendations to database
    await prisma.testResult.update({
      where: { id: testResult.id },
      data: {
        recommendations: JSON.stringify(recommendations),
      },
    })

    console.log(`✅ Recommendations generated and saved for test ${testId}`)

    // 8. Return recommendations
    return NextResponse.json({
      success: true,
      data: recommendations,
      message: 'Рекомендації успішно згенеровані',
    })

  } catch (error) {
    console.error('❌ Error generating recommendations:', error)
    
    // Handle specific error types
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          error: 'Invalid AI response',
          message: 'Отримано некоректну відповідь від AI. Спробуйте ще раз.'
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'Виникла помилка при генерації рекомендацій'
      },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint to check if recommendations exist
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = getTokenFromRequest(request)

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
      select: {
        id: true,
        recommendations: true,
        completedAt: true,
      },
    })

    if (!testResult) {
      return NextResponse.json({ error: 'Test result not found' }, { status: 404 })
    }

    const hasRecommendations = !!testResult.recommendations && 
      testResult.recommendations !== 'Рекомендації недоступні'

    let recommendationsData = null
    if (hasRecommendations && testResult.recommendations) {
      try {
        recommendationsData = JSON.parse(testResult.recommendations)
      } catch {
        recommendationsData = testResult.recommendations
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        hasRecommendations,
        recommendations: recommendationsData,
        isCompleted: !!testResult.completedAt,
      }
    })

  } catch (error) {
    console.error('Error checking recommendations:', error)
    return NextResponse.json(
      { error: 'Failed to check recommendations' },
      { status: 500 }
    )
  }
}
