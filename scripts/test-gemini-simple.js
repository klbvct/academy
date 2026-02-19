/**
 * Simple Gemini AI Connection Test (no dependencies)
 * Run: node scripts/test-gemini-simple.js
 */

const fs = require('fs')
const path = require('path')

// Read .env file manually
const envPath = path.join(__dirname, '..', '.env')
const envContent = fs.readFileSync(envPath, 'utf8')
const envLines = envContent.split('\n')
let apiKey = null

for (const line of envLines) {
  if (line.startsWith('GEMINI_API_KEY=')) {
    apiKey = line.split('=')[1].trim()
    break
  }
}

async function testConnection() {
  console.log('🔍 Testing Gemini AI connection...\n')

  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in .env')
    process.exit(1)
  }

  console.log('✅ GEMINI_API_KEY found:', apiKey.substring(0, 10) + '...')
  console.log('📦 Using model: gemini-2.5-flash\n')

  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai')
    const genAI = new GoogleGenerativeAI(apiKey)
    const modelInstance = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    console.log('🤖 Sending test request...')
    const result = await modelInstance.generateContent('Say "Hello, I am working!" in Ukrainian')
    const response = await result.response
    const text = response.text()

    console.log('✅ Success! Gemini responded:')
    console.log(`\n"${text}"\n`)
    console.log('🎉 Gemini AI is configured correctly!')
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message)
    if (error.message.includes('API_KEY_INVALID')) {
      console.log('\n🔑 API key is invalid or expired')
      console.log('Get a new one: https://aistudio.google.com/app/apikey')
    } else if (error.message.includes('quota')) {
      console.log('\n⚠️ API quota exceeded')
    } else {
      console.log('\nFull error:', error)
    }
    process.exit(1)
  }
}

testConnection()
