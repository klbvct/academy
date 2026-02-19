/**
 * Модуль 1: Professional Vector 
 * Обрабатывает 5 типов профессиональных векторов взаимодействия
 * - nature (Человек-Природа)
 * - technic (Человек-Техника)
 * - human (Человек-Человек)
 * - sign (Человек-Знаковая система)
 * - art (Человек-Художественный образ)
 */

export interface Module1Scores {
  m1_nature: number
  m1_technic: number
  m1_human: number
  m1_sign: number
  m1_art: number
}

// Таблица соответствия вопросов и векторов
const scoringKeys: Record<string, { a: keyof Module1Scores, b: keyof Module1Scores }> = {
  '1': { a: 'm1_nature', b: 'm1_technic' },
  '2': { a: 'm1_human', b: 'm1_sign' },
  '3': { a: 'm1_art', b: 'm1_nature' },
  '4': { a: 'm1_technic', b: 'm1_human' },
  '5': { a: 'm1_sign', b: 'm1_art' },
  '6': { a: 'm1_nature', b: 'm1_human' },
  '7': { a: 'm1_art', b: 'm1_technic' },
  '8': { a: 'm1_human', b: 'm1_art' },
  '9': { a: 'm1_technic', b: 'm1_sign' },
  '10': { a: 'm1_nature', b: 'm1_sign' },
  '11': { a: 'm1_nature', b: 'm1_technic' },
  '12': { a: 'm1_human', b: 'm1_sign' },
  '13': { a: 'm1_art', b: 'm1_nature' },
  '14': { a: 'm1_technic', b: 'm1_human' },
  '15': { a: 'm1_sign', b: 'm1_art' },
  '16': { a: 'm1_nature', b: 'm1_human' },
  '17': { a: 'm1_art', b: 'm1_technic' },
  '18': { a: 'm1_human', b: 'm1_art' },
  '19': { a: 'm1_technic', b: 'm1_sign' },
  '20': { a: 'm1_nature', b: 'm1_sign' },
}

export function calculateModule1(data: Record<string, any>): Module1Scores {
  const scores: Module1Scores = {
    m1_nature: 0,
    m1_technic: 0,
    m1_human: 0,
    m1_sign: 0,
    m1_art: 0,
  }

  // Обрабатываем ответы
  Object.entries(data).forEach(([questionKey, answer]) => {
    if (!answer) return

    // Получаем номер вопроса (убираем префикс если есть)
    const questionNumber = questionKey.replace(/\D/g, '')
    const mapping = scoringKeys[questionNumber]

    if (!mapping) return

    // Определяем выбранный вектор на основе ответа
    let selectedVector: keyof Module1Scores | null = null

    if (typeof answer === 'string') {
      const normalizedAnswer = answer.toLowerCase()
      if (normalizedAnswer === 'a' || normalizedAnswer === 'yes' || normalizedAnswer === '+') {
        selectedVector = mapping.a
      } else if (normalizedAnswer === 'b' || normalizedAnswer === 'no' || normalizedAnswer === '-') {
        selectedVector = mapping.b
      }
    }

    // Засчитываем балл
    if (selectedVector) {
      scores[selectedVector] += 1
    }
  })

  return scores
}
