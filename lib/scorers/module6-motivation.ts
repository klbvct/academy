/**
 * Модуль 6: Motivation Factors (Schwartz Scale)
 * Обрабатывает 57 вопросов по шкале от -1 до 7
 * -1 = абсолютное противоречие, 0 = безразлично, 1-3 = не очень важно,
 * 4-5 = довольно важно, 6-7 = исключительно важно
 */

export interface Module6Scores {
  m6_strongMotivator: number // процент ответов 6-7 баллов
  m6_moderate: number // процент ответов 4-5 баллов
  m6_weak: number // процент ответов 1-3 балла
  m6_demotivator: number // процент ответов -1 до 0 баллов
  m6_strongMotivatorsList?: Array<{ factor: string; score: number }> // конкретные мотиваторы
  m6_moderateList?: Array<{ factor: string; score: number }> // конкретные умеренные факторы
  m6_weakList?: Array<{ factor: string; score: number }> // конкретные слабые факторы
  m6_demotivatorsList?: Array<{ factor: string; score: number }> // конкретные демотиваторы
}

const MOTIVATION_FACTORS: Record<number, string> = {
  1: 'Рівність',
  2: 'Внутрішня гармонія',
  3: 'Соціальна сила',
  4: 'Задоволення',
  5: 'Свобода',
  6: 'Духовне життя',
  7: 'Відчуття приналежності',
  8: 'Соціальний порядок',
  9: 'Життя, сповнене вражень',
  10: 'Сенс життя',
  11: 'Вдячність',
  12: 'Багатство',
  13: 'Національна безпека',
  14: 'Самоповага',
  15: 'Повага думки інших',
  16: 'Креативність',
  17: 'Мир у всьому світі',
  18: 'Повага традицій',
  19: 'Зріле кохання',
  20: 'Самодисципліна',
  21: 'Право на самоту',
  22: 'Безпека сім\'ї',
  23: 'Соціальне визнання',
  24: 'Єдність з природою',
  25: 'Мінливе життя',
  26: 'Мудрість',
  27: 'Авторитет',
  28: 'Справжня дружба',
  29: 'Світ краси',
  30: 'Соціальна справедливість',
  31: 'Самостійний',
  32: 'Стриманий',
  33: 'Вірний',
  34: 'Цілеспрямований',
  35: 'Відкритий до чужої думки',
  36: 'Скромний',
  37: 'Сміливий',
  38: 'Захист довкілля',
  39: 'Впливовий',
  40: 'Повага до батьків і старших',
  41: 'Обирає власну мету',
  42: 'Здоровий',
  43: 'Здібний',
  44: 'Приймаючий життя',
  45: 'Чесний',
  46: 'Зберігаючий свій імідж',
  47: 'Слухняний',
  48: 'Розумний',
  49: 'Корисний',
  50: 'Насолоджується життям',
  51: 'Благочестивий',
  52: 'Відповідальний',
  53: 'Допитливий',
  54: 'Схильний прощати',
  55: 'Успішний',
  56: 'Охайний',
  57: 'Потурає своїм бажанням'
}

export function calculateModule6(data: Record<string, any>): Module6Scores {
  const answers = data

  if (!answers || Object.keys(answers).length === 0) {
    return {
      m6_strongMotivator: 0,
      m6_moderate: 0,
      m6_weak: 0,
      m6_demotivator: 0,
      m6_strongMotivatorsList: [],
      m6_moderateList: [],
      m6_weakList: [],
      m6_demotivatorsList: []
    }
  }

  // Категоризация ответов по шкале Schwartz
  let strongMotivatorCount = 0 // 6-7 баллов
  let moderateCount = 0 // 4-5 баллов
  let weakCount = 0 // 1-3 балла
  let demotivatorCount = 0 // -1 до 0 баллов
  let totalAnswers = 0

  const strongMotivatorsList: Array<{ factor: string; score: number }> = []
  const moderateList: Array<{ factor: string; score: number }> = []
  const weakList: Array<{ factor: string; score: number }> = []
  const demotivatorsList: Array<{ factor: string; score: number }> = []

  Object.keys(answers).forEach((questionKey) => {
    const value = parseInt(answers[questionKey])
    const questionNumber = parseInt(questionKey.replace('q', ''))

    if (!isNaN(value) && !isNaN(questionNumber)) {
      totalAnswers++

      const factorName = MOTIVATION_FACTORS[questionNumber]

      if (value >= 6 && value <= 7) {
        strongMotivatorCount++
        if (factorName) {
          strongMotivatorsList.push({ factor: factorName, score: value })
        }
      } else if (value >= 4 && value <= 5) {
        moderateCount++
        if (factorName) {
          moderateList.push({ factor: factorName, score: value })
        }
      } else if (value >= 1 && value <= 3) {
        weakCount++
        if (factorName) {
          weakList.push({ factor: factorName, score: value })
        }
      } else if (value >= -1 && value <= 0) {
        demotivatorCount++
        if (factorName) {
          demotivatorsList.push({ factor: factorName, score: value })
        }
      }
    }
  })

  // Рассчитываем проценты
  const calculatePercentage = (count: number): number => {
    return totalAnswers > 0 ? Math.round((count / totalAnswers) * 100) : 0
  }

  // Сортируем списки по оценке (по убыванию для мотиваторов, по возрастанию для демотиваторов)
  strongMotivatorsList.sort((a, b) => b.score - a.score)
  moderateList.sort((a, b) => b.score - a.score)
  weakList.sort((a, b) => b.score - a.score)
  demotivatorsList.sort((a, b) => a.score - b.score)

  return {
    m6_strongMotivator: calculatePercentage(strongMotivatorCount),
    m6_moderate: calculatePercentage(moderateCount),
    m6_weak: calculatePercentage(weakCount),
    m6_demotivator: calculatePercentage(demotivatorCount),
    m6_strongMotivatorsList: strongMotivatorsList,
    m6_moderateList: moderateList,
    m6_weakList: weakList,
    m6_demotivatorsList: demotivatorsList
  }
}

