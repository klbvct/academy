const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAllAnswers() {
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

    const answers = typeof test.answers === 'string' 
      ? JSON.parse(test.answers) 
      : test.answers;

    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║   СТРУКТУРА ОТВЕТОВ В БАЗЕ ДАННЫХ                         ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log('👤 Пользователь:', test.user.email);
    console.log('📅 Дата теста:', new Date(test.completedAt).toLocaleString('uk-UA'));
    console.log('');

    console.log('📋 СТРУКТУРА ANSWERS (модули):\n');
    
    if (!answers || typeof answers !== 'object') {
      console.log('❌ Ответы не являются объектом');
      console.log('Type:', typeof answers);
      return;
    }

    const modules = Object.keys(answers);
    console.log(`Всего ключей: ${modules.length}\n`);

    modules.forEach(key => {
      const value = answers[key];
      const type = typeof value;
      let description = '';
      
      if (type === 'object' && value !== null) {
        const itemCount = Object.keys(value).length;
        description = `${itemCount} элементов`;
      } else {
        description = `тип: ${type}`;
      }
      
      console.log(`  ✓ ${key.padEnd(20)} - ${description}`);
    });

    // Now check if module2 exists
    console.log('\n' + '─'.repeat(60));
    console.log('\n📊 ДЕТАЛИ МОДУЛЯ 2:\n');

    if (answers.module2) {
      console.log('✅ МОДУЛЬ 2 НАЙДЕН');
      const m2Keys = Object.keys(answers.module2);
      console.log(`Ответов: ${m2Keys.length}`);
      
      if (m2Keys.length > 0) {
        console.log('\nПервые 10 ответов:');
        m2Keys.slice(0, 10).forEach((qId, i) => {
          console.log(`  Q${qId.padStart(3)}: ${answers.module2[qId]}`);
        });
        
        if (m2Keys.length > 10) {
          console.log(`  ... и ещё ${m2Keys.length - 10} ответов`);
        }
      }
    } else {
      console.log('❌ МОДУЛЬ 2 НЕ НАЙДЕН в answers');
      console.log('\nВозможные альтернативы:');
      
      // Look for anything with "2" or "module" in the name
      modules.forEach(key => {
        if (key.toLowerCase().includes('2') || key.toLowerCase().includes('module')) {
          console.log(`  - Возможно? ${key}`);
        }
      });
    }

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllAnswers();
