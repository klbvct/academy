/**
 * Test Gemini AI Connection
 * Run: node scripts/test-gemini.js
 */

require('dotenv').config({ path: '.env.local' })

async function testConnection() {
  console.log('🔍 Testing Gemini AI connection...\n')

  // Check environment variables
  const apiKey = process.env.GEMINI_API_KEY
  const model = process.env.GEMINI_MODEL || 'gemini-1.5-flash'

  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in .env.local')
    console.log('\n📝 Steps to fix:')
    console.log('1. Copy .env.local.example to .env.local')
    console.log('2. Get API key from: https://aistudio.google.com/app/apikey')
    console.log('3. Add it to .env.local as GEMINI_API_KEY=your_key_here')
    process.exit(1)
  }

  console.log('✅ GEMINI_API_KEY found')
  console.log(`📦 Using model: ${model}\n`)

  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai')
    const genAI = new GoogleGenerativeAI(apiKey)
    const modelInstance = genAI.getGenerativeModel({ model })

    console.log('🤖 Sending test request...')
    const result = await modelInstance.generateContent('Say "Hello, I am working!" in Ukrainian')
    const response = await result.response
    const text = response.text()

    console.log('✅ Success! Gemini responded:')
    console.log(`\n"${text}"\n`)
    console.log('🎉 Gemini AI is configured correctly!')
    console.log('\n📊 You can now generate career recommendations in your app.')
    
    return true
  } catch (error) {
    console.error('❌ Connection failed:', error.message)
    console.log('\n📝 Common issues:')
    console.log('- Invalid API key')
    console.log('- Network connection problems')
    console.log('- API quota exceeded')
    console.log('- Model not available in your region')
    console.log('\n🔗 Check: https://aistudio.google.com/app/apikey')
    return false
  }
}

testConnection()
  .then(success => {
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
