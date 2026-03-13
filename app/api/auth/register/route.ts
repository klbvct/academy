import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateToken } from '@/lib/jwt'
import bcrypt from 'bcryptjs'
import { rateLimit } from '@/lib/rateLimit'

export async function POST(request: NextRequest) {
  // 5 реєстрацій за 10 хвилин з одного IP
  const rl = rateLimit(request, { limit: 5, windowMs: 10 * 60_000 })
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, message: 'Забагато спроб. Спробуйте через 10 хвилин.' },
      { status: 429 }
    )
  }

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

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Пароль повинен мати мінімум 8 символів' },
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

    // Створюємо користувача
    const user = await prisma.user.create({
      data: {
        fullName,
        email: normalizedEmail,
        password: hashedPassword,
        birthDate: birthDate ? new Date(birthDate) : null,
        phone,
        role: 'user',
      },
    })

    // Якщо це звичайний користувач, створюємо записи TestAccess для всіх тестів
    if (user.role === 'user') {
      const tests = await prisma.test.findMany({
        select: { id: true },
      })

      // Доступ до тестів закритий до оплати
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
    const token = generateToken(user.id, user.email, user.role)

    const response = NextResponse.json({
      success: true,
      message: 'Користувач успішно зареєстрований',
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    })

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { success: false, message: 'Помилка сервера' },
      { status: 500 }
    )
  }
}
