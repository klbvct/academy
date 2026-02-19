import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

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
