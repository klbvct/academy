const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function triggerRecalculation() {
  try {
    const test = await prisma.testResult.findFirst({
      where: {
        user: { email: 'kalabukhov87@gmail.com' }
      }
    });

    if (!test) {
      console.log('❌ Тест не найден');
      return;
    }

    console.log('✅ Найден тест ID:', test.id);
    console.log('\n📝 Для пересчета результатов запустите:');
    console.log(`   node scripts/complete-test.js ${test.id}`);
    console.log('\n💡 Или откройте страницу результатов в браузере:\n');
    console.log(`   http://localhost:3000/tests/${test.id}/results`);
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

triggerRecalculation();
