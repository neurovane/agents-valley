import { z } from 'zod'

// ============================================
// AGENT VALIDATION SCHEMAS
// ============================================

export const agentSchema = z.object({
  name: z.string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be less than 2000 characters')
    .trim(),
  category: z.string()
    .min(1, 'Category is required'),
  tags: z.array(z.string().trim().min(1))
    .max(10, 'Maximum 10 tags allowed')
    .optional()
    .default([]),
  demo_link: z.string()
    .url('Must be a valid URL')
    .optional()
    .or(z.literal('')),
  thumbnail_url: z.string()
    .url('Must be a valid URL')
    .optional()
    .or(z.literal('')),
})

export type AgentFormData = z.infer<typeof agentSchema>

// ============================================
// MCP SERVER VALIDATION SCHEMAS
// ============================================

export const mcpServerSchema = z.object({
  name: z.string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must be less than 100 characters')
    .trim(),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be less than 2000 characters')
    .trim(),
  category: z.string()
    .min(1, 'Category is required'),
  tags: z.array(z.string().trim().min(1))
    .max(10, 'Maximum 10 tags allowed')
    .optional()
    .default([]),
  server_url: z.string()
    .url('Must be a valid URL')
    .min(1, 'Server URL is required'),
  documentation_url: z.string()
    .url('Must be a valid URL')
    .optional()
    .or(z.literal('')),
  thumbnail_url: z.string()
    .url('Must be a valid URL')
    .optional()
    .or(z.literal('')),
})

export type MCPServerFormData = z.infer<typeof mcpServerSchema>

// ============================================
// EVENT VALIDATION SCHEMAS
// ============================================

export const eventSchema = z.object({
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must be less than 200 characters')
    .trim(),
  description: z.string()
    .min(20, 'Description must be at least 20 characters')
    .max(5000, 'Description must be less than 5000 characters')
    .trim(),
  event_type: z.enum(['online', 'in-person', 'hybrid']),
  location: z.string()
    .max(500, 'Location must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  event_url: z.string()
    .url('Must be a valid URL')
    .optional()
    .or(z.literal('')),
  start_date: z.string()
    .min(1, 'Start date is required')
    .refine((date) => new Date(date) > new Date(), {
      message: 'Start date must be in the future',
    }),
  end_date: z.string()
    .min(1, 'End date is required'),
  max_attendees: z.number()
    .int()
    .positive('Must be a positive number')
    .optional()
    .or(z.literal(0)),
  category: z.string()
    .min(1, 'Category is required'),
  tags: z.array(z.string().trim().min(1))
    .max(10, 'Maximum 10 tags allowed')
    .optional()
    .default([]),
  thumbnail_url: z.string()
    .url('Must be a valid URL')
    .optional()
    .or(z.literal('')),
  registration_deadline: z.string()
    .optional()
    .or(z.literal('')),
  requirements: z.string()
    .max(2000, 'Requirements must be less than 2000 characters')
    .optional()
    .or(z.literal('')),
  agenda: z.string()
    .max(5000, 'Agenda must be less than 5000 characters')
    .optional()
    .or(z.literal('')),
}).refine((data) => {
  const startDate = new Date(data.start_date)
  const endDate = new Date(data.end_date)
  return endDate > startDate
}, {
  message: 'End date must be after start date',
  path: ['end_date'],
}).refine((data) => {
  if (data.event_type === 'in-person' || data.event_type === 'hybrid') {
    return data.location && data.location.trim().length > 0
  }
  return true
}, {
  message: 'Location is required for in-person and hybrid events',
  path: ['location'],
}).refine((data) => {
  if (data.event_type === 'online' || data.event_type === 'hybrid') {
    return data.event_url && data.event_url.trim().length > 0
  }
  return true
}, {
  message: 'Event URL is required for online and hybrid events',
  path: ['event_url'],
}).refine((data) => {
  if (data.registration_deadline && data.registration_deadline.trim().length > 0) {
    const deadline = new Date(data.registration_deadline)
    const startDate = new Date(data.start_date)
    return deadline < startDate
  }
  return true
}, {
  message: 'Registration deadline must be before event start date',
  path: ['registration_deadline'],
})

export type EventFormData = z.infer<typeof eventSchema>

// ============================================
// COMMENT VALIDATION SCHEMAS
// ============================================

export const commentSchema = z.object({
  content: z.string()
    .min(1, 'Comment cannot be empty')
    .max(1000, 'Comment must be less than 1000 characters')
    .trim(),
})

export type CommentFormData = z.infer<typeof commentSchema>

// ============================================
// PROFILE VALIDATION SCHEMAS
// ============================================

export const profileSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
    .trim(),
  bio: z.string()
    .max(500, 'Bio must be less than 500 characters')
    .optional()
    .or(z.literal('')),
  website: z.string()
    .url('Must be a valid URL')
    .optional()
    .or(z.literal('')),
  github_url: z.string()
    .url('Must be a valid URL')
    .optional()
    .or(z.literal('')),
  twitter_url: z.string()
    .url('Must be a valid URL')
    .optional()
    .or(z.literal('')),
  linkedin_url: z.string()
    .url('Must be a valid URL')
    .optional()
    .or(z.literal('')),
  avatar_url: z.string()
    .url('Must be a valid URL')
    .optional()
    .or(z.literal('')),
})

export type ProfileFormData = z.infer<typeof profileSchema>

// ============================================
// AUTH VALIDATION SCHEMAS
// ============================================

export const signUpSchema = z.object({
  email: z.string()
    .email('Must be a valid email address')
    .min(1, 'Email is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be less than 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
    .trim(),
})

export const signInSchema = z.object({
  email: z.string()
    .email('Must be a valid email address')
    .min(1, 'Email is required'),
  password: z.string()
    .min(1, 'Password is required'),
})

export type SignUpFormData = z.infer<typeof signUpSchema>
export type SignInFormData = z.infer<typeof signInSchema>

// ============================================
// SEARCH VALIDATION
// ============================================

export const searchSchema = z.object({
  query: z.string()
    .min(1, 'Search query cannot be empty')
    .max(100, 'Search query must be less than 100 characters')
    .trim(),
})

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Parse and validate form data with Zod schema
 * Returns either the validated data or validation errors
 */
export function validateFormData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  try {
    const validatedData = schema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {}
      error.issues.forEach((err) => {
        const path = err.path.join('.')
        errors[path] = err.message
      })
      return { success: false, errors }
    }
    return { success: false, errors: { _form: 'Validation failed' } }
  }
}

/**
 * Parse tags from comma-separated string
 */
export function parseTags(tagsString: string): string[] {
  return tagsString
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)
    .slice(0, 10) // Max 10 tags
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

