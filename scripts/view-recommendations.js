/**
 * Script: Check recommendations for a user
 * Usage: node scripts/view-recommendations.js <email>
 */

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]

  if (!email) {
    console.error('❌ Помилка: Вкажіть email користувача')
    console.log('Usage: node scripts/view-recommendations.js <email>')
    process.exit(1)
  }

  console.log(`\n📊 Перегляд рекомендацій для: ${email}`)
  console.log('═'.repeat(70))

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

    console.log(`\n✅ Користувач: ${user.fullName}`)
    console.log(`📧 Email: ${user.email}`)
    console.log(`ID: ${user.id}`)

    // Process each test result
    for (const result of user.results) {
      console.log(`\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
      console.log(`📋 Тест: ${result.test.title}`)
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)

      if (!result.completedAt) {
        console.log('⚠️  Тест не завершено')
        continue
      }

      console.log(`Завершено: ${new Date(result.completedAt).toLocaleString('uk-UA')}`)

      // Get recommendations
      let recommendations = null
      if (result.recommendations) {
        try {
          // Try to parse as JSON
          recommendations = JSON.parse(result.recommendations)
        } catch (e) {
          // It's just a string
          recommendations = result.recommendations
        }
      }

      if (!recommendations) {
        console.log('❌ Рекомендації не згенеровані')
        continue
      }

      console.log('\n✅ РЕКОМЕНДАЦІЇ ЗГЕНЕРОВАНІ:')
      console.log('─'.repeat(70))
      
      // If it's an object, display it formatted
      if (typeof recommendations === 'object') {
        console.log(JSON.stringify(recommendations, null, 2))
      } else {
        // Display text recommendations
        console.log(recommendations)
      }
      
      console.log('─'.repeat(70))
      
      if (typeof recommendations === 'string') {
        console.log(`\n📊 Довжина рекомендацій: ${recommendations.length} символів`)
      }
    }

    console.log(`\n\n✅ Готово!`)
  } catch (error) {
    console.error('❌ Помилка:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
