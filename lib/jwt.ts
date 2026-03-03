import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set. Please add it to your .env file.')
}

const JWT_SECRET = process.env.JWT_SECRET as string

export interface DecodedToken {
  userId: number
  email: string
  role?: string
  iat?: number
  exp?: number
}

/**
 * Проверяет и декодирует JWT токен
 */
export function verifyToken(token: string): DecodedToken | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    return decoded as DecodedToken
  } catch (error) {
    return null
  }
}

/**
 * Генерирует новый JWT токен
 */
export function generateToken(userId: number, email: string, role?: string): string {
  return jwt.sign(
    { userId, email, role: role || 'user' },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

/**
 * Получает токен из заголовка Authorization
 */
export function getTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) return null
  
  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null
  }
  
  return parts[1]
}

/**
 * Перевіряє токен і повертає користувача з БД.
 * Гарантує що користувач існує і не заблокований (isActive).
 * Використовуйте для ендпоінтів де потрібна актуальна перевірка статусу.
 */
export async function verifyTokenAndUser(token: string) {
  const decoded = verifyToken(token)
  if (!decoded) return null

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: { id: true, email: true, role: true, isActive: true },
  })

  if (!user || !user.isActive) return null

  return user
}
