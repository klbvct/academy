const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkScores() {
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

    console.log('👤 User:', test.user.email);
    console.log('📅 Completed:', test.completedAt);
    
    const scores = typeof test.scores === 'string' 
      ? JSON.parse(test.scores) 
      : test.scores;

    console.log('\n📊 Score keys в базе данных:');
    console.log('─'.repeat(50));
    
    // Group by module
    const modules = {
      'Module 1': [],
      'Module 2': [],
      'Module 3': [],
      'Module 4': [],
      'Module 5': [],
      'Module 6': [],
      'Module 7': [],
      'Module 8': [],
      'Other': []
    };

    Object.keys(scores).sort().forEach(key => {
      if (key.startsWith('m1_')) modules['Module 1'].push(key);
      else if (key.startsWith('m2_')) modules['Module 2'].push(key);
      else if (key.startsWith('m3_')) modules['Module 3'].push(key);
      else if (key.startsWith('m4_')) modules['Module 4'].push(key);
      else if (key.startsWith('m5_')) modules['Module 5'].push(key);
      else if (key.startsWith('m6_')) modules['Module 6'].push(key);
      else if (key.startsWith('m7_')) modules['Module 7'].push(key);
      else if (key.startsWith('m8_')) modules['Module 8'].push(key);
      else modules['Other'].push(key);
    });

    for (const [module, keys] of Object.entries(modules)) {
      if (keys.length > 0) {
        console.log(`\n✅ ${module} (${keys.length} keys):`);
        keys.forEach(k => {
          const value = scores[k];
          const displayValue = typeof value === 'object' 
            ? JSON.stringify(value) 
            : value;
          console.log(`   ${k}: ${displayValue}`);
        });
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`📈 Всего ключей: ${Object.keys(scores).length}`);

  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkScores();
