const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkTests() {
  try {
    const tests = await prisma.test.findMany();
    
    console.log(`Всего тестов в БД: ${tests.length}\n`);
    tests.forEach(t => {
      console.log(`ID: ${t.id} | Название: ${t.title} | Вопросов: ${t.questionsCount}`);
    });

    // Удаляем тесты с ID 2 и 3 (новые тесты, которые мы добавили)
    if (tests.length > 1) {
      console.log('\nУдаляем тесты 2 и 3...');
      
      await prisma.test.deleteMany({
        where: {
          id: {
            in: [2, 3]
          }
        }
      });

      console.log('✓ Удалены новые тесты\n');

      // Проверяем что осталось
      const remaining = await prisma.test.findMany();
      console.log(`Осталось тестов: ${remaining.length}`);
      remaining.forEach(t => {
        console.log(`- ${t.id}: ${t.title}`);
      });
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkTests();
