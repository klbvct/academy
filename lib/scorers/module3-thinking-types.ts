/**
 * Модуль 3: Thinking Types
 * Обрабатывает 6 типов мышления (без intuitive)
 */

import { Module3ThinkingTypes } from '@/lib/interpretations/module-3-thinking-types'

export interface Module3Scores {
  m3_artistic: {
    percentageExample: number
  }
  m3_theoretical: {
    percentageExample: number
  }
  m3_practical: {
    percentageExample: number
  }
  m3_creative: {
    percentageExample: number
  }
  m3_convergent: {
    percentageExample: number
  }
  m3_analytical: {
    percentageExample: number
  }
}

const scoringKeys = Module3ThinkingTypes.scoringKeys

const thinkingTypes: (keyof Module3Scores)[] = [
  'm3_theoretical',
  'm3_artistic',
  'm3_practical',
  'm3_creative',
  'm3_convergent',
  'm3_analytical',
]

export function calculateModule3(data: Record<string, any>): Module3Scores {
  // Инициализируем счетчики для каждого типа мышления
  const rawScores: Record<string, number> = {
    theoretical: 0,
    artistic: 0,
    practical: 0,
    creative: 0,
    convergent: 0,
    analytical: 0,
  }

  // Проходим по всем ответам
  Object.entries(data).forEach(([questionKey, answer]) => {
    // Извлекаем номер вопроса из ключа (например, "q1" -> 1)
    const questionNum = parseInt(questionKey.replace('q', ''))
    
    if (!answer || isNaN(questionNum)) return

    // Находим все типы мышления, к которым относится этот вопрос с этим ответом
    Object.entries(scoringKeys).forEach(([thinkingType, mappings]) => {
      // Проверяем, есть ли совпадение вопроса и ответа
      const match = mappings.find((m: any) => m.q === questionNum && m.a === answer)
      if (match) {
        rawScores[thinkingType] = (rawScores[thinkingType] || 0) + 1
      }
    })
  })

  // Нормализуем баллы в проценты (0-100)
  const total = Object.values(rawScores).reduce((sum, score) => sum + score, 0)
  const normalizedScores: Record<string, number> = {}
  
  Object.entries(rawScores).forEach(([thinkingType, score]) => {
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0
    normalizedScores[thinkingType] = Math.max(0, Math.min(100, percentage))
  })

  // Формируем объект результат с префиксом m3_
  const result: Module3Scores = {} as Module3Scores
  thinkingTypes.forEach((name) => {
    const baseKey = name.replace('m3_', '')
    result[name] = {
      percentageExample: normalizedScores[baseKey] || 0,
    }
  })

  return result
}
