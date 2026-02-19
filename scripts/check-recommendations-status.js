/**
 * Скрипт для проверки текущего состояния рекомендаций пользователя
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkRecommendationsStatus(email) {
  try {
    console.log(`\n🔍 Проверка состояния рекомендаций для: ${email}`)
    
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        results: {
          include: {
            test: { select: { title: true } }
          }
        }
      }
    })

    if (!user) {
      console.error(`❌ Пользователь не найден`)
      return
    }

    console.log(`✅ Пользователь: ${user.fullName} (ID: ${user.id})`)
    
    if (user.results.length === 0) {
      console.log(`⚠️  Нет результатов тестирования`)
      return
    }

    for (const result of user.results) {
      console.log(`\n📊 Тест: "${result.test.title}" (ID: ${result.testId})`)
      console.log(`   Завершен: ${result.completedAt}`)
      
      // Детальный анализ поля recommendations
      console.log(`\n   🔎 Анализ поля recommendations:`)
      console.log(`   - Тип: ${typeof result.recommendations}`)
      console.log(`   - Значение null: ${result.recommendations === null}`)
      console.log(`   - Значение undefined: ${result.recommendations === undefined}`)
      
      if (result.recommendations) {
        console.log(`   - Длина: ${result.recommendations.length} символов`)
        console.log(`   - Первые 200 символов: "${result.recommendations.substring(0, 200)}"`)
        
        // Попытка парсинга
        try {
          const parsed = JSON.parse(result.recommendations)
          console.log(`   - ✅ JSON парсится успешно`)
          console.log(`   - Ключи объекта:`, Object.keys(parsed))
          if (parsed.text) {
            console.log(`   - parsed.text (первые 100 символов): "${parsed.text.substring(0, 100)}"`)
          }
          if (parsed.career_paths) {
            console.log(`   - parsed.career_paths: ${parsed.career_paths.length} путей`)
          }
        } catch (err) {
          console.log(`   - ❌ Не является валидным JSON`)
          console.log(`   - Будет обработан как строка: "${result.recommendations}"`)
        }
      } else {
        console.log(`   - ⚠️  Поле пустое (null или undefined)`)
      }
      
      // Проверка наличия scores для генерации
      if (result.scores) {
        const scores = JSON.parse(result.scores)
        const scoreKeys = Object.keys(scores)
        console.log(`\n   📈 Scores доступны: ${scoreKeys.length} ключей`)
        console.log(`   - Ключи модулей:`, scoreKeys.filter(k => k.startsWith('m')).join(', '))
      } else {
        console.log(`\n   ❌ Scores отсутствуют - генерация невозможна`)
      }
    }
    
  } catch (error) {
    console.error('❌ Ошибка:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

const email = process.argv[2] || 'kalabukhov87@gmail.com'

checkRecommendationsStatus(email)
  .then(() => {
    console.log('\n✅ Проверка завершена')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Ошибка:', error)
    process.exit(1)
  })
