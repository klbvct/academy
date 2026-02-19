/**
 * Gemini AI Integration for Career Recommendations
 * Generates personalized career path recommendations based on test results
 */

import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = process.env.GEMINI_API_KEY
const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'

if (!apiKey) {
  console.warn('GEMINI_API_KEY not configured. AI recommendations will be unavailable.')
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null

interface TestScores {
  // Module 1: Professional Vector
  m1_nature?: number
  m1_technic?: number
  m1_person?: number
  m1_signSystem?: number
  m1_artistic?: number

  // Module 2: Interests
  m2_naturalScience?: number
  m2_engineering?: number
  m2_humanities?: number
  m2_art?: number
  m2_sports?: number
  m2_economics?: number

  // Module 3: Thinking Types
  m3_artistic?: number
  m3_theoretical?: number
  m3_practical?: number
  m3_creative?: number
  m3_convergent?: number
  m3_intuitive?: number
  m3_analytical?: number

  // Module 4: Values
  m4_values?: Record<string, number>

  // Module 5: Intelligences
  m5_linguistic?: number
  m5_logicalMathematical?: number
  m5_spatial?: number
  m5_musicalRhythmic?: number
  m5_bodilyKinesthetic?: number
  m5_interpersonal?: number
  m5_intrapersonal?: number
  m5_naturalistic?: number

  // Module 6: Motivation
  m6_strongMotivator?: number
  m6_moderate?: number
  m6_weak?: number
  m6_demotivator?: number

  // Module 7: Holland RIASEC
  m7_r?: number
  m7_i?: number
  m7_a?: number
  m7_s?: number
  m7_e?: number
  m7_c?: number

  // Module 8: Perception Types
  m8_visual?: number
  m8_auditory?: number
  m8_kinesthetic?: number
  m8_digital?: number
}

interface CareerPath {
  direction: string
  type: string
  majors: string[]
  minors: string[]
}

interface RecommendationsOutput {
  text: string
}

/**
 * Build detailed analysis prompt from test scores
 */
function buildAnalysisPrompt(scores: TestScores): string {
  const analysis: string[] = []

  // Helper function to safely extract numeric value
  const getValue = (val: any): number => {
    if (typeof val === 'number') return val
    if (val && typeof val === 'object' && 'percentageExample' in val) return val.percentageExample || 0
    return 0
  }

  // Module 1: Professional Vector
  if (scores.m1_nature || scores.m1_technic || scores.m1_person || scores.m1_signSystem || scores.m1_artistic) {
    analysis.push(`\nПРОФЕСІЙНА СПРЯМОВАНІСТЬ (Модуль 1):`)
    if (scores.m1_nature) analysis.push(`- Природа: ${scores.m1_nature}%`)
    if (scores.m1_technic) analysis.push(`- Техніка: ${scores.m1_technic}%`)
    if (scores.m1_person) analysis.push(`- Людина: ${scores.m1_person}%`)
    if (scores.m1_signSystem) analysis.push(`- Знакові системи: ${scores.m1_signSystem}%`)
    if (scores.m1_artistic) analysis.push(`- Художній образ: ${scores.m1_artistic}%`)
  }

  // Module 2: Interests
  if (scores.m2_naturalScience || scores.m2_engineering || scores.m2_humanities) {
    analysis.push(`\nІНТЕРЕСИ ТА ЗДІБНОСТІ (Модуль 2):`)
    if (scores.m2_naturalScience) analysis.push(`- Природничі науки: ${scores.m2_naturalScience}%`)
    if (scores.m2_engineering) analysis.push(`- Інженерія та технології: ${scores.m2_engineering}%`)
    if (scores.m2_humanities) analysis.push(`- Гуманітарні науки: ${scores.m2_humanities}%`)
    if (scores.m2_art) analysis.push(`- Мистецтво: ${scores.m2_art}%`)
    if (scores.m2_sports) analysis.push(`- Спорт: ${scores.m2_sports}%`)
    if (scores.m2_economics) analysis.push(`- Економіка та бізнес: ${scores.m2_economics}%`)
  }

  // Module 3: Thinking Types
  if (scores.m3_theoretical || scores.m3_practical || scores.m3_creative) {
    analysis.push(`\nТИПИ МИСЛЕННЯ (Модуль 3):`)
    if (scores.m3_artistic) analysis.push(`- Художнє: ${getValue(scores.m3_artistic)}%`)
    if (scores.m3_theoretical) analysis.push(`- Теоретичне: ${getValue(scores.m3_theoretical)}%`)
    if (scores.m3_practical) analysis.push(`- Практичне: ${getValue(scores.m3_practical)}%`)
    if (scores.m3_creative) analysis.push(`- Творче: ${getValue(scores.m3_creative)}%`)
    if (scores.m3_analytical) analysis.push(`- Аналітичне: ${getValue(scores.m3_analytical)}%`)
  }

  // Module 4: Values
  if (scores.m4_values) {
    analysis.push(`\nЦІННІСНІ ОРІЄНТИРИ (Модуль 4):`)
    const topValues = Object.entries(scores.m4_values)
      .sort(([, a], [, b]) => (a as number) - (b as number))
      .slice(0, 5)
    topValues.forEach(([key, rank]) => {
      analysis.push(`- ${key}: пріоритет ${rank}`)
    })
  }

  // Module 5: Intelligences
  if (scores.m5_linguistic || scores.m5_logicalMathematical) {
    analysis.push(`\nТИПИ ІНТЕЛЕКТУ (Модуль 5 - Gardner):`)
    const intelligences = [
      { name: 'Лінгвістичний', score: scores.m5_linguistic },
      { name: 'Логіко-математичний', score: scores.m5_logicalMathematical },
      { name: 'Просторовий', score: scores.m5_spatial },
      { name: 'Музичний', score: scores.m5_musicalRhythmic },
      { name: 'Кінестетичний', score: scores.m5_bodilyKinesthetic },
      { name: 'Міжособистісний', score: scores.m5_interpersonal },
      { name: 'Внутрішньоособистісний', score: scores.m5_intrapersonal },
      { name: 'Натуралістичний', score: scores.m5_naturalistic },
    ]
      .filter((i) => i.score)
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 3)
    intelligences.forEach((i) => analysis.push(`- ${i.name}: ${i.score}/9`))
  }

  // Module 7: Holland RIASEC
  if (scores.m7_r !== undefined || scores.m7_i !== undefined) {
    analysis.push(`\nHOLLAND RIASEC (Модуль 7):`)
    const holland = [
      { type: 'R (Realistic)', score: scores.m7_r, desc: 'Практик' },
      { type: 'I (Investigative)', score: scores.m7_i, desc: 'Дослідник' },
      { type: 'A (Artistic)', score: scores.m7_a, desc: 'Творець' },
      { type: 'S (Social)', score: scores.m7_s, desc: 'Помічник' },
      { type: 'E (Enterprising)', score: scores.m7_e, desc: 'Лідер' },
      { type: 'C (Conventional)', score: scores.m7_c, desc: 'Організатор' },
    ]
      .filter((h) => h.score !== undefined)
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 3)
    holland.forEach((h) => analysis.push(`- ${h.type} (${h.desc}): ${h.score}`))
  }

  // Module 8: Perception
  if (scores.m8_visual || scores.m8_auditory) {
    analysis.push(`\nТИПИ СПРИЙНЯТТЯ (Модуль 8):`)
    const perception = [
      { name: 'Візуальне', score: scores.m8_visual },
      { name: 'Аудіальне', score: scores.m8_auditory },
      { name: 'Кінестетичне', score: scores.m8_kinesthetic },
      { name: 'Дигітальне', score: scores.m8_digital },
    ]
      .filter((p) => p.score)
      .sort((a, b) => (b.score || 0) - (a.score || 0))
    const total = perception.reduce((sum, p) => sum + (p.score || 0), 0)
    perception.forEach((p) => {
      const percent = total > 0 ? ((p.score || 0) / total * 100).toFixed(1) : 0
      analysis.push(`- ${p.name}: ${p.score} (${percent}%)`)
    })
  }

  return analysis.join('\n')
}

