/**
 * Script: Regenerate recommendations for a specific user
 * Usage: node scripts/regenerate-recommendations-for-user.js <email>
 */

const { PrismaClient } = require('@prisma/client')
const { GoogleGenerativeAI } = require('@google/generative-ai')

const prisma = new PrismaClient()
const apiKey = process.env.GEMINI_API_KEY
const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'

if (!apiKey) {
  console.error('❌ GEMINI_API_KEY not set in environment')
  process.exit(1)
}

const genAI = new GoogleGenerativeAI(apiKey)

async function generateCareerRecommendations(scores, userName) {
  try {
    const modelInstance = genAI.getGenerativeModel({ model })

    // Build context from scores
    const context = buildScoresContext(scores)

    const prompt = `
Ви - експерт з профорієнтації та кар'єрного планування. На основі результатів комплексного тесту "Дизайн Освіти" надайте персоналізовані рекомендації щодо вибору професійної траєкторії.

${userName ? `Учасник тесту: ${userName}` : ''}

РЕЗУЛЬТАТИ ТЕСТУ:
${context}

ЗАВДАННЯ:
1. Проаналізуйте сильні сторони та схильності учасника
2. Визначте найбільш підходящі професійні напрямки (2-3 основних)
3. Запропонуйте конкретні спеціальності та спеціалізації
4. Дайте поради щодо розвитку необхідних навичок
5. Укажіть можливі відносини між модулями результатів

ВИМОГИ:
- Відповідь на українській мові
- Структурований формат з розділами
- 1-2 сторінки (до 2000 символів)
- Позитивний і мотивуючий тон
- Конкретні, практичні рекомендації

ФОРМАТ ВІДПОВІДІ:
Почніть з "1. Аналіз результатів:" і закінчіть "7. Висновок:"
`

    console.log('🤖 Запит до Gemini...')
    const result = await modelInstance.generateContent(prompt)
    const recommendations = result.response.text()

    console.log('✅ Рекомендації отримані')
    return recommendations
  } catch (error) {
    console.error('❌ Помилка при генерації рекомендацій:', error.message)
    throw error
  }
}

function buildScoresContext(scores) {
  let context = ''

  // Module 1
  if (scores.m1_nature !== undefined) {
    context += `\n📋 МОДУЛЬ 1 - Професійна спрямованість (Климов):`
    context += `\n  • Природа: ${scores.m1_nature || 0}`
    context += `\n  • Техніка: ${scores.m1_technic || 0}`
    context += `\n  • Люди: ${scores.m1_human || 0}`
    context += `\n  • Знакові системи: ${scores.m1_sign || 0}`
    context += `\n  • Мистецтво: ${scores.m1_art || 0}`
  }

  // Module 2
  if (scores.m2_naturalScience !== undefined) {
    context += `\n\n📋 МОДУЛЬ 2 - Індивідуальні інтереси:`
    context += `\n  • Природознавство: ${scores.m2_naturalScience || 0}`
    context += `\n  • Інженерія: ${scores.m2_engineering || 0}`
    context += `\n  • Робототехніка: ${scores.m2_robotics || 0}`
    context += `\n  • Фізика: ${scores.m2_physics || 0}`
    context += `\n  • Математика: ${scores.m2_mathematics || 0}`
    context += `\n  • IT: ${scores.m2_it || 0}`
    context += `\n  • Бізнес: ${scores.m2_business || 0}`
    context += `\n  • Гуманітарні науки: ${scores.m2_humanities || 0}`
    context += `\n  • Журналістика: ${scores.m2_journalism || 0}`
    context += `\n  • Соціальні науки: ${scores.m2_social || 0}`
    context += `\n  • Креативність: ${scores.m2_creative || 0}`
    context += `\n  • Освіта: ${scores.m2_education || 0}`
    context += `\n  • Право: ${scores.m2_law || 0}`
    context += `\n  • Медицина: ${scores.m2_medicine || 0}`
    context += `\n  • Мистецтво: ${scores.m2_art || 0}`
    context += `\n  • Гостинність: ${scores.m2_hospitality || 0}`
    context += `\n  • Сільське господарство: ${scores.m2_agriculture || 0}`
    context += `\n  • Будівництво: ${scores.m2_construction || 0}`
    context += `\n  • Транспорт: ${scores.m2_transport || 0}`
    context += `\n  • Спорт: ${scores.m2_sports || 0}`
  }

  // Module 3
  if (scores.m3_theoretical !== undefined) {
    context += `\n\n📋 МОДУЛЬ 3 - Домінуючі типи мислення:`
    context += `\n  • Теоретичне: ${scores.m3_theoretical?.percentageExample || scores.m3_theoretical || 0}%`
    context += `\n  • Художнє: ${scores.m3_artistic?.percentageExample || scores.m3_artistic || 0}%`
    context += `\n  • Практичне: ${scores.m3_practical?.percentageExample || scores.m3_practical || 0}%`
    context += `\n  • Творче: ${scores.m3_creative?.percentageExample || scores.m3_creative || 0}%`
    context += `\n  • Конвергентне: ${scores.m3_convergent?.percentageExample || scores.m3_convergent || 0}%`
    context += `\n  • Аналітичне: ${scores.m3_analytical?.percentageExample || scores.m3_analytical || 0}%`
  }

  // Module 4 & 6
  if (scores.m4_values || scores.m6_strongMotivator) {
    context += `\n\n📋 МОДУЛЬ 4 & 6 - Цінності і мотивація:`
    context += `\n  • Сильні мотиватори (${scores.m6_strongMotivator || 0} факторів)`
    context += `\n  • Помірні мотиватори (${scores.m6_moderate || 0} факторів)`
    context += `\n  • Слабкі мотиватори (${scores.m6_weak || 0} факторів)`
    context += `\n  • Демотиватори (${scores.m6_demotivator || 0} факторів)`
  }

  // Module 5
  if (scores.m5_linguistic !== undefined) {
    context += `\n\n📋 МОДУЛЬ 5 - Типи інтелекту (Gardner):`
    context += `\n  • Лінгвістичний: ${scores.m5_linguistic || 0}`
    context += `\n  • Логіко-математичний: ${scores.m5_logicalMathematical || 0}`
    context += `\n  • Просторовий: ${scores.m5_spatial || 0}`
    context += `\n  • Тілесно-кінестетичний: ${scores.m5_bodilyKinesthetic || 0}`
    context += `\n  • Музичний: ${scores.m5_musical || 0}`
    context += `\n  • Міжособистісний: ${scores.m5_interpersonal || 0}`
    context += `\n  • Внутрішньоособистісний: ${scores.m5_intrapersonal || 0}`
    context += `\n  • Натуралістичний: ${scores.m5_naturalistic || 0}`
  }

  // Module 7
  if (scores.m7_r !== undefined) {
    context += `\n\n📋 МОДУЛЬ 7 - Holland RIASEC:`
    context += `\n  • Реалістичний (R): ${scores.m7_r || 0}`
    context += `\n  • Досліджувацький (I): ${scores.m7_i || 0}`
    context += `\n  • Художній (A): ${scores.m7_a || 0}`
    context += `\n  • Соціальний (S): ${scores.m7_s || 0}`
    context += `\n  • Підприємницький (E): ${scores.m7_e || 0}`
    context += `\n  • Конвенціональний (C): ${scores.m7_c || 0}`
  }

  // Module 8
  if (scores.m8_visual !== undefined) {
    context += `\n\n📋 МОДУЛЬ 8 - Типи сприйняття:`
    context += `\n  • Візуальний: ${scores.m8_visual || 0}`
    context += `\n  • Аудіальний: ${scores.m8_auditory || 0}`
    context += `\n  • Кінестетичний: ${scores.m8_kinesthetic || 0}`
    context += `\n  • Цифровий: ${scores.m8_digital || 0}`
  }

  return context
}

