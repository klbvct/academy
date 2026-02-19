const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testAPI() {
  try {
    const userId = 2
    
    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
      }
    })

    console.log('User:', user)

    // Get test results
    const results = await prisma.testResult.findMany({
      where: { userId },
      include: {
        test: {
          select: {
            id: true,
            title: true,
          }
        }
      }
    })

    console.log('\nTest Results count:', results.length)
    
    results.forEach(result => {
      console.log('\n--- Test:', result.test.title, '---')
      console.log('TestId:', result.testId)
      console.log('CompletedAt:', result.completedAt)
      
      if (result.data) {
        try {
          const data = JSON.parse(result.data)
          console.log('Data keys:', Object.keys(data))
          
          // Check each module
          for (let i = 1; i <= 8; i++) {
            const moduleKey = `module${i}`
            if (data[moduleKey]) {
              const answerCount = Object.keys(data[moduleKey]).length
              console.log(`  ${moduleKey}: ${answerCount} answers`)
              // Show first 3 answer keys
              const keys = Object.keys(data[moduleKey]).slice(0, 3)
              console.log(`    Sample keys: ${keys.join(', ')}`)
            }
          }
        } catch (e) {
          console.log('Error parsing data:', e.message)
        }
      } else {
        console.log('No data')
      }
    })

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testAPI()
