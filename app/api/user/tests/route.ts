import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, getTokenFromHeader } from '@/lib/jwt'

// GET - получить все доступные тесты и статус оплаты текущего пользователя
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = getTokenFromHeader(authHeader)

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Не авторизовано' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Невалідний токен' },
        { status: 401 }
      )
    }

    // Получаем все тесты с результатами
    const tests = await prisma.test.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        duration: true,
        questionsCount: true,
        results: {
          where: {
            userId: decoded.userId,
          },
          select: {
            completedAt: true,
            scores: true,
            recommendations: true,
          },
        },
        access: {
          where: {
            userId: decoded.userId,
          },
          select: {
            hasAccess: true,
          },
        },
      },
    })

    // Получаем платежи для результатов
    const payments = await prisma.payment.findMany({
      where: {
        userId: decoded.userId,
        type: 'results',
      },
      select: {
        id: true,
        testId: true,
        status: true,
      },
    })

    // Форматируем ответ
    const formattedTests = tests.map(test => {
      const testResult = test.results[0]
      const isCompleted = testResult?.completedAt !== null && testResult?.completedAt !== undefined
      const resultsPaid = isCompleted && payments.some(p => p.testId === test.id && p.status === 'success')
      const hasAccess = test.access[0]?.hasAccess ?? true // По умолчанию доступ есть
      
      // Получаем scores и recommendations для завершенных тестов
      let scores = null
      let recommendations = null
      
      if (isCompleted && resultsPaid && testResult) {
        // Парсим scores если они есть
        if (testResult.scores) {
          try {
            scores = JSON.parse(testResult.scores)
          } catch (e) {
            scores = null
          }
        }
        // Рекомендации уже строка
        recommendations = testResult.recommendations
      }
      
      return {
        id: test.id,
        title: test.title,
        description: test.description,
        price: test.price || 0,
        duration: test.duration,
        questionsCount: test.questionsCount,
        hasAccess: hasAccess,
        isCompleted: isCompleted,
        resultsPaid: resultsPaid,
        completedAt: testResult?.completedAt,
        scores: scores,
        recommendations: recommendations,
      }
    })

    return NextResponse.json({
      success: true,
      tests: formattedTests,
    })
  } catch (error) {
    console.error('Get tests error:', error)
    return NextResponse.json(
      { success: false, message: 'Помилка на сервері' },
      { status: 500 }
    )
  }
}
