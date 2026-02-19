/**
 * List available Gemini models
 * Run: node scripts/list-gemini-models.js
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

async function listModels() {
  console.log('🔍 Listing available Gemini models...\n')

  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in .env')
    process.exit(1)
  }

  console.log('✅ GEMINI_API_KEY found:', apiKey.substring(0, 10) + '...\n')

  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai')
    const genAI = new GoogleGenerativeAI(apiKey)
    
    console.log('📋 Fetching model list...\n')
    
    // Try to list models
    const models = await genAI.listModels()
    
    console.log('✅ Available models:')
    for (const model of models) {
      console.log(`  - ${model.name}`)
      console.log(`    Display name: ${model.displayName}`)
      console.log(`    Supported methods: ${model.supportedGenerationMethods?.join(', ')}\n`)
    }
    
  } catch (error) {
    console.error('❌ Failed to list models:', error.message)
    console.log('\n⚠️ This might indicate:')
    console.log('- Invalid or expired API key')
    console.log('- API key without proper permissions')
    console.log('- Network/firewall issues')
    console.log('\n🔗 Get a new key: https://aistudio.google.com/app/apikey')
    console.log('\nFull error:', error)
  }
}

listModels()
