const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkScores(email) {
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

    if (!user || !user.results || user.results.length === 0) {
      console.error(`❌ Пользователь или результаты не найдены`)
      process.exit(1)
    }

    const testResult = user.results[0]
    console.log(`\n✅ Тест ID: ${testResult.id}`)
    console.log(`📅 Дата: ${testResult.completedAt}`)

    const scores = typeof testResult.scores === 'string' 
      ? JSON.parse(testResult.scores) 
      : testResult.scores

    console.log(`\n📊 Модуль 1 (Professional Vector):`)
    console.log(`   nature (П):  ${scores.nature || 0}`)
    console.log(`   technic (Т): ${scores.technic || 0}`)
    console.log(`   human (Ч):   ${scores.human || 0}`)
    console.log(`   sign (З):    ${scores.sign || 0}`)
    console.log(`   art (Х):     ${scores.art || 0}`)

    console.log(`\n📊 Модуль 2 (первые 5 сфер):`)
    console.log(`   naturalScience:  ${scores.naturalScience || 0}`)
    console.log(`   engineering:     ${scores.engineering || 0}`)
    console.log(`   robotics:        ${scores.robotics || 0}`)
    console.log(`   physics:         ${scores.physics || 0}`)
    console.log(`   mathematics:     ${scores.mathematics || 0}`)

    console.log(`\n📋 Все ключи scores:`)
    console.log(Object.keys(scores).sort())
    
  } catch (error) {
    console.error('❌ Ошибка:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

const email = process.argv[2] || 'kalabukhov87@gmail.com'
checkScores(email)
