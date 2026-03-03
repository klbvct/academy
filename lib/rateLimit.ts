/**
 * Simple in-memory rate limiter for Next.js API routes.
 * Resets on server restart — suitable for single-instance deployments.
 *
 * Usage:
 *   const result = rateLimit(request, { limit: 5, windowMs: 60_000 })
 *   if (!result.allowed) return NextResponse.json({ message: '...' }, { status: 429 })
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Очищаємо протухлі записи кожні 5 хвилин
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    store.forEach((entry, key) => {
      if (now > entry.resetAt) store.delete(key)
    })
  }, 5 * 60_000)
}

interface RateLimitOptions {
  /** Максимальна кількість запитів у вікні */
  limit: number
  /** Розмір вікна в мілісекундах */
  windowMs: number
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

export function rateLimit(
  request: Request,
  options: RateLimitOptions
): RateLimitResult {
  const { limit, windowMs } = options
  const now = Date.now()

  // Ключ: IP + URL path (щоб login і register мали окремі лічильники)
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  const path = new URL(request.url).pathname
  const key = `${ip}:${path}`

  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    // Нове або протухле вікно
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs }
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count++
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt }
}
