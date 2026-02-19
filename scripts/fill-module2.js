const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fillModule2Data(email) {
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
      console.error(`❌ У пользователя нет тестов`)
      process.exit(1)
    }

    const testResult = user.results[0]
    console.log(`✅ Найден тест ID: ${testResult.id}`)

    // Получаем текущие данные
    const data = typeof testResult.data === 'string' 
      ? JSON.parse(testResult.data) 
      : testResult.data

    // Генерируем ответы для Модуля 2 (175 вопросов)
    const module2Answers = {}
    const possibleAnswers = ['++', '+', '0', '-', '--']
    
    // Генерируем ответы с распределением:
    // 40% ответов '++' (отличные)
    // 30% ответов '+' (хорошие)
    // 20% ответов '0' (нейтральные)
    // 5% ответов '-' (плохие)
    // 5% ответов '--' (очень плохие)
    
    for (let i = 1; i <= 175; i++) {
      const rand = Math.random()
      let answer
      if (rand < 0.4) {
        answer = '++'
      } else if (rand < 0.7) {
        answer = '+'
      } else if (rand < 0.9) {
        answer = '0'
      } else if (rand < 0.95) {
        answer = '-'
      } else {
        answer = '--'
      }
      module2Answers[i] = answer
    }

    // Обновляем данные с новым Модулем 2
    const updatedData = {
      ...data,
      module2: module2Answers,
    }

    // Сохраняем в БД
    await prisma.testResult.update({
      where: { id: testResult.id },
      data: {
        data: JSON.stringify(updatedData),
      },
    })

    console.log(`\n✅ Модуль 2 заполнен 175 ответами!`)
    console.log(`   40% ответов '++' (отличные интересы)`)
    console.log(`   30% ответов '+' (хорошие интересы)`)
    console.log(`   20% ответов '0' (нейтральные)`)
    console.log(`   5% ответов '-' (слабы интересы)`)
    console.log(`   5% ответов '--' (очень слабые интересы)`)
    
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
  console.error('   node scripts/fill-module2.js user@example.com')
  process.exit(1)
}

fillModule2Data(email)
