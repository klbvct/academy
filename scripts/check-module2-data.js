const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkModule2Data() {
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

    const data = typeof test.data === 'string' 
      ? JSON.parse(test.data) 
      : test.data;

    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║   МОДУЛЬ 2 - ОТВЕТЫ В ПОЛЕ DATA                           ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log('👤 Пользователь:', test.user.email);
    console.log('📅 Дата теста:', new Date(test.completedAt).toLocaleString('uk-UA'));
    console.log('');

    if (!data) {
      console.log('❌ Поле data пусто');
      return;
    }

    console.log('📋 ДОСТУПНЫЕ МОДУЛИ:\n');
    const modules = Object.keys(data);
    modules.forEach(key => {
      const value = data[key];
      const type = typeof value;
      let description = '';
      
      if (type === 'object' && value !== null) {
        const itemCount = Object.keys(value).length;
        description = `${itemCount} ответов`;
      } else {
        description = `тип: ${type}`;
      }
      
      console.log(`  ✓ ${key.padEnd(20)} - ${description}`);
    });

    // Check module 2
    console.log('\n' + '─'.repeat(60));
    console.log('\n📊 ДЕТАЛИ МОДУЛЯ 2:\n');

    if (!data.module2) {
      console.log('❌ МОДУЛЬ 2 НЕ НАЙДЕН');
      return;
    }

    const module2 = data.module2;
    const m2Keys = Object.keys(module2);
    
    console.log(`✅ МОДУЛЬ 2 НАЙДЕН`);
    console.log(`📝 Всего ответов: ${m2Keys.length}\n`);

    if (m2Keys.length === 0) {
      console.log('⚠️  Ответы отсутствуют (пусто)');
    } else {
      // Group by answer
      const byAnswer = {};
      m2Keys.forEach(qId => {
        const ans = module2[qId];
        if (!byAnswer[ans]) byAnswer[ans] = [];
        byAnswer[ans].push(qId);
      });

      console.log('📈 СТАТИСТИКА ОТВЕТОВ:\n');
      Object.keys(byAnswer).sort().forEach(answer => {
        const count = byAnswer[answer].length;
        const pct = Math.round((count / m2Keys.length) * 100);
        const bar = '█'.repeat(Math.floor(pct / 5));
        console.log(`  Ответ "${answer}": ${count} вопросов (${pct}%) ${bar}`);
      });

      console.log('\n' + '─'.repeat(60));
      console.log('\n📝 ВСЕ ОТВЕТЫ:\n');
      
      const sorted = m2Keys.sort((a, b) => parseInt(a) - parseInt(b));
      sorted.forEach((qId, i) => {
        const ans = module2[qId];
        process.stdout.write(`Q${qId.padStart(3)}: ${ans}  `);
        if ((i + 1) % 8 === 0) console.log('');
      });
      console.log('\n');

      // Calculate expected scores
      const scores = typeof test.scores === 'string' 
        ? JSON.parse(test.scores) 
        : test.scores;

      console.log('─'.repeat(60));
      console.log('\n📊 РАССЧЁТНЫЕ БАЛЛЫ ПО МОДУЛЮ 2:\n');
      
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

      const sorted2 = spheres
        .map(key => ({
          key,
          name: sphereNames[key],
          score: scores[key] || 0
        }))
        .sort((a, b) => b.score - a.score);

      console.log('Топ 10 сфер:\n');
      sorted2.slice(0, 10).forEach((item, i) => {
        const bar = '█'.repeat(Math.floor(item.score / 5));
        console.log(`  ${String(i+1).padStart(2)}. ${item.name.padEnd(30)} ${String(item.score).padStart(3)}% ${bar}`);
      });

      const hasZero = sorted2.filter(s => s.score === 0).length;
      if (hasZero > 0) {
        console.log(`\n⚠️  Сфер с 0%: ${hasZero}`);
      }
    }

    console.log('\n' + '═'.repeat(60));

  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

checkModule2Data();
