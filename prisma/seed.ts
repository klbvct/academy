import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Удаляем существующие тесты и связанные данные
  await prisma.testResult.deleteMany({})
  await prisma.testAccess.deleteMany({})
  await prisma.question.deleteMany({})
  await prisma.payment.deleteMany({})
  await prisma.test.deleteMany({})

  // Создаем основной тест
  const test = await prisma.test.create({
    data: {
      title: 'Дизайн Освіти',
      description: 'Комплексний тест для визначення вашого напрямку в дизайні освіти',
      category: 'design',
      price: 1,
      duration: 60,
      questionsCount: 40,
    },
  })

  console.log('✓ Тест створено:', test.title)
  console.log(`  ID: ${test.id}`)
  console.log(`  Ціна: ${test.price} грн`)
  console.log(`  Тривалість: ${test.duration} хв`)
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
