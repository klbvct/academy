/**
 * Модуль 2: Individual Interests & Abilities
 * Обрабатывает 20 сфер интересов и способностей
 */

import { Module2Interests } from '@/lib/interpretations/module-2-interests'

export interface Module2Scores {
  m2_naturalScience: number
  m2_engineering: number
  m2_robotics: number
  m2_physics: number
  m2_mathematics: number
  m2_it: number
  m2_business: number
  m2_humanities: number
  m2_journalism: number
  m2_social: number
  m2_creative: number
  m2_education: number
  m2_law: number
  m2_medicine: number
  m2_art: number
  m2_hospitality: number
  m2_agriculture: number
  m2_construction: number
  m2_transport: number
  m2_sports: number
}

const scaleValues = Module2Interests.scaleValues

// Маппинг вопросов на сферы из interpretation файла
const scoringKeys = Module2Interests.scoringKeys

export function calculateModule2(data: Record<string, any>): Module2Scores {
  // Инициализируем счетчики для всех сфер
  const rawScores: Record<string, number> = {
    m2_naturalScience: 0,
    m2_engineering: 0,
    m2_robotics: 0,
    m2_physics: 0,
    m2_mathematics: 0,
    m2_it: 0,
    m2_business: 0,
    m2_humanities: 0,
    m2_journalism: 0,
    m2_social: 0,
    m2_creative: 0,
    m2_education: 0,
    m2_law: 0,
    m2_medicine: 0,
    m2_art: 0,
    m2_hospitality: 0,
    m2_agriculture: 0,
    m2_construction: 0,
    m2_transport: 0,
    m2_sports: 0,
  }

  // Проходим по всем ответам
  Object.entries(data).forEach(([questionKey, answer]) => {
    // Извлекаем номер вопроса из ключа (например, "q1" -> 1)
    const questionNum = parseInt(questionKey.replace('q', ''))
    
    if (!answer || isNaN(questionNum)) return

    // Получаем значение ответа
    let value = 0
    if (typeof answer === 'string') {
      value = scaleValues[answer as keyof typeof scaleValues] ?? 0
    } else if (typeof answer === 'number') {
      value = answer
    }

    // Находим все сферы, к которым относится этот вопрос
    Object.entries(scoringKeys).forEach(([sphereKey, questions]: [string, readonly number[]]) => {
      if (questions.includes(questionNum)) {
        // Конвертируем snake_case в camelCase и добавляем префикс m2_
        const camelKey = sphereKey.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
        const prefixedKey = `m2_${camelKey}` as keyof typeof rawScores
        rawScores[prefixedKey] = (rawScores[prefixedKey] || 0) + value
      }
    })
  })

  // Нормализуем баллы в проценты (0-100)
  // Для каждой сферы: (балл / (количество_вопросов × 3)) × 100
  const normalizedScores: Record<string, number> = {}
  
  Object.entries(scoringKeys).forEach(([sphereKey, questions]: [string, readonly number[]]) => {
    const camelKey = sphereKey.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
    const prefixedKey = `m2_${camelKey}`
    const maxScore = questions.length * 3 // максимальный балл '++' = 3
    const rawScore = rawScores[prefixedKey as keyof typeof rawScores] || 0
    const percentage = maxScore > 0 ? Math.round((rawScore / maxScore) * 100) : 0
    normalizedScores[prefixedKey] = Math.max(0, Math.min(100, percentage)) // ограничиваем 0-100
  })

  return normalizedScores as unknown as Module2Scores
}
