const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'test@gmail.com' },
      include: { 
        results: {
          select: {
            id: true,
            testId: true,
            completedAt: true,
            scores: true
          }
        }
      }
    });
    
    if (!user) {
      console.log('❌ Пользователь test@gmail.com не найден');
    } else {
      console.log('✅ Пользователь найден:');
      console.log('ID:', user.id);
      console.log('Имя:', user.fullName);
      console.log('Email:', user.email);
      console.log('Роль:', user.role);
      console.log('Статус:', user.isActive ? 'Активный' : 'Блокирован');
      console.log('');
      if (user.results && user.results.length > 0) {
        console.log('✅ ПРОХОДИЛ ТЕСТИРОВАНИЕ:');
        user.results.forEach((result, i) => {
          console.log(`  Тест ${i+1}:`);
          console.log(`    - Результат ID: ${result.id}`);
          console.log(`    - Тест ID: ${result.testId}`);
          console.log(`    - Дата прохождения: ${new Date(result.completedAt).toLocaleDateString('uk-UA')}`);
          console.log(`    - Оценки: ${result.scores}`);
        });
      } else {
        console.log('❌ НЕ ПРОХОДИЛ ТЕСТИРОВАНИЕ');
      }
    }
  } catch (error) {
    console.error('Ошибка:', error.message);
  } finally {
    await prisma.$disconnect();
  }
})();
