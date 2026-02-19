/**
 * Скрипт для пересчёта результатов Модуля 1 для конкретного пользователя
 * Использование: node scripts/recalculate-module1.js <email>
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Правильная таблица соответствия
const scoringKeys = {
  '1': { a: 'nature', b: 'technic' },
  '2': { a: 'human', b: 'sign' },
  '3': { a: 'artVector', b: 'nature' },
  '4': { a: 'technic', b: 'human' },
  '5': { a: 'sign', b: 'artVector' },
  '6': { a: 'nature', b: 'human' },
  '7': { a: 'artVector', b: 'technic' },
  '8': { a: 'human', b: 'artVector' },
  '9': { a: 'technic', b: 'sign' },
  '10': { a: 'nature', b: 'sign' },
  '11': { a: 'nature', b: 'technic' },
  '12': { a: 'human', b: 'sign' },
  '13': { a: 'artVector', b: 'nature' },
  '14': { a: 'technic', b: 'human' },
  '15': { a: 'sign', b: 'artVector' },
  '16': { a: 'nature', b: 'human' },
  '17': { a: 'artVector', b: 'technic' },
  '18': { a: 'human', b: 'artVector' },
  '19': { a: 'technic', b: 'sign' },
  '20': { a: 'nature', b: 'sign' },
}

function calculateModule1(data) {
  const scores = {
    nature: 0,
    technic: 0,
    human: 0,
    sign: 0,
    artVector: 0,
  }

  Object.entries(data).forEach(([questionKey, answer]) => {
    if (!answer) return

    const questionNumber = questionKey.replace(/\D/g, '')
    const mapping = scoringKeys[questionNumber]

    if (!mapping) return

    let selectedVector = null
    if (typeof answer === 'string') {
      const normalizedAnswer = answer.toLowerCase()
      if (normalizedAnswer === 'a' || normalizedAnswer === 'yes' || normalizedAnswer === '+') {
        selectedVector = mapping.a
      } else if (normalizedAnswer === 'b' || normalizedAnswer === 'no' || normalizedAnswer === '-') {
        selectedVector = mapping.b
      }
    }

    if (selectedVector) {
      scores[selectedVector] += 1
    }
  })

  return scores
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

    if (!data || !data.module1) {
      console.error(`❌ Нет данных для Модуля 1`)
      process.exit(1)
    }

    const answers = data.module1
    console.log(`📝 Всего ответов: ${Object.keys(answers).length}`)

    // Пересчитываем scores
    const oldScores = typeof testResult.scores === 'string' 
      ? JSON.parse(testResult.scores) 
      : testResult.scores

    console.log(`\n📊 Старые результаты Модуля 1:`)
    console.log(`   П (nature):  ${oldScores.nature || 0}`)
    console.log(`   Т (technic): ${oldScores.technic || 0}`)
    console.log(`   Ч (human):   ${oldScores.human || 0}`)
    console.log(`   З (sign):    ${oldScores.sign || 0}`)
    console.log(`   Х (artVector):     ${oldScores.artVector || oldScores.art || 0}`)

    const newModule1Scores = calculateModule1(answers)
    
    console.log(`\n✨ Новые результаты Модуля 1:`)
    console.log(`   П (nature):  ${newModule1Scores.nature}`)
    console.log(`   Т (technic): ${newModule1Scores.technic}`)
    console.log(`   Ч (human):   ${newModule1Scores.human}`)
    console.log(`   З (sign):    ${newModule1Scores.sign}`)
    console.log(`   Х (artVector):     ${newModule1Scores.artVector}`)

    // Объединяем новые scores с остальными модулями
    const updatedScores = {
      ...oldScores,
      ...newModule1Scores,
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
  console.error('   node scripts/recalculate-module1.js user@example.com')
  process.exit(1)
}

recalculateForUser(email)
