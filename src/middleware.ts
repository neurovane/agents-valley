import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_REQUESTS_PER_WINDOW = 60 // 60 requests per minute

// In-memory store for rate limiting
// In production, use Redis or a proper distributed cache
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

// Paths that require stricter rate limiting
const STRICT_PATHS = [
  '/api/auth',
  '/api/comments',
  '/api/upvotes',
]

// Paths that require authentication
const PROTECTED_PATHS = [
  '/publish',
  '/profile',
]

function getRateLimitKey(request: NextRequest): string {
  // Use IP address as the rate limit key
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             request.headers.get('cf-connecting-ip') ||
             'unknown'
  return `ratelimit:${ip}`
}

function checkRateLimit(key: string, maxRequests: number): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const record = rateLimitStore.get(key)

  if (!record || now > record.resetAt) {
    // Create new record or reset expired one
    const resetAt = now + RATE_LIMIT_WINDOW
    rateLimitStore.set(key, { count: 1, resetAt })
    return { allowed: true, remaining: maxRequests - 1, resetAt }
  }

  if (record.count >= maxRequests) {
    // Rate limit exceeded
    return { allowed: false, remaining: 0, resetAt: record.resetAt }
  }

  // Increment count
  record.count++
  rateLimitStore.set(key, record)
  return { allowed: true, remaining: maxRequests - record.count, resetAt: record.resetAt }
}

// Clean up expired records periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, value] of rateLimitStore.entries()) {
      if (now > value.resetAt) {
        rateLimitStore.delete(key)
      }
    }
  }, RATE_LIMIT_WINDOW)
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip rate limiting for static assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|gif|woff|woff2|ttf|eot|css|js)$/)
  ) {
    return NextResponse.next()
  }

  // Determine rate limit based on path
  let maxRequests = MAX_REQUESTS_PER_WINDOW
  const isStrictPath = STRICT_PATHS.some(path => pathname.startsWith(path))
  
  if (isStrictPath) {
    maxRequests = 20 // Stricter limit for sensitive endpoints
  }

  // Check rate limit
  const rateLimitKey = getRateLimitKey(request)
  const { allowed, remaining, resetAt } = checkRateLimit(rateLimitKey, maxRequests)

  if (!allowed) {
    // Rate limit exceeded
    return new NextResponse(
      JSON.stringify({
        error: 'Too many requests',
        message: 'You have exceeded the rate limit. Please try again later.',
        resetAt: new Date(resetAt).toISOString(),
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)),
          'X-RateLimit-Limit': String(maxRequests),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(resetAt),
        },
      }
    )
  }

  // Add rate limit headers to response
  const response = NextResponse.next()
  response.headers.set('X-RateLimit-Limit', String(maxRequests))
  response.headers.set('X-RateLimit-Remaining', String(remaining))
  response.headers.set('X-RateLimit-Reset', String(resetAt))

  return response
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}