async function main() {
  const email = process.argv[2]

  if (!email) {
    console.error('❌ Помилка: Вкажіть email користувача')
    console.log('Usage: node scripts/regenerate-recommendations-for-user.js <email>')
    process.exit(1)
  }

  console.log(`\n📊 Регенерація рекомендацій для користувача: ${email}`)
  console.log('═'.repeat(60))

  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        results: {
          include: {
            test: true,
          },
        },
      },
    })

    if (!user) {
      console.error(`❌ Користувач не знайдений: ${email}`)
      process.exit(1)
    }

    console.log(`\n✅ Користувач: ${user.fullName} (ID: ${user.id})`)
    console.log(`📧 Email: ${user.email}`)
    console.log(`📝 Завершених тестів: ${user.results.length}`)

    // Process each test result
    for (const result of user.results) {
      console.log(`\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
      console.log(`📋 Тест: ${result.test.title} (ID: ${result.testId})`)
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)

      if (!result.completedAt) {
        console.log('⚠️  Тест не завершено')
        continue
      }

      // Parse scores
      let scores = {}
      try {
        scores = JSON.parse(result.scores || '{}')
      } catch (e) {
        console.error('❌ Не вдалося розпарсити scores:', e.message)
        continue
      }

      // Check if has required modules
      const hasModule1 = scores.m1_nature !== undefined
      const hasModule2 = scores.m2_naturalScience !== undefined
      const hasModule3 = scores.m3_theoretical !== undefined

      if (!hasModule1 || !hasModule2 || !hasModule3) {
        console.log('⚠️  Тест не має достатньо завершених модулів')
        console.log(`   • Модуль 1: ${hasModule1 ? '✅' : '❌'}`)
        console.log(`   • Модуль 2: ${hasModule2 ? '✅' : '❌'}`)
        console.log(`   • Модуль 3: ${hasModule3 ? '✅' : '❌'}`)
        continue
      }

      // Generate recommendations
      console.log('🔄 Генерування нових рекомендацій...')
      const recommendations = await generateCareerRecommendations(scores, user.fullName)

      // Save to database in correct format {text: "..."}
      const recommendationsToSave = typeof recommendations === 'string'
        ? JSON.stringify({ text: recommendations })
        : JSON.stringify(recommendations)

      const updated = await prisma.testResult.update({
        where: { id: result.id },
        data: {
          recommendations: recommendationsToSave,
        },
      })

      console.log(`✅ Рекомендації успішно збережені`)
      console.log(`\n📝 Фрагмент рекомендацій (перші 500 символів):`)
      console.log('─'.repeat(60))
      console.log(recommendations.substring(0, 500) + (recommendations.length > 500 ? '...' : ''))
      console.log('─'.repeat(60))
    }

    console.log(`\n\n✅ Готово! Рекомендації оновлені для користувача ${email}`)
  } catch (error) {
    console.error('❌ Помилка:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
