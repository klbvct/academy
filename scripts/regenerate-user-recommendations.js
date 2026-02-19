const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function regenerateUserRecommendations(email) {
  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log(`❌ User with email ${email} not found`);
      await prisma.$disconnect();
      return;
    }

    console.log(`✅ Found user: ${user.name} (${email})`);

    // Find all tests for this user
    const tests = await prisma.testResult.findMany({
      where: { userId: user.id },
      orderBy: { completedAt: 'desc' }
    });

    console.log(`\n📊 Found ${tests.length} tests for this user:`);
    tests.forEach((test, idx) => {
      const hasRec = test.recommendations ? '✅ Has recommendations' : '❌ No recommendations';
      console.log(`${idx + 1}. Test ID: ${test.id} | Completed: ${new Date(test.completedAt).toLocaleDateString('uk-UA')} | ${hasRec}`);
    });

    if (tests.length === 0) {
      console.log('No tests found for this user');
      await prisma.$disconnect();
      return;
    }

    // Get the latest test (first one since ordered by desc)
    const latestTest = tests[0];
    console.log(`\n🔄 Clearing recommendations for latest test (ID: ${latestTest.id})...`);

    // Clear recommendations
    await prisma.testResult.update({
      where: { id: latestTest.id },
      data: { recommendations: null }
    });

    console.log(`✅ Recommendations cleared for test ID ${latestTest.id}`);
    console.log(`\n📌 Next steps:`);
    console.log(`1. Open results page: /tests/${latestTest.id}/results`);
    console.log(`2. The recommendations will auto-generate when page loads`);
    console.log(`3. Or click "Завантажити рекомендації" button to manually trigger generation`);

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Get email from command line argument
const email = process.argv[2];
if (!email) {
  console.error('❌ Usage: node regenerate-user-recommendations.js <email>');
  process.exit(1);
}

regenerateUserRecommendations(email);
