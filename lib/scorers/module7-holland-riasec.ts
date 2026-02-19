/**
 * Модуль 7: Holland RIASEC Typology
 * Обрабатывает 6 типів професійних інтересів по моделі Голланда
 * 37 питань, кожен з двома варіантами відповідей (А/Б)
 * - R: Realistic (Практик)
 * - I: Investigative (Дослідник)
 * - A: Artistic (Творець)
 * - S: Social (Помічник)
 * - E: Enterprising (Лідер)
 * - C: Conventional (Організатор)
 */

export interface Module7Scores {
  m7_r: number
  m7_i: number
  m7_a: number
  m7_s: number
  m7_e: number
  m7_c: number
}

// Маппинг: вопрос + вариант → тип Holland
const answerMapping: Record<string, { a?: string; b?: string }> = {
  '1': { a: 'R', b: 'I' },
  '2': { a: 'S', b: 'E' },
  '3': { a: 'A', b: 'C' },
  '4': { a: 'R', b: 'I' },
  '5': { a: 'E', b: 'S' },
  '6': { a: 'A', b: 'C' },
  '7': { a: 'R', b: 'E' },
  '8': { a: 'I', b: 'A' },
  '9': { a: 'S', b: 'E' },
  '10': { a: 'R', b: 'S' },
  '11': { a: 'I', b: 'E' },
  '12': { a: 'A', b: 'C' },
  '13': { a: 'R', b: 'I' },
  '14': { a: 'S', b: 'E' },
  '15': { a: 'A', b: 'C' },
  '16': { a: 'R', b: 'I' },
  '17': { a: 'S', b: 'E' },
  '18': { a: 'A', b: 'C' },
  '19': { a: 'R', b: 'I' },
  '20': { a: 'S', b: 'E' },
  '21': { a: 'A', b: 'C' },
  '22': { a: 'R', b: 'I' },
  '23': { a: 'S', b: 'E' },
  '24': { a: 'A', b: 'C' },
  '25': { a: 'R', b: 'I' },
  '26': { a: 'S', b: 'E' },
  '27': { a: 'A', b: 'C' },
  '28': { a: 'R', b: 'I' },
  '29': { a: 'S', b: 'E' },
  '30': { a: 'A', b: 'C' },
  '31': { a: 'R', b: 'I' },
  '32': { a: 'S', b: 'E' },
  '33': { a: 'A', b: 'C' },
  '34': { a: 'R', b: 'I' },
  '35': { a: 'S', b: 'E' },
  '36': { a: 'A', b: 'C' },
  '37': { a: 'R', b: 'I' },
}

export function calculateModule7(data: Record<string, any>): Module7Scores {
  const scores = {
    R: 0,
    I: 0,
    A: 0,
    S: 0,
    E: 0,
    C: 0,
  }

  // Обробка відповідей module7_q1, module7_q2, ..., module7_q37
  Object.entries(data).forEach(([key, answer]) => {
    if (!key.startsWith('module7_q') || !answer) return

    // Витягуємо номер питання
    const questionNum = key.replace('module7_q', '')
    const mapping = answerMapping[questionNum]
    
    if (!mapping) return

    // Визначаємо вибраний варіант (a або b)
    const selectedOption = String(answer).toLowerCase()
    
    if (selectedOption === 'a' && mapping.a) {
      scores[mapping.a as keyof typeof scores] += 1
    } else if (selectedOption === 'b' && mapping.b) {
      scores[mapping.b as keyof typeof scores] += 1
    }
  })

  // Повертаємо результат
  return {
    m7_r: scores.R,
    m7_i: scores.I,
    m7_a: scores.A,
    m7_s: scores.S,
    m7_e: scores.E,
    m7_c: scores.C,
  }
}
