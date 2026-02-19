const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function grantAllAccess() {
  try {
    console.log('🔧 Выдаём доступ ко всем тестам всем пользователям\n')

    // Получаем всех пользователей (кроме админов)
    const users = await prisma.user.findMany({
      where: {
        role: 'user',
      },
      select: {
        id: true,
        fullName: true,
        email: true,
      },
    })

    // Получаем все тесты
    const tests = await prisma.test.findMany({
      select: { id: true, title: true },
    })

    console.log(`👥 Пользователей: ${users.length}`)
    console.log(`📋 Тестов: ${tests.length}\n`)

    if (users.length === 0 || tests.length === 0) {
      console.log('⚠️ Нет пользователей или тестов')
      return
    }

    let createdCount = 0
    let skippedCount = 0

    for (const user of users) {
      for (const test of tests) {
        // Проверяем, существует ли уже доступ
        const existing = await prisma.testAccess.findFirst({
          where: {
            userId: user.id,
            testId: test.id,
          },
        })

        if (existing) {
          skippedCount++
          continue
        }

        // Создаем доступ
        await prisma.testAccess.create({
          data: {
            userId: user.id,
            testId: test.id,
            hasAccess: true,
            accessGrantedAt: new Date(),
          },
        })

        createdCount++
        console.log(
          `✅ ${user.fullName} (${user.email}) -> "${test.title}"`
        )
      }
    }

    console.log(`\n📊 Результат:`)
    console.log(`✅ Создано: ${createdCount}`)
    console.log(`⏭️  Пропущено (уже есть): ${skippedCount}`)
    console.log(`📈 Всего: ${createdCount + skippedCount}`)
  } catch (error) {
    console.error('❌ Ошибка:', error)
  } finally {
    await prisma.$disconnect()
  }
}

grantAllAccess()
