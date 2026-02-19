const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkUserTests() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'kalabukhov87@gmail.com' },
      include: {
        results: {
          orderBy: { completedAt: 'desc' },
          take: 5
        }
      }
    })

    if (!user) {
      console.log('❌ User not found')
      return
    }

    console.log('✅ User:', user.fullName)
    console.log('📧 Email:', user.email)
    console.log('🆔 User ID:', user.id)
    console.log('\n📊 Tests:')
    
    if (user.results.length === 0) {
      console.log('  No tests found')
    } else {
      user.results.forEach(t => {
        console.log(`  • Test ID: ${t.testId}`)
        console.log(`    Completed: ${new Date(t.completedAt).toLocaleDateString('uk-UA')}`)
        console.log(`    Has recommendations: ${t.recommendations ? '✅ Yes' : '❌ No'}`)
        console.log(`    URL: http://localhost:3000/tests/${t.testId}/results`)
        console.log('')
      })
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUserTests()
