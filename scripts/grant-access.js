const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function grantAccess() {
  try {
    console.log('Предоставляем доступ пользователю kalabukhov87@gmail.com ко всем тестам...\n');

    // Получаем пользователя
    const user = await prisma.user.findUnique({
      where: { email: 'kalabukhov87@gmail.com' },
    });

    if (!user) {
      console.log('❌ Пользователь не найден');
      return;
    }

    // Получаем все тесты
    const tests = await prisma.test.findMany();

    // Создаем TestAccess для каждого теста
    for (const test of tests) {
      const existing = await prisma.testAccess.findFirst({
        where: {
          userId: user.id,
          testId: test.id,
        },
      });

      if (existing) {
        console.log(`✓ ${test.title} - уже есть доступ`);
      } else {
        await prisma.testAccess.create({
          data: {
            userId: user.id,
            testId: test.id,
            hasAccess: true,
            accessGrantedAt: new Date(),
          },
        });
        console.log(`✓ ${test.title} - доступ предоставлен`);
      }
    }

    console.log('\n✓ Готово!');
  } finally {
    await prisma.$disconnect();
  }
}

grantAccess();
