const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Маппинг старых ключей на новые с префиксами
const keyMapping = {
  // Модуль 1
  'nature': 'm1_nature',
  'technic': 'm1_technic',
  'human': 'm1_human',
  'sign': 'm1_sign',
  'artVector': 'm1_art',
  
  // Модуль 2
  'naturalScience': 'm2_naturalScience',
  'engineering': 'm2_engineering',
  'robotics': 'm2_robotics',
  'physics': 'm2_physics',
  'mathematics': 'm2_mathematics',
  'it': 'm2_it',
  'business': 'm2_business',
  'humanities': 'm2_humanities',
  'journalism': 'm2_journalism',
  'social': 'm2_social',
  'creative': 'm2_creative',
  'education': 'm2_education',
  'law': 'm2_law',
  'medicine': 'm2_medicine',
  'art': 'm2_art',
  'hospitality': 'm2_hospitality',
  'agriculture': 'm2_agriculture',
  'construction': 'm2_construction',
  'transport': 'm2_transport',
  'sports': 'm2_sports',
  
  // Модуль 3 - Thinking types
  'artistic': 'm3_artistic',
  'theoretical': 'm3_theoretical',
  'practical': 'm3_practical',
  'convergent': 'm3_convergent',
  'intuitive': 'm3_intuitive',
  'analytical': 'm3_analytical',
  
  // Модуль 4 - Life values
  'values': 'm4_values',
  
  // Модуль 5 - Gardner Intelligences
  'linguistic': 'm5_linguistic',
  'logicalMathematical': 'm5_logicalMathematical',
  'spatial': 'm5_spatial',
  'bodilyKinesthetic': 'm5_bodilyKinesthetic',
  'musical': 'm5_musical',
  'interpersonal': 'm5_interpersonal',
  'intrapersonal': 'm5_intrapersonal',
  'naturalistic': 'm5_naturalistic',
  
  // Модуль 6 - Motivation
  'strongMotivator': 'm6_strongMotivator',
  'moderate': 'm6_moderate',
  'weak': 'm6_weak',
  'demotivator': 'm6_demotivator',
  
  // Модуль 7 - Holland RIASEC
  'r': 'm7_r',
  'i': 'm7_i',
  'a': 'm7_a',
  's': 'm7_s',
  'e': 'm7_e',
  'c': 'm7_c',
  
  // Модуль 8 - Perception types
  'visual': 'm8_visual',
  'auditory': 'm8_auditory',
  'kinesthetic': 'm8_kinesthetic',
  'digital': 'm8_digital',
}

async function migrateScores() {
  try {
    console.log('🔄 Начало миграции ключей scores...\n')
    
    // Получаем все результаты тестов
    const allResults = await prisma.testResult.findMany()
    
    console.log(`📊 Найдено ${allResults.length} результатов тестов\n`)
    
    let migratedCount = 0
    
    for (const result of allResults) {
      const oldScores = typeof result.scores === 'string'
        ? JSON.parse(result.scores)
        : result.scores
      
      const newScores = {}
      let hasChanges = false
      
      // Мигрируем ключи
      for (const [oldKey, value] of Object.entries(oldScores)) {
        if (keyMapping[oldKey]) {
          newScores[keyMapping[oldKey]] = value
          hasChanges = true
        } else if (oldKey.startsWith('m1_') || oldKey.startsWith('m2_') || oldKey.startsWith('m3_') || 
                   oldKey.startsWith('m4_') || oldKey.startsWith('m5_') || oldKey.startsWith('m6_') || 
                   oldKey.startsWith('m7_') || oldKey.startsWith('m8_')) {
          // Уже мигрирован
          newScores[oldKey] = value
        } else {
          // Неизвестный ключ - оставляем как есть
          newScores[oldKey] = value
          console.log(`⚠️  Неизвестный ключ: ${oldKey} (оставлен без изменений)`)
        }
      }
      
      if (hasChanges) {
        await prisma.testResult.update({
          where: { id: result.id },
          data: {
            scores: JSON.stringify(newScores),
          },
        })
        migratedCount++
        console.log(`✅ Мигрирован результат ID: ${result.id}`)
      }
    }
    
    console.log(`\n🎉 Миграция завершена!`)
    console.log(`   Обновлено записей: ${migratedCount}`)
    console.log(`   Пропущено (уже мигрированы): ${allResults.length - migratedCount}`)
    
  } catch (error) {
    console.error('❌ Ошибка миграции:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

migrateScores()
