/**
 * Модуль 5: Intellectual Lability (Gardner's Multiple Intelligences)
 * Обрабатывает 8 типов интеллекта по теории Гарднера
 */

export interface Module5Scores {
  m5_linguistic: number
  m5_logicalMathematical: number
  m5_spatial: number
  m5_bodilyKinesthetic: number
  m5_musical: number
  m5_interpersonal: number
  m5_intrapersonal: number
  m5_naturalistic: number
}

const intelligenceTypes: (keyof Module5Scores)[] = [
  'm5_linguistic',
  'm5_logicalMathematical',
  'm5_spatial',
  'm5_bodilyKinesthetic',
  'm5_musical',
  'm5_interpersonal',
  'm5_intrapersonal',
  'm5_naturalistic',
]

export function calculateModule5(data: Record<string, any>): Module5Scores {
  const categoryCount = 8
  const scores = Array(categoryCount).fill(0)

  // Обрабатываем ответы
  // Распределение по типам интеллекта:
  // q1, q9, q17 -> Лингвистический (индекс 0)
  // q2, q10, q18 -> Логико-математический (индекс 1)
  // q3, q11, q19 -> Пространственно-визуальный (индекс 2)
  // q4, q12, q20 -> Музыкальный (индекс 3)  
  // q5, q13, q21 -> Кинестетический (индекс 4)
  // q6, q14, q22 -> Межличностный (индекс 5)
  // q7, q15, q23 -> Внутриличностный (индекс 6)
  // q8, q16, q24 -> Натуралистический (индекс 7)

  Object.entries(data).forEach(([questionKey, answer]) => {
    if (!answer) return

    // Получаем номер вопроса (убираем 'q')
    const questionNum = parseInt(questionKey.replace('q', ''))
    if (isNaN(questionNum)) return

    // Определяем индекс категории: вопросы 1-8 → индексы 0-7, 9-16 → 0-7, 17-24 → 0-7
    const categoryIndex = (questionNum - 1) % categoryCount

    // Увеличиваем счет на основе ответа
    let points = 0
    if (typeof answer === 'string') {
      // Пытаемся парсить как число
      const numValue = parseInt(answer)
      if (!isNaN(numValue)) {
        points = numValue * 2 // Масштабируем от 1-5 к баллам (2-10)
      } else if (answer === 'a' || answer === 'yes' || answer === '+' || answer === '++') {
        points = 10
      } else if (answer === 'b' || answer === 'no' || answer === '-') {
        points = 5
      }
    } else if (typeof answer === 'number') {
      points = answer * 2
    }
    
    scores[categoryIndex] += points
  })

  // Нормализуем относительно максимального и минимального баллов
  // Распределяем от 1 до 9 (прогресс), где 10 - прогресс = непроявленность
  const maxScore = Math.max(...scores) || 1
  const minScore = Math.min(...scores.filter(s => s > 0)) || 0

  const normalizedProgress = scores.map(s => {
    if (s === 0) return 1 // Минимальная проявленность
    if (maxScore === minScore) return 5 // Все одинаковые
    // Нормализация от 1 до 9
    return Math.round(1 + ((s - minScore) / (maxScore - minScore)) * 8)
  })

  // Формируем объект результат (прогресс от 1 до 9)
  const result: Module5Scores = {} as Module5Scores
  intelligenceTypes.forEach((name, idx) => {
    result[name] = normalizedProgress[idx] || 1
  })

  return result
}
