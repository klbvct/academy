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

    // Якщо користувач не знайдений но це admin email - створюємо його
    if (!user) {
      const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim()
      if (normalizedEmail === adminEmail) {
        // Автоматично створюємо адміна при першому вході
        const hashedPassword = await bcrypt.hash(password, 10)
        user = await prisma.user.create({
          data: {
            fullName: 'Адміністратор',
            email: normalizedEmail,
            password: hashedPassword,
            role: 'admin',
          },
        })
      } else {
        return NextResponse.json(
          { success: false, message: 'Користувач не знайдений' },
          { status: 401 }
        )
      }
    }

    // Перевіряємо пароль
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Невірний пароль' },
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
    const token = generateToken(user.id, user.email)

    return NextResponse.json({
      success: true,
      message: 'Вхід успішний',
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, message: 'Помилка сервера' },
      { status: 500 }
    )
  }
}
