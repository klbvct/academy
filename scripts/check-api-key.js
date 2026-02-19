/**
 * Check Gemini API Key validity via direct HTTP request
 * Run: node scripts/check-api-key.js
 */

const fs = require('fs')
const path = require('path')
const https = require('https')

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

async function checkApiKey() {
  console.log('🔍 Checking Gemini API key validity...\n')

  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in .env')
    process.exit(1)
  }

  console.log('✅ GEMINI_API_KEY found:', apiKey.substring(0, 10) + '...\n')

  // Try to list models using v1 API (not v1beta)
  const url = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`

  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = ''

      res.on('data', (chunk) => {
        data += chunk
      })

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data)
          
          if (res.statusCode === 200 && parsed.models) {
            console.log('✅ API key is VALID!\n')
            console.log(`📋 Found ${parsed.models.length} available models:\n`)
            
            parsed.models.forEach((model, idx) => {
              console.log(`${idx + 1}. ${model.name}`)
              if (model.displayName) {
                console.log(`   Display: ${model.displayName}`)
              }
              if (model.supportedGenerationMethods) {
                console.log(`   Methods: ${model.supportedGenerationMethods.join(', ')}`)
              }
              console.log()
            })

            // Recommend a model
            const flashModel = parsed.models.find(m => m.name.includes('flash'))
            const proModel = parsed.models.find(m => m.name.includes('pro'))
            
            console.log('\n💡 Recommended model:')
            if (flashModel) {
              console.log(`   ${flashModel.name.replace('models/', '')}`)
              console.log('   Update .env: GEMINI_MODEL=' + flashModel.name.replace('models/', ''))
            } else if (proModel) {
              console.log(`   ${proModel.name.replace('models/', '')}`)
              console.log('   Update .env: GEMINI_MODEL=' + proModel.name.replace('models/', ''))
            } else if (parsed.models[0]) {
              console.log(`   ${parsed.models[0].name.replace('models/', '')}`)
              console.log('   Update .env: GEMINI_MODEL=' + parsed.models[0].name.replace('models/', ''))
            }

            resolve(true)
          } else {
            console.error('❌ API key is INVALID or has issues')
            console.error(`Status: ${res.statusCode}`)
            console.error(`Response: ${data}\n`)
            
            if (parsed.error) {
              console.error('Error details:', parsed.error.message)
            }

            console.log('\n📝 Steps to fix:')
            console.log('1. Get a new API key: https://aistudio.google.com/app/apikey')
            console.log('2. Update .env file: GEMINI_API_KEY=your_new_key')
            console.log('3. Restart your development server')
            
            resolve(false)
          }
        } catch (e) {
          console.error('❌ Failed to parse response:', e.message)
          console.error('Raw response:', data)
          reject(e)
        }
      })
    }).on('error', (err) => {
      console.error('❌ Network error:', err.message)
      reject(err)
    })
  })
}

checkApiKey().catch(console.error)
