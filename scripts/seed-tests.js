const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const tests = [
  {
    id: 1,
    title: 'Профорієнтаційний тест',
    description: 'Визначте вашу ідеальну професію на основі ваших навичок та інтересів',
    price: 0,
    duration: 45,
    questionsCount: 80,
  },
  {
    id: 2,
    title: 'Тест навичок та компетенцій',
    description: 'Оцініть ваш рівень професійних навичок',
    price: 0,
    duration: 40,
    questionsCount: 60,
  },
  {
    id: 3,
    title: 'Тест особистості',
    description: 'Дізнайтеся більше про вашу особистість та характер',
    price: 0,
    duration: 35,
    questionsCount: 50,
  },
];

async function seed() {
  try {
    console.log('Проверяем существующие тесты...');
    const existingTests = await prisma.test.findMany();
    
    if (existingTests.length > 0) {
      console.log(`✓ Тесты уже существуют (${existingTests.length} шт)`);
      console.log('Тесты:');
      existingTests.forEach(t => {
        console.log(`  - ${t.id}: ${t.title}`);
      });
      return;
    }

    console.log('Добавляем тесты...');
    for (const test of tests) {
      await prisma.test.create({
        data: {
          title: test.title,
          description: test.description,
          price: test.price,
          duration: test.duration,
          questionsCount: test.questionsCount,
        },
      });
      console.log(`✓ Добавлен: ${test.title}`);
    }

    console.log('✓ Все тесты успешно добавлены');
  } catch (error) {
    console.error('Ошибка при добавлении тестов:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
