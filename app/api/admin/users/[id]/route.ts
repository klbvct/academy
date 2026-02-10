import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, getTokenFromHeader } from '@/lib/jwt'

// GET - получить пользователя
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = getTokenFromHeader(authHeader)

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Не авторизовано' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Невалідний токен' },
        { status: 401 }
      )
    }

    // Проверяем, является ли пользователь администратором
    const admin = await prisma.user.findUnique({
      where: { id: decoded.userId },
    })

    if (!admin || admin.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Доступ запрещен' },
        { status: 403 }
      )
    }

    // Проверяем, не заблокирован ли администратор
    if (!admin.isActive) {
      return NextResponse.json(
        { success: false, message: 'Ваш акаунт заблокирован' },
        { status: 403 }
      )
    }

    const userId = parseInt(params.id)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        birthDate: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Користувач не знайдений' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { success: false, message: 'Помилка на сервері' },
      { status: 500 }
    )
  }
}

// PATCH - обновить пользователя
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = getTokenFromHeader(authHeader)

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Не авторизовано' },
        { status: 401 }
      )
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json(
        { success: false, message: 'Невалідний токен' },
        { status: 401 }
      )
    }

    // Проверяем, является ли пользователь администратором
    const admin = await prisma.user.findUnique({
      where: { id: decoded.userId },
    })

    if (!admin || admin.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Доступ запрещен' },
        { status: 403 }
      )
    }

    // Проверяем, не заблокирован ли администратор
    if (!admin.isActive) {
      return NextResponse.json(
        { success: false, message: 'Ваш акаунт заблокирован' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { isActive, role, fullName, email, phone, birthDate } = body
    const userId = parseInt(params.id)

    // Подготавливаем данные для обновления
    const updateData: any = {}
    
    if (isActive !== undefined) updateData.isActive = isActive
    if (role !== undefined) updateData.role = role
    if (fullName !== undefined) updateData.fullName = fullName
    if (email !== undefined) updateData.email = email?.toLowerCase().trim()
    if (phone !== undefined) updateData.phone = phone
    if (birthDate !== undefined) updateData.birthDate = birthDate ? new Date(birthDate) : null

    // Если меняется email, проверяем что он не используется
    if (email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      })

      if (existingUser && existingUser.id !== userId) {
        return NextResponse.json(
          { success: false, message: 'Цей email вже використовується' },
          { status: 400 }
        )
      }
    }

    // Обновляем пользователя
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        birthDate: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json(
      { success: true, user: updatedUser },
      { status: 200 }
    )
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json(
      { success: false, message: 'Помилка на сервері' },
      { status: 500 }
    )
  }
}
