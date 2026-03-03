import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'
import { rateLimit } from '@/lib/rateLimit'

export async function POST(request: NextRequest) {
  // 3 запити за 15 хвилин з одного IP — захист від email спаму
  const rl = rateLimit(request, { limit: 3, windowMs: 15 * 60_000 })
  if (!rl.allowed) {
    return NextResponse.json(
      { success: false, message: 'Забагато спроб. Спробуйте через 15 хвилин.' },
      { status: 429 }
    )
  }

  try {
    const body = await request.json()
    const { email } = body

    // Нормализуем email
    const normalizedEmail = email?.toLowerCase().trim()

    // Валидация
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Будь ласка, введіть правильну email-адресу' },
        { status: 400 }
      )
    }

    // Ищем пользователя по email
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    // Для безопасности не раскрываем, существует ли такой email
    // Всегда отвечаем позитивно
    if (!user) {
      return NextResponse.json(
        { 
          success: true, 
          message: 'Якщо ця email-адреса зареєстрована, ви отримаєте письмо з інструкціями для відновлення пароля.' 
        },
        { status: 200 }
      )
    }

    // Генерируем токен восстановления (32 байта = 64 символа в hex)
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpires = new Date(Date.now() + 3600000) // 1 час

    // Сохраняем токен в БД
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpires,
      },
    })

    // Отправляем письмо
    const emailSent = await sendPasswordResetEmail(
      user.email,
      resetToken,
      user.fullName
    )

    if (!emailSent) {
      console.error('Failed to send password reset email')
      // Очищаем токен, если письмо не отправилось
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: null,
          resetTokenExpires: null,
        },
      })
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Якщо ця email-адреса зареєстрована, ви отримаєте письмо з інструкціями для відновлення пароля.' 
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { success: false, message: 'Помилка на сервері' },
      { status: 500 }
    )
  }
}
