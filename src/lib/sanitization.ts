import DOMPurify from 'isomorphic-dompurify'

/**
 * Sanitize HTML content to prevent XSS attacks
 * Removes potentially dangerous tags and attributes
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'code', 'pre'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
  })
}

/**
 * Sanitize plain text by escaping HTML entities
 * Use this for user input that should be displayed as plain text
 */
export function sanitizeText(text: string): string {
  if (typeof text !== 'string') return ''
  
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * Sanitize and validate URL
 * Ensures URL is safe and follows allowed protocols
 */
export function sanitizeUrl(url: string): string | null {
  if (!url || typeof url !== 'string') return null
  
  // Trim whitespace
  url = url.trim()
  
  // Check for dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:']
  const lowerUrl = url.toLowerCase()
  
  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      return null
    }
  }
  
  // Validate URL format
  try {
    const parsed = new URL(url)
    // Only allow http and https protocols
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null
    }
    return parsed.toString()
  } catch {
    // If URL is relative or invalid, return null
    return null
  }
}

/**
 * Sanitize user input for database storage
 * Trims whitespace and removes null bytes
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return ''
  
  return input
    .trim()
    .replace(/\0/g, '') // Remove null bytes
    .replace(/\r\n/g, '\n') // Normalize line endings
    .slice(0, 10000) // Limit length to prevent DOS
}

/**
 * Sanitize array of strings (e.g., tags)
 */
export function sanitizeArray(arr: string[]): string[] {
  if (!Array.isArray(arr)) return []
  
  return arr
    .filter(item => typeof item === 'string')
    .map(item => sanitizeInput(item))
    .filter(item => item.length > 0)
    .slice(0, 20) // Limit array size
}

/**
 * Sanitize tags specifically
 * Ensures tags are alphanumeric with basic punctuation
 */
export function sanitizeTags(tags: string[]): string[] {
  if (!Array.isArray(tags)) return []
  
  return tags
    .filter(tag => typeof tag === 'string')
    .map(tag => tag.trim().toLowerCase())
    .filter(tag => {
      // Only allow alphanumeric, hyphens, and underscores
      return /^[a-z0-9-_]+$/.test(tag) && tag.length >= 2 && tag.length <= 30
    })
    .slice(0, 10) // Max 10 tags
}

/**
 * Sanitize filename
 * Removes path traversal attempts and dangerous characters
 */
export function sanitizeFilename(filename: string): string {
  if (typeof filename !== 'string') return ''
  
  return filename
    .replace(/\.\./g, '') // Remove parent directory references
    .replace(/[/\\]/g, '') // Remove path separators
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars with underscore
    .slice(0, 255) // Limit length
}

/**
 * Sanitize search query
 * Prevents SQL injection and other attacks
 */
export function sanitizeSearchQuery(query: string): string {
  if (typeof query !== 'string') return ''
  
  return query
    .trim()
    .replace(/['"\\;]/g, '') // Remove SQL special chars
    .replace(/--/g, '') // Remove SQL comments
    .slice(0, 100) // Limit length
}

/**
 * Sanitize comment content
 * Allows basic formatting but prevents XSS
 */
export function sanitizeComment(content: string): string {
  // First sanitize as text to escape HTML
  const textSanitized = sanitizeInput(content)
  
  // Then allow basic markdown-style formatting
  return textSanitized
    .replace(/\n{3,}/g, '\n\n') // Max 2 consecutive newlines
    .slice(0, 1000) // Limit to 1000 chars
}

/**
 * Sanitize object by applying sanitization to all string properties
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const sanitized: Record<string, unknown> = {}
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value)
    } else if (Array.isArray(value)) {
      sanitized[key] = sanitizeArray(value)
    } else if (value !== null && typeof value === 'object') {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>)
    } else {
      sanitized[key] = value
    }
  }
  
  return sanitized as T
}

/**
 * Rate limiting helper - tracks request counts per IP/user
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60000 // 1 minute
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const record = rateLimitMap.get(identifier)
  
  if (!record || now > record.resetAt) {
    // Create new record or reset expired one
    const resetAt = now + windowMs
    rateLimitMap.set(identifier, { count: 1, resetAt })
    return { allowed: true, remaining: maxRequests - 1, resetAt }
  }
  
  if (record.count >= maxRequests) {
    // Rate limit exceeded
    return { allowed: false, remaining: 0, resetAt: record.resetAt }
  }
  
  // Increment count
  record.count++
  return { allowed: true, remaining: maxRequests - record.count, resetAt: record.resetAt }
}

/**
 * Clean up expired rate limit records periodically
 */
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetAt) {
        rateLimitMap.delete(key)
      }
    }
  }, 60000) // Clean up every minute
}

