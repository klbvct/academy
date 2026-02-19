const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkUserData() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'kalabukhov87@gmail.com' }
    })

    if (!user) {
      console.log('User not found')
      return
    }

    console.log('User ID:', user.id)
    console.log('User name:', user.name)

    const results = await prisma.testResult.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        testId: true,
        data: true,
        scores: true,
        completedAt: true
      }
    })

    console.log('\nTest Results:', results.length)
    
    results.forEach((result, index) => {
      console.log(`\n--- Test Result ${index + 1} ---`)
      console.log('ID:', result.id)
      console.log('Test ID:', result.testId)
      console.log('Completed:', result.completedAt)
      
      const data = JSON.parse(result.data || '{}')
      console.log('\nModules in data:')
      Object.keys(data).forEach(key => {
        if (key.startsWith('module')) {
          const moduleData = data[key]
          const answersCount = moduleData ? Object.keys(moduleData).length : 0
          console.log(`  ${key}: ${answersCount} answers`)
          
          // Show first few answers for module4 and module6
          if (key === 'module4' || key === 'module6') {
            console.log(`    Sample answers:`, JSON.stringify(moduleData).substring(0, 200))
          }
        }
      })
      
      const scores = JSON.parse(result.scores || '{}')
      console.log('\nScores keys:', Object.keys(scores))
      console.log('m4_values:', typeof scores.m4_values, scores.m4_values)
      console.log('m6_strongMotivator:', scores.m6_strongMotivator)
      console.log('m6_moderate:', scores.m6_moderate)
      console.log('m6_weak:', scores.m6_weak)
      console.log('m6_demotivator:', scores.m6_demotivator)
      console.log('\nm6_strongMotivatorsList:', JSON.stringify(scores.m6_strongMotivatorsList, null, 2))
      console.log('\nm6_demotivatorsList:', JSON.stringify(scores.m6_demotivatorsList, null, 2))
    })
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUserData()
