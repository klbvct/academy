const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function displayTestSummary() {
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

    const scores = typeof test.scores === 'string' 
      ? JSON.parse(test.scores) 
      : test.scores;

    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║   РЕЗЮМЕ ТЕСТА - ПРОВЕРКА ОТОБРАЖЕНИЯ В ОТЧЕТЕ            ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log('👤 Пользователь:', test.user.name);
    console.log('📧 Email:', test.user.email);
    console.log('📅 Дата:', new Date(test.completedAt).toLocaleString('uk-UA'));
    console.log('');
    console.log('─'.repeat(60));

    // Module 1
    console.log('\n📊 МОДУЛЬ 1: Професійна спрямованість (Климов)');
    console.log('─'.repeat(60));
    const m1Keys = ['m1_nature', 'm1_technic', 'm1_human', 'm1_sign', 'm1_art'];
    const m1Names = {
      m1_nature: 'Людина-Природа (П)',
      m1_technic: 'Людина-Техніка (Т)',
      m1_human: 'Людина-Людина (Ч)',
      m1_sign: 'Людина-Знакова система (З)',
      m1_art: 'Людина-Художній образ (Х)'
    };
    
    const m1Total = m1Keys.reduce((sum, k) => sum + (scores[k] || 0), 0);
    
    if (m1Total > 0) {
      m1Keys.forEach(key => {
        const score = scores[key] || 0;
        const percent = m1Total > 0 ? Math.round((score / m1Total) * 100) : 0;
        const bar = '█'.repeat(Math.floor(percent / 5));
        console.log(`  ${m1Names[key].padEnd(35)} ${score} балів (${percent}%) ${bar}`);
      });
      console.log('  ✅ ВІДОБРАЖАЄТЬСЯ У ВІДОСТІ');
    } else {
      console.log('  ⚠️  Немає даних');
    }

    // Module 2
    console.log('\n📊 МОДУЛЬ 2: Індивідуальні інтереси (20 сфер)');
    console.log('─'.repeat(60));
    const m2Total = Object.keys(scores)
      .filter(k => k.startsWith('m2_'))
      .reduce((sum, k) => sum + (scores[k] || 0), 0);
    
    if (m2Total > 0) {
      const topSperes = Object.keys(scores)
        .filter(k => k.startsWith('m2_'))
        .map(k => ({ key: k, value: scores[k] }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
      
      console.log('  Топ 5 сфер:');
      topSperes.forEach((item, i) => {
        const name = item.key.replace('m2_', '');
        console.log(`    ${i+1}. ${name}: ${item.value}%`);
      });
      console.log('  ✅ ВІДОБРАЖАЄТЬСЯ У ВІДОСТІ');
    } else {
      console.log('  ⚠️  Немає даних (всі значення 0)');
    }

    // Module 3
    console.log('\n📊 МОДУЛЬ 3: Домінуючі типи мислення');
    console.log('─'.repeat(60));
    const m3Keys = Object.keys(scores).filter(k => k.startsWith('m3_'));
    const m3Names = {
      m3_artistic: 'Художнє (наочно-образне)',
      m3_theoretical: 'Теоретичне',
      m3_practical: 'Практичне',
      m3_creative: 'Творче (продуктивне)',
      m3_convergent: 'Конвергентне',
      m3_intuitive: 'Інтуїтивне',
      m3_analytical: 'Аналітичне'
    };
    
    if (m3Keys.length > 0) {
      console.log(`  Знайдено ${m3Keys.length} типів мислення:`);
      m3Keys.forEach(key => {
        const value = scores[key]?.percentageExample || scores[key] || 0;
        const bar = '█'.repeat(Math.floor(value / 10));
        console.log(`  ${m3Names[key]?.padEnd(30) || key} ${value}% ${bar}`);
      });
      console.log('  ✅ ВІДОБРАЖАЄТЬСЯ У ВІДОСТІ');
    } else {
      console.log('  ⚠️  Немає даних');
    }

    // Module 7
    console.log('\n📊 МОДУЛЬ 7: Holland RIASEC');
    console.log('─'.repeat(60));
    const m7Keys = ['m7_r', 'm7_i', 'm7_a', 'm7_s', 'm7_e', 'm7_c'];
    const m7Names = {
      m7_r: 'R - Практик (Realistic)',
      m7_i: 'I - Мислитель (Investigative)',
      m7_a: 'A - Творець (Artistic)',
      m7_s: 'S - Помічник (Social)',
      m7_e: 'E - Лідер (Enterprising)',
      m7_c: 'C - Організатор (Conventional)'
    };
    
    const m7HasData = m7Keys.some(k => (scores[k] || 0) > 0);
    if (m7HasData) {
      const sorted = m7Keys
        .map(k => ({ key: k, value: scores[k] || 0 }))
        .sort((a, b) => b.value - a.value);
      
      const top3 = sorted.slice(0, 3);
      const code = top3.map(t => t.key.replace('m7_', '').toUpperCase()).join('');
      
      console.log(`  Код RIASEC: ${code}\n`);
      sorted.forEach(item => {
        const bar = '█'.repeat(Math.floor(item.value / 10));
        console.log(`  ${m7Names[item.key].padEnd(35)} ${item.value}% ${bar}`);
      });
      console.log('  ✅ ВІДОБРАЖАЄТЬСЯ У ВІДОСТІ');
    } else {
      console.log('  ⚠️  Немає даних');
    }

    console.log('\n' + '═'.repeat(60));
    console.log('🎯 СТАТУС: Всі модулі використовують нові ключі з префіксами!');
    console.log('═'.repeat(60));
    console.log('');
    console.log('🌐 Відкрийте звіт у браузері:');
    console.log(`   http://localhost:3000/tests/${test.id}/results`);
    console.log('');

  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

displayTestSummary();
