const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Маппинг вопросов на сферы (из interpretation файла)
const scoringKeys = {
  naturalScience: [1, 3, 29, 34, 58, 59, 88, 116, 145, 173],
  engineering: [6, 8, 9, 14, 22, 31, 34, 37, 65, 95, 96, 152, 160],
  robotics: [8, 13, 14, 22, 37, 65, 67, 94, 95, 96, 123, 125, 152, 153],
  physics: [31, 34, 63, 65, 66, 92, 121, 150, 160, 172],
  mathematics: [22, 51, 80, 109, 130, 138, 160, 167, 175],
  it: [22, 36, 51, 131, 134, 140, 153],
  business: [2, 22, 23, 47, 52, 81, 110, 130, 139, 168],
  humanities: [16, 24, 48, 49, 53, 74, 82, 84, 102, 103, 111, 132, 161],
  journalism: [17, 26, 30, 36, 44, 45, 46, 82, 84, 104, 142, 161, 162, 171, 174],
  social: [15, 18, 23, 43, 44, 46, 59, 73, 76, 102, 105, 132, 161],
  creative: [10, 25, 33, 38, 54, 60, 68, 91, 97, 98, 112, 126, 146, 149, 174],
  education: [19, 24, 48, 53, 63, 77, 78, 84, 105, 106, 132, 135, 164, 174],
  law: [5, 18, 20, 43, 44, 47, 73, 76, 99, 102, 105, 107, 133, 157, 163, 165],
  medicine: [4, 32, 58, 61, 90, 119, 136, 148, 159, 160, 173],
  art: [25, 27, 30, 55, 56, 83, 85, 89, 112, 113, 114, 141, 143, 146, 170],
  hospitality: [50, 62, 79, 108, 117, 120, 129, 166, 174],
  agriculture: [7, 29, 31, 35, 64, 93, 122, 145, 151, 169],
  construction: [11, 65, 67, 69, 98, 112, 123, 124, 126, 127, 137, 154, 155, 156],
  transport: [12, 13, 36, 41, 42, 70, 124, 158],
  sports: [28, 57, 72, 86, 100, 101, 115, 118, 147, 173, 714],
}

const scaleValues = {
  '++': 3,
  '+': 2,
  '0': 1,
  '-': 0,
  '--': -1,
}

function calculateModule2(data) {
  // Инициализируем счетчики для всех сфер
  const rawScores = {
    naturalScience: 0,
    engineering: 0,
    robotics: 0,
    physics: 0,
    mathematics: 0,
    it: 0,
    business: 0,
    humanities: 0,
    journalism: 0,
    social: 0,
    creative: 0,
    education: 0,
    law: 0,
    medicine: 0,
    art: 0,
    hospitality: 0,
    agriculture: 0,
    construction: 0,
    transport: 0,
    sports: 0,
  }

  // Проходим по всем ответам
  Object.entries(data).forEach(([questionKey, answer]) => {
    // Извлекаем номер вопроса из ключа (например, "q1" -> 1)
    const questionNum = parseInt(questionKey.replace('q', ''))
    
    if (!answer || isNaN(questionNum)) return

    // Получаем значение ответа
    let value = 0
    if (typeof answer === 'string') {
      value = scaleValues[answer] ?? 0
    } else if (typeof answer === 'number') {
      value = answer
    }

    // Находим все сферы, к которым относится этот вопрос
    Object.entries(scoringKeys).forEach(([sphereKey, questions]) => {
      if (questions.includes(questionNum)) {
        rawScores[sphereKey] = (rawScores[sphereKey] || 0) + value
      }
    })
  })

  // Нормализуем баллы в проценты (0-100)
  // Для каждой сферы: (балл / (количество_вопросов × 3)) × 100
  const normalizedScores = {}
  
  Object.entries(scoringKeys).forEach(([sphereKey, questions]) => {
    const maxScore = questions.length * 3 // максимальный балл '++' = 3
    const rawScore = rawScores[sphereKey] || 0
    const percentage = maxScore > 0 ? Math.round((rawScore / maxScore) * 100) : 0
    // Конвертируем snake_case в camelCase и добавляем префикс m2_
    const camelKey = sphereKey.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
    const prefixedKey = `m2_${camelKey}`
    normalizedScores[prefixedKey] = Math.max(0, Math.min(100, percentage)) // ограничиваем 0-100
  })

  return normalizedScores
}

async function recalculateForUser(email) {
  try {
    console.log(`🔍 Поиск пользователя: ${email}`)
    
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        results: {
          orderBy: { completedAt: 'desc' },
          take: 1,
        },
      },
    })

    if (!user) {
      console.error(`❌ Пользователь с email ${email} не найден`)
      process.exit(1)
    }

    if (!user.results || user.results.length === 0) {
      console.error(`❌ У пользователя нет завершённых тестов`)
      process.exit(1)
    }

    const testResult = user.results[0]
    console.log(`✅ Найден тест ID: ${testResult.id}`)
    console.log(`📅 Дата прохождения: ${testResult.completedAt}`)

    // Получаем data
    const data = typeof testResult.data === 'string' 
      ? JSON.parse(testResult.data) 
      : testResult.data

    if (!data || !data.module2) {
      console.error(`❌ Нет данных для Модуля 2`)
      process.exit(1)
    }

    const answers = data.module2
    console.log(`📝 Всего ответов: ${Object.keys(answers).length}`)

    // Пересчитываем scores
    const oldScores = typeof testResult.scores === 'string' 
      ? JSON.parse(testResult.scores) 
      : testResult.scores

    console.log(`\n📊 Старые результаты Модуля 2 (первые 5 сфер):`)
    console.log(`   Природничі науки:  ${oldScores.m2_naturalScience || 0}`)
    console.log(`   Інженерія:          ${oldScores.m2_engineering || 0}`)
    console.log(`   Робототехніка:      ${oldScores.m2_robotics || 0}`)
    console.log(`   Фізика:             ${oldScores.m2_physics || 0}`)
    console.log(`   Математика:         ${oldScores.m2_mathematics || 0}`)

    const newModule2Scores = calculateModule2(answers)
    
    console.log(`\n✨ Новые результаты Модуля 2 (первые 5 сфер):`)
    console.log(`   Природничі науки:  ${newModule2Scores.m2_naturalScience}`)
    console.log(`   Інженерія:          ${newModule2Scores.m2_engineering}`)
    console.log(`   Робототехніка:      ${newModule2Scores.m2_robotics}`)
    console.log(`   Фізика:             ${newModule2Scores.m2_physics}`)
    console.log(`   Математика:         ${newModule2Scores.m2_mathematics}`)

    // Объединяем новые scores с остальными модулями
    const updatedScores = {
      ...oldScores,
      ...newModule2Scores,
    }

    // Обновляем в БД
    await prisma.testResult.update({
      where: { id: testResult.id },
      data: {
        scores: JSON.stringify(updatedScores),
      },
    })

    console.log(`\n✅ Результаты успешно обновлены в БД!`)
    console.log(`\n💡 Пользователь может обновить страницу результатов`)
    
  } catch (error) {
    console.error('❌ Ошибка:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Запуск
const email = process.argv[2]
if (!email) {
  console.error('❌ Укажите email пользователя:')
  console.error('   node scripts/recalculate-module2.js user@example.com')
  process.exit(1)
}

recalculateForUser(email)