/**
 * Generate career recommendations using Gemini AI
 */
export async function generateCareerRecommendations(
  scores: TestScores,
  userName?: string
): Promise<RecommendationsOutput | null> {
  if (!genAI) {
    console.error('Gemini AI not configured')
    return null
  }

  try {
    const modelInstance = genAI.getGenerativeModel({
      model,
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
      },
    })

    const analysisText = buildAnalysisPrompt(scores)
    const nameContext = userName ? `для ${userName}` : ''

    const prompt = `Ти професійний кар'єрний консультант. Проаналізуй результати тестування та надай професійні рекомендації.

РЕЗУЛЬТАТИ ТЕСТУВАННЯ:
${analysisText}

ВАЖЛИВО: НЕ аналізуй кожен модуль окремо. Натомість, на основі УСІХ результатів, запропонуй конкретні професійні напрямки.

Починай відповідь ОДРАЗУ з "Пріоритетні професійні напрямки". БЕЗ привітань, БЕЗ вступу, БЕЗ пояснень.

Структуруй відповідь ТІЛЬКИ так:

1. Пріоритетні професійні напрямки

Напрямок 1: Назва галузі та спеціальностей
Чому цей напрямок найкраще підходить на основі результатів
Можливі посади та кар'єрний розвиток:

Напрямок 2: ...
Напрямок 3: ...
Напрямок 4: ...
Напрямок 5: ...

2. Альтернативні професійні напрямки

Напрямок 6: Назва галузі та спеціальностей
Чому цей напрямок може бути цікавим

Напрямок 7: ...
Напрямок 8: ...
Напрямок 9: ...

Пиши детально для КОЖНОГО напрямку. Обґрунтовуй конкретними показниками з результатів, але НЕ переписуй модулі.`

    const result = await modelInstance.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    console.log(`Gemini raw response length: ${text.length}`)
    console.log(`Gemini raw response (first 200 chars): ${text.substring(0, 200)}`)

    const recommendations: RecommendationsOutput = {
      text: text
    }

    console.log(`Generated recommendations with ${text.length} characters`)
    return recommendations

  } catch (error) {
    console.error('Error generating recommendations:', error)
    return null
  }
}

/**
 * Test function to validate Gemini API connection
 */
export async function testGeminiConnection(): Promise<boolean> {
  if (!genAI) {
    console.error('Gemini API key not configured')
    return false
  }

  try {
    const modelInstance = genAI.getGenerativeModel({ model })
    const result = await modelInstance.generateContent('Test connection. Reply with "OK".')
    const response = await result.response
    console.log('Gemini API connection successful:', response.text())
    return true
  } catch (error) {
    console.error('Gemini API connection failed:', error)
    return false
  }
}
