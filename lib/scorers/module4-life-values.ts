/**
 * Модуль 4: Life Values & Priorities (Ranking)
 * Обрабатывает ranking ценностей (18 категорий)
 */

export interface Module4Scores {
  m4_values: Record<string, number>
}

const VALUES_MAP: Record<number, string> = {
  1: 'Акуратність',
  2: 'Вихованість',
  3: 'Високі запроси',
  4: 'Життєрадісність',
  5: 'Виконання завдань',
  6: 'Незалежність',
  7: 'Непримиренність до недоліків',
  8: 'Вченість',
  9: 'Відповідальність',
  10: 'Раціоналізм',
  11: 'Самоконтроль',
  12: 'Сміливість',
  13: 'Тверда воля',
  14: 'Терпимість',
  15: 'Широта поглядів',
  16: 'Чесність',
  17: 'Ефективність',
  18: 'Чуйність'
}

export function calculateModule4(data: Record<string, any>): Module4Scores {
  const answers = data

  if (!answers || Object.keys(answers).length === 0) {
    return { m4_values: {} }
  }

  // В Module 4 пользователь ранжирует ценности от 1 (самая важная) до 18 (наименее важная)
  // Каждый вопрос (q1-q18) представляет ценность, которой присваивается ранг
  // Нужно извлечь название ценности и ее ранг

  const valuesWithRanks: Record<string, number> = {}

  // Для каждого вопроса (представляющего ценность) получаем присвоенный ранг
  Object.keys(answers).forEach((questionKey) => {
    const questionNumber = parseInt(questionKey.replace('q', ''))
    const rank = parseInt(answers[questionKey])

    if (!isNaN(questionNumber) && !isNaN(rank)) {
      const valueName = VALUES_MAP[questionNumber]
      if (valueName) {
        valuesWithRanks[valueName] = rank
      }
    }
  })

  return { m4_values: valuesWithRanks }
}
