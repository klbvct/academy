const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkRecommendations() {
  try {
    const result = await prisma.testResult.findFirst({
      where: { 
        userId: 1,
        testId: 3 
      },
      select: { 
        recommendations: true 
      }
    })

    if (result && result.recommendations) {
      console.log('Recommendations found!')
      console.log('Type:', typeof result.recommendations)
      console.log('Length:', result.recommendations.length)
      console.log('\n=== FIRST 500 CHARACTERS ===')
      console.log(result.recommendations.substring(0, 500))
      console.log('\n=== PARSED ===')
      try {
        const parsed = JSON.parse(result.recommendations)
        console.log('Parsed successfully!')
        console.log('Text length:', parsed.text?.length || 0)
        console.log('\n=== FIRST 500 CHARS OF TEXT ===')
        console.log(parsed.text?.substring(0, 500) || 'No text')
      } catch (e) {
        console.log('Not JSON, raw string')
      }
    } else {
      console.log('No recommendations found')
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkRecommendations()
