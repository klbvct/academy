/**
 * Модуль 8: Perception Types (Sensory Channels)
 * Обрабатывает 4 канала восприятия информации
 * 5 блоків питань × 4 питання в кожному = 20 питань
 * Бали від 1 до 4 для кожного питання
 * - visual (візуальний)
 * - auditory (аудіальний)
 * - kinesthetic (кінестетичний)
 * - digital (дискретний/дигітальний)
 */

export interface Module8Scores {
  m8_visual: number
  m8_auditory: number
  m8_kinesthetic: number
  m8_digital: number
}

// Маппинг: питання → тип сприйняття
const questionMapping: Record<string, string> = {
  // Блок 1
  'q1_opt0': 'kinesthetic',  // 1.1
  'q1_opt1': 'auditory',     // 1.2
  'q1_opt2': 'visual',       // 1.3
  'q1_opt3': 'digital',      // 1.4
  
  // Блок 2
  'q2_opt0': 'auditory',     // 2.1
  'q2_opt1': 'visual',       // 2.2
  'q2_opt2': 'digital',      // 2.3
  'q2_opt3': 'kinesthetic',  // 2.4
  
  // Блок 3
  'q3_opt0': 'visual',       // 3.1
  'q3_opt1': 'kinesthetic',  // 3.2
  'q3_opt2': 'digital',      // 3.3
  'q3_opt3': 'auditory',     // 3.4
  
  // Блок 4
  'q4_opt0': 'auditory',     // 4.1
  'q4_opt1': 'digital',      // 4.2
  'q4_opt2': 'kinesthetic',  // 4.3
  'q4_opt3': 'visual',       // 4.4
  
  // Блок 5
  'q5_opt0': 'auditory',     // 5.1
  'q5_opt1': 'digital',      // 5.2
  'q5_opt2': 'visual',       // 5.3
  'q5_opt3': 'kinesthetic',  // 5.4
}

export function calculateModule8(data: Record<string, any>): Module8Scores {
  const scores = {
    visual: 0,
    auditory: 0,
    kinesthetic: 0,
    digital: 0,
  }

  // Обробка відповідей
  Object.entries(data).forEach(([key, value]) => {
    const perceptionType = questionMapping[key]
    if (!perceptionType || !value) return

    // Додаємо бали (1-4)
    const score = parseInt(String(value), 10)
    if (!isNaN(score) && score >= 1 && score <= 4) {
      scores[perceptionType as keyof typeof scores] += score
    }
  })

  // Повертаємо результат (сирі бали, компонент сам обчислює відсотки)
  return {
    m8_visual: scores.visual,
    m8_auditory: scores.auditory,
    m8_kinesthetic: scores.kinesthetic,
    m8_digital: scores.digital,
  }
}
