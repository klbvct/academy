import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, getTokenFromHeader } from '@/lib/jwt'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const testId = parseInt(params.id)
    const token = getTokenFromHeader(req.headers.get('Authorization'))

    if (!token) {
      return NextResponse.json({ success: false, message: 'Не авторизований' }, { status: 401 })
    }

    // Проверить токен
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'Невалідний токен' }, { status: 401 })
    }
    const userId = decoded.userId

    // Получить результат теста
    const testResult = await prisma.testResult.findFirst({
      where: {
        userId: userId,
        testId: testId,
      },
    })

    if (!testResult) {
      return NextResponse.json({
        success: true,
        lastCompletedModule: 0,
      })
    }

    // Парсим JSON данные и находим последний заполненный модуль
    let lastCompletedModule = 0
    try {
      const data = JSON.parse(testResult.data || '{}')
      // Ищем все модули в формате module1, module2, etc
      const moduleMatches = Object.keys(data).filter(key => key.startsWith('module'))
      if (moduleMatches.length > 0) {
        const moduleNumbers = moduleMatches.map(key => 
          parseInt(key.replace('module', ''))
        )
        lastCompletedModule = Math.max(...moduleNumbers)
      }
    } catch (err) {
      console.log('Could not parse test data')
    }

    return NextResponse.json({
      success: true,
      lastCompletedModule: lastCompletedModule,
    })
  } catch (error) {
    console.error('Error getting test progress:', error)
    return NextResponse.json(
      { success: false, message: 'Помилка сервера' },
      { status: 500 }
    )
  }
}
