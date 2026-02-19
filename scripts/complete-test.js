const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const API_URL = 'http://localhost:3000/api';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

async function completeTest() {
  try {
    console.log('=== Система для прохождения теста ===\n');

    // 1. Получаем пользователя
    console.log('1. Поиск пользователя kalabukhov87@gmail.com...');
    const user = await prisma.user.findUnique({
      where: { email: 'kalabukhov87@gmail.com' },
    });

    if (!user) {
      console.log('❌ Пользователь не найден');
      return;
    }
    console.log(`✓ Найден: ${user.fullName} (ID: ${user.id})\n`);

    // 2. Создаем JWT токен
    console.log('2. Создание JWT токена...');
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    console.log(`✓ Токен создан\n`);

    // 3. Получаем список тестов
    console.log('3. Получение списка тестов...');
    const testsRes = await fetch(`${API_URL}/user/tests`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const testsData = await testsRes.json();

    if (!testsData.success || testsData.tests.length === 0) {
      console.log('❌ Тесты не найдены');
      return;
    }

    console.log(`✓ Найдено ${testsData.tests.length} тестов:`);
    testsData.tests.forEach((t) => {
      console.log(`  - ${t.id}: ${t.title} (${t.duration} мин, ${t.questionsCount} вопросов)`);
    });

    // Берем первый тест
    const test = testsData.tests[0];
    console.log(`\n✓ Выбран: ${test.title} (ID: ${test.id})\n`);

    // 4. Проходим все 8 модулей
    console.log('4. Прохождение модулей:');
    for (let module = 1; module <= 8; module++) {
      console.log(`\n   Модуль ${module}:`);

      // Получаем вопросы модуля
      const moduleRes = await fetch(`${API_URL}/tests/modules?module=${module}`);
      const moduleData = await moduleRes.json();

      if (!moduleData.success) {
        console.log(`   ❌ Ошибка загрузки модуля`);
        continue;
      }

      const questions = moduleData.data.questions || moduleData.data.values || [];
      console.log(`   - Загружено ${questions.length} элементов`);

      // Подготавливаем ответы
      const answers = {};
      
      // Если это ranking тип - просто присваиваем случайный порядок
      if (moduleData.data.type === 'ranking') {
        questions.forEach((item, index) => {
          answers[item.number] = index + 1; // Rank от 1 до N
        });
      } else {
        // Для обычных вопросов с a,b,c вариантами
        questions.forEach((q) => {
          const availableAnswers = [];
          if (q.a) availableAnswers.push('a');
          if (q.b) availableAnswers.push('b');
          if (q.c) availableAnswers.push('c');

          if (availableAnswers.length > 0) {
            const randomAnswer = availableAnswers[Math.floor(Math.random() * availableAnswers.length)];
            answers[q.number] = randomAnswer;
          }
        });
      }

      console.log(`   - Подготовлено ${Object.keys(answers).length} ответов`);

      // Отправляем ответы
      const saveRes = await fetch(`${API_URL}/tests/answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          testId: test.id,
          module: module,
          answers: answers,
        }),
      });

      const saveData = await saveRes.json();
      if (saveData.success) {
        console.log(`   ✓ Ответы сохранены`);
      } else {
        console.log(`   ⚠ Ошибка: ${saveData.error}`);
      }
    }

    // 5. Завершаем тест
    console.log(`\n5. Завершение теста...`);
    const completeRes = await fetch(`${API_URL}/tests/${test.id}/complete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({}),
    });

    const completeData = await completeRes.json();
    if (completeData.success) {
      console.log(`✓ Тест завершен!\n`);
    } else {
      console.log(`❌ Ошибка: ${completeData.error}\n`);
      return;
    }

    // 6. Получаем результаты
    console.log('6. Получение результатов:');
    const resultsRes = await fetch(`${API_URL}/tests/${test.id}/results`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const resultsData = await resultsRes.json();
    if (resultsData.success) {
      console.log(`✓ Результаты получены:`);
      console.log(`   Оплачены: ${resultsData.isResultsPaid ? 'ДА' : 'НЕТ'}`);

      if (resultsData.data) {
        console.log(`   Завершено: ${new Date(resultsData.data.completedAt).toLocaleString('uk-UA')}`);
        if (resultsData.data.scores) {
          console.log(`   Оценки: ${JSON.stringify(resultsData.data.scores)}`);
        }
      }
    }

    console.log('\n=== Тест успешно пройден! ===\n');

    // 7. Проверяем статус на дашборде
    console.log('7. Проверка статуса теста на дашборде:');
    const dashRes = await fetch(`${API_URL}/user/tests`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const dashData = await dashRes.json();

    const updatedTest = dashData.tests.find((t) => t.id === test.id);
    if (updatedTest) {
      console.log(`   - Пройден: ${updatedTest.isCompleted ? 'ДА' : 'НЕТ'}`);
      console.log(`   - Оплачены результаты: ${updatedTest.resultsPaid ? 'ДА' : 'НЕТ'}`);
    }

    console.log('\n✓ Все готово!');
  } catch (error) {
    console.error('Ошибка:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Ждем загрузки сервера и запускаем
setTimeout(() => {
  completeTest();
}, 2000);
