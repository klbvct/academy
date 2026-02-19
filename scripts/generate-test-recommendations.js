const { PrismaClient } = require('@prisma/client')
const { generateCareerRecommendations } = require('../lib/gemini')

const prisma = new PrismaClient()

async function generateForTest() {
  try {
    // Get test result with scores
    const testResult = await prisma.testResult.findFirst({
      where: { 
        userId: 1,
        testId: 3 
      },
      include: {
        user: true
      }
    })

    if (!testResult) {
      console.log('❌ Test result not found')
      return
    }

    console.log('✅ Found test result for:', testResult.user.fullName)
    console.log('📊 Generating recommendations...')

    const recommendations = await generateCareerRecommendations(
      testResult.scores,
      testResult.user.fullName
    )

    if (!recommendations) {
      console.log('❌ Failed to generate recommendations')
      return
    }

    console.log('✅ Recommendations generated!')
    console.log('\n=== FIRST 500 CHARACTERS ===')
    console.log(recommendations.text.substring(0, 500))
    console.log('\n=== CHECKING FORMAT ===')
    
    const lines = recommendations.text.split('\n').slice(0, 20)
    lines.forEach((line, idx) => {
      const trimmed = line.trim()
      if (trimmed) {
        console.log(`Line ${idx}: "${trimmed.substring(0, 60)}..."`)
      }
    })

    // Save to database
    await prisma.testResult.update({
      where: { id: testResult.id },
      data: {
        recommendations: JSON.stringify(recommendations)
      }
    })

    console.log('\n✅ Saved to database!')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

generateForTest()
