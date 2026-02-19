const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function clearRecommendations() {
  try {
    // Find correct test result for kalabukhov87@gmail.com
    const user = await prisma.user.findUnique({
      where: { email: 'kalabukhov87@gmail.com' },
      include: {
        results: {
          where: { testId: 1 }
        }
      }
    })

    if (!user || user.results.length === 0) {
      console.log('❌ Test not found')
      return
    }

    const testResult = user.results[0]

    console.log(`✅ Found test result:`)
    console.log(`   User: ${user.fullName}`)
    console.log(`   Test ID: ${testResult.testId}`)
    console.log(`   Result ID: ${testResult.id}`)
    console.log(`   Has recommendations: ${!!testResult.recommendations}`)

    // Clear recommendations
    await prisma.testResult.update({
      where: { id: testResult.id },
      data: { recommendations: null }
    })

    console.log('\n✅ Recommendations cleared!')
    console.log(`\n📌 Open: http://localhost:3000/tests/1/results`)
    console.log('   Recommendations will auto-generate when page loads')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

clearRecommendations()
