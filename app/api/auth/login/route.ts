import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateToken } from '@/lib/jwt'
import bcrypt from 'bcryptjs'
import { rateLimit } from '@/lib/rateLimit'

export async function POST(request: NextRequest) {
  // 10 спроб за 5 хвилин з одного IP
  const rl = rateLimit(request, { limit: 10, windowMs: 5 * 60_000 })
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, message: 'Забагато спроб. Спробуйте через 5 хвилин.' },
      { status: 429 }
    )
  }

  try {
    const { email, password } = await request.json()

    // Нормализуем email
    const normalizedEmail = email?.toLowerCase().trim()

    // Валідація
    if (!normalizedEmail || !password) {
      return NextResponse.json(
        { success: false, message: 'Email та пароль обовязкові' },
        { status: 400 }
      )
    }

    // Пошук користувача
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Невірний email або пароль' },
        { status: 401 }
      )
    }

    // Перевіряємо пароль
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Невірний email або пароль' },
        { status: 401 }
      )
    }

    // Перевіряємо, чи користувач активний
    if (!user.isActive) {
      return NextResponse.json(
        { success: false, message: 'Ваш акаунт заблокований. Зверніться до адміністратора' },
        { status: 403 }
      )
    }

    // Генеруємо JWT токен
    const token = generateToken(user.id, user.email, user.role)

    const response = NextResponse.json({
      success: true,
      message: 'Вхід успішний',
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
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, message: 'Помилка сервера' },
      { status: 500 }
    )
  }
}
