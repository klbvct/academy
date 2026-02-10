import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

function generateToken(userId: number, email: string): string {
  return jwt.sign(
    { userId, email },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export async function POST(request: NextRequest) {
  try {
    const { fullName, email, password, birthDate, phone } = await request.json()

    // Нормализуем email
    const normalizedEmail = email?.toLowerCase().trim()

    // Валідація
    if (!fullName || !normalizedEmail || !password || !phone) {
      return NextResponse.json(
        { success: false, message: 'Всі поля обовязкові' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Пароль повинен мати мінімум 6 символів' },
        { status: 400 }
      )
    }

    // Перевірка чи користувач вже існує
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Користувач з такою email вже існує' },
        { status: 400 }
      )
    }

    // Хешуємо пароль
    const hashedPassword = await bcrypt.hash(password, 10)

    // Визначаємо роль (адмін або звичайний користувач)
    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim()
    const role = normalizedEmail === adminEmail ? 'admin' : 'user'

    // Створюємо користувача
    const user = await prisma.user.create({
      data: {
        fullName,
        email: normalizedEmail,
        password: hashedPassword,
        birthDate: birthDate ? new Date(birthDate) : null,
        phone,
        role,
      },
    })

    // Якщо це звичайний користувач, створюємо записи TestAccess для всіх тестів
    if (role === 'user') {
      const tests = await prisma.test.findMany({
        select: { id: true },
      })

      // Створюємо статус доступу "Не доступен" для кожного тесту
      if (tests.length > 0) {
        await prisma.testAccess.createMany({
          data: tests.map(test => ({
            userId: user.id,
            testId: test.id,
            hasAccess: false,
          })),
        })
      }
    }

    // Генеруємо JWT токен
    const token = generateToken(user.id, user.email)

    return NextResponse.json({
      success: true,
      message: 'Користувач успішно зареєстрований',
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { success: false, message: 'Помилка сервера' },
      { status: 500 }
    )
  }
}
