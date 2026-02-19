const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRawData() {
  try {
    const test = await prisma.testResult.findFirst({
      where: {
        user: { email: 'kalabukhov87@gmail.com' }
      },
      include: { user: true }
    });

    if (!test) {
      console.log('❌ Тест не найден');
      return;
    }

    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║   СЫРЫЕ ДАННЫЕ ТЕСТА ИЗ БАЗЫ                              ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('');
    
    console.log('📋 СТРУКТУРА ОБЪЕКТА:');
    console.log(JSON.stringify(Object.keys(test), null, 2));
    
    console.log('\n📊 ЗНАЧЕНИЯ ПОЛЕЙ:\n');
    console.log('id:', test.id);
    console.log('userId:', test.userId);
    console.log('testId:', test.testId);
    console.log('completedAt:', test.completedAt);
    console.log('score:', test.score);
    console.log('');
    console.log('answers type:', typeof test.answers);
    console.log('answers is null:', test.answers === null);
    console.log('answers is undefined:', test.answers === undefined);
    console.log('');
    
    if (test.answers) {
      console.log('answers value preview:');
      const ansStr = String(test.answers);
      console.log(ansStr.substring(0, 500) + (ansStr.length > 500 ? '...' : ''));
    }
    
    console.log('\n');
    console.log('scores type:', typeof test.scores);
    console.log('scores is null:', test.scores === null);
    console.log('scores preview:');
    const scoresStr = String(test.scores);
    console.log(scoresStr.substring(0, 200) + (scoresStr.length > 200 ? '...' : ''));

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkRawData();
