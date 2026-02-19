/**
 * Скрипт для очистки AI-рекомендаций у конкретного пользователя
 * Это позволит автоматически сгенерировать их заново при следующем просмотре результатов
 * 
 * Использование:
 * node scripts/regenerate-recommendations.js kalabukhov87@gmail.com
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function regenerateRecommendations(email) {
  try {
    console.log(`\n🔍 Поиск пользователя: ${email}`)
    
    // Найти пользователя по email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        results: {
          include: {
            test: {
              select: { title: true }
            }
          }
        }
      }
    })

    if (!user) {
      console.error(`❌ Пользователь с email ${email} не найден`)
      return
    }

    console.log(`✅ Найден пользователь: ${user.fullName} (ID: ${user.id})`)
    
    if (user.results.length === 0) {
      console.log(`⚠️  У пользователя нет результатов тестирования`)
      return
    }

    console.log(`\n📊 Найдено результатов тестирования: ${user.results.length}`)
    
    // Для каждого результата
    for (const result of user.results) {
      console.log(`\n📝 Тест: "${result.test.title}" (ID: ${result.testId})`)
      console.log(`   Дата завершения: ${result.completedAt}`)
      
      // Проверяем текущее состояние recommendations
      let hasRecommendations = false
      if (result.recommendations) {
        try {
          const parsed = JSON.parse(result.recommendations)
          hasRecommendations = !!parsed.text || !!parsed.career_paths
          console.log(`   Текущие рекомендации: ${hasRecommendations ? '✅ Есть' : '⚠️  Пустые'}`)
        } catch {
          hasRecommendations = !!result.recommendations
          console.log(`   Текущие рекомендации: ${hasRecommendations ? '✅ Есть (строка)' : '⚠️  Пустые'}`)
        }
      } else {
        console.log(`   Текущие рекомендации: ❌ Отсутствуют`)
      }

      // Очищаем recommendations для регенерации
      await prisma.testResult.update({
        where: {
          userId_testId: {
            userId: user.id,
            testId: result.testId
          }
        },
        data: {
          recommendations: null
        }
      })
      
      console.log(`   ✅ Рекомендации очищены - при следующем просмотре будут сгенерированы заново`)
    }

    console.log(`\n✨ Готово! При следующем просмотре результатов AI автоматически сгенерирует новые рекомендации.`)
    
  } catch (error) {
    console.error('❌ Ошибка:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Получаем email из аргументов командной строки
const email = process.argv[2]

if (!email) {
  console.error('❌ Использование: node scripts/regenerate-recommendations.js <email>')
  console.error('Пример: node scripts/regenerate-recommendations.js kalabukhov87@gmail.com')
  process.exit(1)
}

regenerateRecommendations(email)
  .then(() => {
    console.log('\n✅ Скрипт выполнен успешно')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Ошибка выполнения скрипта:', error)
    process.exit(1)
  })
