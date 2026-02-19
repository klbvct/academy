const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Import scorers
const { calculateModule1 } = require('../lib/scorers/module1-professional-vector.ts');
const { calculateModule2 } = require('../lib/scorers/module2-individual-interests.ts');
const { calculateModule3 } = require('../lib/scorers/module3-thinking-types.ts');
const { calculateModule4 } = require('../lib/scorers/module4-life-values.ts');
const { calculateModule5 } = require('../lib/scorers/module5-gardner-intelligences.ts');
const { calculateModule6 } = require('../lib/scorers/module6-motivation.ts');
const { calculateModule7 } = require('../lib/scorers/module7-holland-riasec.ts');
const { calculateModule8 } = require('../lib/scorers/module8-perception-types.ts');

async function recalculateAll() {
  try {
    console.log('🔄 Начинаем пересчет всех тестов...\n');

    // Get all completed tests
    const tests = await prisma.testResult.findMany({
      where: {
        completedAt: { not: null }
      },
      include: {
        user: true
      }
    });

    console.log(`📊 Найдено тестов для пересчета: ${tests.length}\n`);

    let updated = 0;
    let errors = 0;

    for (const test of tests) {
      try {
        console.log(`\n👤 Обрабатываем тест пользователя: ${test.user.email}`);
        
        const answers = typeof test.data === 'string' 
          ? JSON.parse(test.data) 
          : test.data;

        const scores = {};

        // Calculate all modules
        if (answers.module1) {
          const m1 = calculateModule1(answers.module1);
          Object.assign(scores, m1);
          console.log('  ✅ Module 1:', Object.keys(m1).join(', '));
        }

        if (answers.module2) {
          const m2 = calculateModule2(answers.module2);
          Object.assign(scores, m2);
          console.log('  ✅ Module 2: 20 spheres calculated');
        }

        if (answers.module3) {
          const m3 = calculateModule3(answers.module3);
          Object.assign(scores, m3);
          console.log('  ✅ Module 3:', Object.keys(m3).join(', '));
        }

        if (answers.module4) {
          const m4 = calculateModule4(answers.module4);
          Object.assign(scores, m4);
          console.log('  ✅ Module 4:', Object.keys(m4).join(', '));
        }

        if (answers.module5) {
          const m5 = calculateModule5(answers.module5);
          Object.assign(scores, m5);
          console.log('  ✅ Module 5:', Object.keys(m5).join(', '));
        }

        if (answers.module6) {
          const m6 = calculateModule6(answers.module6);
          Object.assign(scores, m6);
          console.log('  ✅ Module 6:', Object.keys(m6).join(', '));
        }

        // Module 7: Check for both old format (answers.module7) and new format (module7_q1, module7_q2, ...)
        const hasModule7Old = answers.module7 && Object.keys(answers.module7).length > 0;
        const hasModule7New = Object.keys(answers).some(k => k.startsWith('module7_q'));
        
        if (hasModule7New || hasModule7Old) {
          // Use new format if available, otherwise fallback to old
          const m7Data = hasModule7New ? answers : answers.module7;
          const m7 = calculateModule7(m7Data);
          Object.assign(scores, m7);
          console.log('  ✅ Module 7:', Object.keys(m7).join(', '));
        }

        if (answers.module8) {
          const m8 = calculateModule8(answers.module8);
          Object.assign(scores, m8);
          console.log('  ✅ Module 8:', Object.keys(m8).join(', '));
        }

        // Update test result
        await prisma.testResult.update({
          where: { id: test.id },
          data: {
            scores: JSON.stringify(scores)
          }
        });

        console.log(`  💾 Результаты сохранены`);
        updated++;

      } catch (err) {
        console.error(`  ❌ Ошибка при обработке теста ID ${test.id}:`, err.message);
        errors++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎉 Пересчет завершен!');
    console.log(`✅ Обновлено: ${updated}`);
    console.log(`❌ Ошибок: ${errors}`);
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Критическая ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

recalculateAll();
