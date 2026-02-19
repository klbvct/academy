const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkOldFormat() {
  try {
    const results = await prisma.testResult.findMany({
      where: { recommendations: { not: null } },
      select: { recommendations: true, id: true }
    })

    console.log(`Всего записей с рекомендациями: ${results.length}`)

    let oldFormat = 0
    let newFormat = 0

    results.forEach(r => {
      try {
        const rec = typeof r.recommendations === 'string' 
          ? JSON.parse(r.recommendations) 
          : r.recommendations
        
        if (rec && rec.career_paths) {
          oldFormat++
          console.log(`  ID ${r.id}: старый формат (career_paths)`)
        } else if (rec && rec.text) {
          newFormat++
        }
      } catch (e) {
        // ignore
      }
    })

    console.log(`\nИтого:`)
    console.log(`  Старый формат (career_paths): ${oldFormat}`)
    console.log(`  Новый формат (text): ${newFormat}`)
    console.log(`\n${oldFormat > 0 ? '⚠️ Таблицу удалять НЕЛЬЗЯ - есть старые данные' : '✅ Таблицу можно удалить - все рекомендации в новом формате'}`)

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkOldFormat()
