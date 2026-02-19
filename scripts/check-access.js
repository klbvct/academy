const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkUserAccess() {
  try {
    console.log('🔍 Проверка доступа пользователей к тестам\n')

    // Получаем всех пользователей
    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
      },
    })

    console.log(`Всего пользователей: ${users.length}\n`)

    for (const user of users) {
      console.log(`👤 ${user.fullName} (${user.email}) - ID: ${user.id}`)

      // Получаем доступ к тестам
      const testAccess = await prisma.testAccess.findMany({
        where: {
          userId: user.id,
        },
        select: {
          id: true,
          testId: true,
          hasAccess: true,
          accessGrantedAt: true,
          test: {
            select: {
              title: true,
            },
          },
        },
      })

      if (testAccess.length === 0) {
        console.log('   ❌ Нет записей о доступе к тестам')
      } else {
        testAccess.forEach(access => {
          const status = access.hasAccess ? '✅ Доступен' : '🔒 Нет доступу'
          const grantedDate = access.accessGrantedAt 
            ? new Date(access.accessGrantedAt).toLocaleDateString('uk-UA')
            : 'N/A'
          console.log(`   ${status} - Тест: "${access.test.title}" (ID: ${access.testId})`)
          console.log(`      Выдан: ${grantedDate}`)
        })
      }

      // Получаем результаты тестов
      const results = await prisma.testResult.findMany({
        where: {
          userId: user.id,
        },
        select: {
          id: true,
          testId: true,
          completedAt: true,
          test: {
            select: {
              title: true,
            },
          },
        },
      })

      if (results.length > 0) {
        console.log('   📊 Результаты:')
        results.forEach(result => {
          const completedDate = result.completedAt
            ? new Date(result.completedAt).toLocaleDateString('uk-UA', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })
            : 'N/A'
          console.log(`      - "${result.test.title}" завершен: ${completedDate}`)
        })
      }

      // Получаем платежи
      const payments = await prisma.payment.findMany({
        where: {
          userId: user.id,
          type: 'results',
        },
        select: {
          id: true,
          testId: true,
          status: true,
          completedAt: true,
          test: {
            select: {
              title: true,
            },
          },
        },
      })

      if (payments.length > 0) {
        console.log('   💰 Платежи:')
        payments.forEach(payment => {
          const statusMap = {
            success: '✅ Оплачено',
            pending: '⏳ В обробці',
            failed: '❌ Не вдалось',
            unpaid: '❌ Не оплачено',
          }
          const paidDate = payment.completedAt
            ? new Date(payment.completedAt).toLocaleDateString('uk-UA')
            : 'N/A'
          console.log(
            `      - "${payment.test.title}": ${statusMap[payment.status] || payment.status} (${paidDate})`
          )
        })
      }

      console.log('---\n')
    }

    // Статистика
    console.log('📈 Статистика:')
    const totalAccess = await prisma.testAccess.count()
    const accessGranted = await prisma.testAccess.count({
      where: { hasAccess: true },
    })
    const resultSubmitted = await prisma.testResult.count({
      where: {
        completedAt: {
          not: null,
        },
      },
    })
    const paymentsPaid = await prisma.payment.count({
      where: {
        type: 'results',
        status: 'success',
      },
    })

    console.log(`- Всього записей доступа: ${totalAccess}`)
    console.log(`- Активный доступ: ${accessGranted}`)
    console.log(`- Завершенных тестов: ${resultSubmitted}`)
    console.log(`- Оплачено результатов: ${paymentsPaid}`)
  } catch (error) {
    console.error('❌ Ошибка:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUserAccess()
