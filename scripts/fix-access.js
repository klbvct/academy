const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixAccess() {
  try {
    console.log('🔧 Исправляем доступ для всех пользователей\n')

    // Обновляем все записи TestAccess для обычных пользователей на hasAccess = true
    const result = await prisma.testAccess.updateMany({
      where: {
        user: {
          role: 'user',
        },
      },
      data: {
        hasAccess: true,
        accessGrantedAt: new Date(),
      },
    })

    console.log(`✅ Обновлено записей: ${result.count}`)
    console.log('\n📋 После обновления:\n')

    // Проверяем результат
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

    for (const user of users) {
      const testAccess = await prisma.testAccess.findMany({
        where: {
          userId: user.id,
        },
        select: {
          hasAccess: true,
          test: {
            select: {
              title: true,
            },
          },
        },
      })

      console.log(`👤 ${user.fullName} (${user.email})`)
      testAccess.forEach(access => {
        const status = access.hasAccess ? '✅ Доступен' : '🔒 Нет доступу'
        console.log(`   ${status} - "${access.test.title}"`)
      })
    }
  } catch (error) {
    console.error('❌ Ошибка:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixAccess()
