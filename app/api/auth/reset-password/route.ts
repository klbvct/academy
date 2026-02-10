import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { generateToken } from '@/lib/jwt'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, password, confirmPassword } = body

    // Валидация
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Невалідне посилання для відновлення пароля' },
        { status: 400 }
      )
    }

    if (!password || !confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'Будь ласка, введіть пароль' },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'Паролі не збігаються' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Пароль повинен бути не менше 6 символів' },
        { status: 400 }
      )
    }

    // Ищем пользователя с таким токеном
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
      },
    })

    if (!user || !user.resetTokenExpires) {
      return NextResponse.json(
        { success: false, message: 'Невалідне посилання для відновлення пароля' },
        { status: 400 }
      )
    }

    // Проверяем срок действия токена
    if (new Date() > user.resetTokenExpires) {
      // Очищаем токен
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: null,
          resetTokenExpires: null,
        },
      })

      return NextResponse.json(
        { success: false, message: 'Посилання для відновлення пароля закінчилося. Спробуйте ще раз.' },
        { status: 400 }
      )
    }

    // Хешируем новый пароль
    const hashedPassword = await bcrypt.hash(password, 10)

    // Обновляем пароль и очищаем токен
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
      },
    })

    // Генерируем новый JWT токен для автоматической авторизации
    const jwtToken = generateToken(updatedUser.id, updatedUser.email)

    return NextResponse.json(
      {
        success: true,
        message: 'Пароль успішно змінен',
        token: jwtToken,
        user: {
          id: updatedUser.id,
          fullName: updatedUser.fullName,
          email: updatedUser.email,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { success: false, message: 'Помилка на сервері' },
      { status: 500 }
    )
  }
}

// GET endpoint для проверки валидности токена
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Невалідне посилання' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
      },
    })

    if (!user || !user.resetTokenExpires) {
      return NextResponse.json(
        { success: false, message: 'Невалідне посилання' },
        { status: 400 }
      )
    }

    // Проверяем срок действия
    if (new Date() > user.resetTokenExpires) {
      return NextResponse.json(
        { success: false, message: 'Посилання закінчилось' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: true, message: 'Посилання валідне', userName: user.fullName },
      { status: 200 }
    )
  } catch (error) {
    console.error('Token validation error:', error)
    return NextResponse.json(
      { success: false, message: 'Помилка на сервері' },
      { status: 500 }
    )
  }
}
