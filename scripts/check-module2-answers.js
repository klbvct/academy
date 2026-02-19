const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkModule2Answers() {
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
    console.log('║   МОДУЛЬ 2 - ОТВЕТЫ В БАЗЕ ДАННЫХ                         ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log('👤 Пользователь:', test.user.email);
    console.log('📅 Дата теста:', new Date(test.completedAt).toLocaleString('uk-UA'));
    console.log('');

    if (!answers.module2) {
      console.log('⚠️  Модуль 2: НЕ НАЙДЕН в базе данных');
      console.log('\n📋 Доступные модули:');
      Object.keys(answers).forEach(key => {
        const answerCount = Object.keys(answers[key] || {}).length;
        console.log(`   ${key}: ${answerCount} ответов`);
      });
      return;
    }

    const module2 = answers.module2;
    const answersList = Object.entries(module2);
    
    console.log(`✅ НАЙДЕНО ОТВЕТОВ: ${answersList.length}`);
    console.log('');
    console.log('─'.repeat(60));

    if (answersList.length === 0) {
      console.log('⚠️  Ответы отсутствуют (пусто)');
    } else {
      console.log('\n📝 ВСЕ ОТВЕТЫ:\n');
      
      // Group by answer type
      const byType = {};
      answersList.forEach(([qId, answer]) => {
        const type = answer === 'a' ? 'A' : answer === 'b' ? 'B' : answer === 'c' ? 'C' : answer === 'd' ? 'D' : String(answer);
        if (!byType[type]) byType[type] = [];
        byType[type].push(qId);
      });

      answersList.forEach(([qId, answer], i) => {
        console.log(`  Q${qId.padStart(3)}: ${answer}`);
        if ((i + 1) % 10 === 0) console.log('');
      });

      console.log('\n' + '─'.repeat(60));
      console.log('\n📊 СТАТИСТИКА:\n');
      console.log(`  Вариант A: ${byType['a']?.length || 0} ответов`);
      console.log(`  Вариант B: ${byType['b']?.length || 0} ответов`);
      console.log(`  Вариант C: ${byType['c']?.length || 0} ответов`);
      console.log(`  Вариант D: ${byType['d']?.length || 0} ответов`);
      console.log(`  Другое:    ${Object.keys(byType).filter(t => !['a','b','c','d'].includes(t)).reduce((sum, t) => sum + byType[t].length, 0)} ответов`);

      console.log('\n' + '─'.repeat(60));
      console.log('\n📈 РЕЗУЛЬТАТЫ СКОРИНГА:\n');
      
      const scores = typeof test.scores === 'string' 
        ? JSON.parse(test.scores) 
        : test.scores;

      const spheres = [
        'm2_naturalScience', 'm2_engineering', 'm2_robotics', 'm2_physics',
        'm2_mathematics', 'm2_it', 'm2_business', 'm2_humanities',
        'm2_journalism', 'm2_social', 'm2_creative', 'm2_education',
        'm2_law', 'm2_medicine', 'm2_art', 'm2_hospitality',
        'm2_agriculture', 'm2_construction', 'm2_transport', 'm2_sports'
      ];

      const sphereNames = {
        'm2_naturalScience': 'Природничі науки',
        'm2_engineering': 'Інженерія',
        'm2_robotics': 'Робототехніка',
        'm2_physics': 'Фізика',
        'm2_mathematics': 'Математика',
        'm2_it': 'IT',
        'm2_business': 'Бізнес',
        'm2_humanities': 'Гуманітарні науки',
        'm2_journalism': 'Журналістика',
        'm2_social': 'Соціальні науки',
        'm2_creative': 'Креативні індустрії',
        'm2_education': 'Освіта',
        'm2_law': 'Право',
        'm2_medicine': 'Медицина',
        'm2_art': 'Мистецтво',
        'm2_hospitality': 'Готельно-ресторанна справа',
        'm2_agriculture': 'Аграрні науки',
        'm2_construction': 'Будівництво',
        'm2_transport': 'Транспорт',
        'm2_sports': 'Спорт'
      };

      const sorted = spheres
        .map(key => ({
          key,
          name: sphereNames[key],
          score: scores[key] || 0
        }))
        .sort((a, b) => b.score - a.score);

      sorted.forEach((item, i) => {
        const bar = '█'.repeat(Math.floor(item.score / 5));
        console.log(`  ${String(i+1).padStart(2)}. ${item.name.padEnd(30)} ${String(item.score).padStart(3)}% ${bar}`);
      });
    }

    console.log('\n' + '═'.repeat(60));

  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkModule2Answers();
