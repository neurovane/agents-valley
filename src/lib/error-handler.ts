/**
 * Extracts a meaningful error message from various error types
 * Handles Error objects, Supabase errors, and unknown errors
 */
export function getErrorMessage(error: unknown): string {
  // Handle Error instances
  if (error instanceof Error) {
    return error.message
  }
  
  // Handle Supabase errors and other objects
  if (typeof error === 'object' && error !== null) {
    // Check for common error properties
    if ('message' in error && typeof (error as { message: unknown }).message === 'string') {
      return (error as { message: string }).message
    }
    if ('details' in error && typeof (error as { details: unknown }).details === 'string') {
      return (error as { details: string }).details
    }
    if ('hint' in error && typeof (error as { hint: unknown }).hint === 'string') {
      return (error as { hint: string }).hint
    }
    if ('error' in error && typeof (error as { error: unknown }).error === 'string') {
      return (error as { error: string }).error
    }
    
    // Try to stringify the error object
    try {
      const stringified = JSON.stringify(error)
      if (stringified !== '{}') {
        return stringified
      }
    } catch {
      // If JSON.stringify fails, continue to default
    }
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return error
  }
  
  // Default fallback
  return 'An unexpected error occurred'
}

/**
 * Logs error with context and returns a user-friendly message
 */
export function handleError(error: unknown, context: string, fallbackMessage?: string): string {
  console.error(`${context}:`, error)
  
  // Log additional error details for debugging
  if (typeof error === 'object' && error !== null) {
    console.error('Error details:', {
      name: 'name' in error ? error.name : 'unknown',
      message: 'message' in error ? error.message : 'no message',
      stack: 'stack' in error ? error.stack : 'no stack trace',
      details: 'details' in error ? error.details : undefined,
      hint: 'hint' in error ? error.hint : undefined,
    })
  }
  
  const errorMessage = getErrorMessage(error)
  return fallbackMessage && errorMessage === 'An unexpected error occurred' 
    ? fallbackMessage 
    : errorMessage
}

