import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, getTokenFromHeader } from '@/lib/jwt'
import {
  calculateModule1,
  calculateModule2,
  calculateModule3,
  calculateModule4,
  calculateModule5,
  calculateModule6,
  calculateModule7,
  calculateModule8,
} from '@/lib/scorers'

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
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const userId = decoded.userId
    const testId = parseInt(params.id)

    // Перевірити, чи користувач має доступ до цього тесту
    const testAccess = await prisma.testAccess.findFirst({
      where: {
        userId,
        testId,
      },
    })

    if (!testAccess || !testAccess.hasAccess) {
      return NextResponse.json({ error: 'No access to this test' }, { status: 403 })
    }

    // Знайти результат тесту
    const testResult = await prisma.testResult.findFirst({
      where: {
        userId,
        testId,
      },
    })

    if (!testResult) {
      return NextResponse.json({ error: 'Test result not found' }, { status: 404 })
    }

    // Розрахувати результати
    const data = JSON.parse(testResult.data || '{}')
    const scores = calculateScores(data)

    // Отримати AI рекомендації від Gemini
    let recommendation = ''
    try {
      recommendation = await getGeminiRecommendation(scores)
    } catch (err) {
      console.error('Error getting Gemini recommendation:', err)
      recommendation = 'Не вдалося отримати рекомендацію'
    }

    // Оновити результат тесту
    const updatedResult = await prisma.testResult.update({
      where: {
        id: testResult.id,
      },
      data: {
        scores: JSON.stringify(scores),
        completedAt: new Date(),
        recommendations: recommendation,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Test completed successfully',
      testResults: updatedResult,
    })
  } catch (error) {
    console.error('Error completing test:', error)
    return NextResponse.json(
      { error: 'Failed to complete test' },
      { status: 500 }
    )
  }
}

function calculateScores(data: Record<string, any>) {
  const scores: Record<string, any> = {}

  // Модуль 1: Professional Vector - 5 типов
  if (data.module1) {
    const module1Data = calculateModule1(data.module1)
    Object.assign(scores, module1Data)
  }

  // Модуль 2: Interest/Abilities - 20 сфер
  if (data.module2) {
    const module2Data = calculateModule2(data.module2)
    Object.assign(scores, module2Data)
  }

  // Модуль 3: Thinking types - 7 типов
  if (data.module3) {
    const module3Data = calculateModule3(data.module3)
    Object.assign(scores, module3Data)
  }

  // Модуль 4: Life values (ranking)
  if (data.module4) {
    const module4Data = calculateModule4(data.module4)
    Object.assign(scores, module4Data)
  }

  // Модуль 5: Intelligences (Gardner) - 8 типов
  if (data.module5) {
    const module5Data = calculateModule5(data.module5)
    Object.assign(scores, module5Data)
  }

  // Модуль 6: Motivation Factors
  if (data.module6) {
    const module6Data = calculateModule6(data.module6)
    Object.assign(scores, module6Data)
  }

  // Модуль 7: Holland RIASEC - 6 типов
  if (data.module7) {
    const module7Data = calculateModule7(data.module7)
    Object.assign(scores, module7Data)
  }

  // Модуль 8: Perception Types - 4 канала
  if (data.module8) {
    const module8Data = calculateModule8(data.module8)
    Object.assign(scores, module8Data)
  }

  return scores
}



function calculateTotalScore(scores: Record<string, any>): number {
  const values = Object.values(scores).filter((v) => typeof v === 'number')
  if (values.length === 0) return 0
  return Math.round(values.reduce((a: number, b: number) => a + b, 0) / values.length)
}

async function getGeminiRecommendation(scores: Record<string, number>): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not set')
  }

  const prompt = `
На основі результатів професійного тесту надайте рекомендацію щодо вибору кар'єри:

Результати:
- Модель Климова: ${scores.klimov || 0}%
- Відсацільництво: ${scores.interests || 0}%
- Тип мислення: ${scores.thinking || 0}%
- Цінності: ${scores.values || 0}
- Інтелект (Gardner): ${scores.intelligences || 0}%
- Holland RIASEC: ${scores.holland || 0}%

Рекомендуйте профессійні напрямки та місцеві скажіть, у якому напрямі розвиватися користувачу. Відповідь на українській мові, коротко (2-3 абзаци).
  `

  const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    }),
  })

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`)
  }

  const data = await response.json()
  return (
    data?.candidates?.[0]?.content?.parts?.[0]?.text || 
    'Не вдалося отримати рекомендацію'
  )
}
