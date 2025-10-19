import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useLoading } from '@/contexts/LoadingContext'

interface UseSupabaseDataOptions {
  retries?: number
  retryDelay?: number
  cacheTime?: number
  staleTime?: number
  enabled?: boolean
}

interface UseSupabaseDataResult<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  isStale: boolean
}

// Simple in-memory cache
const cache = new Map<string, { data: unknown; timestamp: number; staleTime: number }>()

export function useSupabaseData<T>(
  queryKey: string,
  queryFn: () => Promise<{ data: T | null; error: unknown }>,
  dependencies: unknown[] = [],
  options: UseSupabaseDataOptions = {}
): UseSupabaseDataResult<T> {
  const { 
    retries = 3, 
    retryDelay = 1000, 
    cacheTime = 5 * 60 * 1000, // 5 minutes
    staleTime = 30 * 1000, // 30 seconds
    enabled = true 
  } = options

  const { user } = useAuth()
  const { hasInitialData: globalHasInitialData, setHasInitialData } = useLoading()
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isStale, setIsStale] = useState(false)
  
  const mountedRef = useRef(true)
  const retryCountRef = useRef(0)
  const abortControllerRef = useRef<AbortController | null>(null)
  const lastUserRef = useRef<string | null>(null)
  const hasInitialDataRef = useRef(false)
  const isVisibleRef = useRef(true)
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const executeQuery = useCallback(async (forceRefresh = false) => {
    if (!enabled) return

    // Check cache first
    const cached = cache.get(queryKey)
    const now = Date.now()
    
    if (cached && !forceRefresh) {
      const isExpired = now - cached.timestamp > cacheTime
      const isStaleData = now - cached.timestamp > staleTime
      
      if (!isExpired) {
        setData(cached.data as T)
        setLoading(false)
        setError(null)
        setIsStale(isStaleData)
        hasInitialDataRef.current = true
        
        // If data is stale, refetch in background
        if (isStaleData) {
          executeQuery(true)
        }
        return
      }
    }

    // Only show loading if we don't have any data yet (locally or globally)
    if (!hasInitialDataRef.current && !globalHasInitialData) {
      setLoading(true)
      
      // Set a timeout to prevent infinite loading
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
      loadingTimeoutRef.current = setTimeout(() => {
        if (mountedRef.current) {
          console.warn(`Query timeout for ${queryKey}, forcing loading to false`)
          setLoading(false)
        }
      }, 10000) // 10 second timeout
    }
    setError(null)

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController()

    try {
      const result = await queryFn()
      
      if (!mountedRef.current || abortControllerRef.current.signal.aborted) {
        return
      }

      if (result.error) {
        throw new Error(
          result.error instanceof Error 
            ? result.error.message 
            : typeof result.error === 'object' && result.error !== null && 'message' in result.error
            ? (result.error as { message: string }).message
            : 'Query failed'
        )
      }

      setData(result.data)
      setError(null)
      setIsStale(false)
      setLoading(false)
      retryCountRef.current = 0
      hasInitialDataRef.current = true
      setHasInitialData(true) // Set global flag
      
      // Clear loading timeout
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
        loadingTimeoutRef.current = null
      }

      // Cache the result
      cache.set(queryKey, {
        data: result.data,
        timestamp: now,
        staleTime
      })

    } catch (err) {
      if (!mountedRef.current || abortControllerRef.current.signal.aborted) {
        return
      }

      const error = err instanceof Error ? err : new Error('Unknown error')
      
      if (retryCountRef.current < retries) {
        retryCountRef.current++
        console.warn(`Query failed, retrying... (${retryCountRef.current}/${retries})`, error.message)
        
        setTimeout(() => {
          if (mountedRef.current && !abortControllerRef.current?.signal.aborted) {
            executeQuery(forceRefresh)
          }
        }, retryDelay * Math.pow(2, retryCountRef.current - 1)) // Exponential backoff
      } else {
        console.error('Query failed after all retries:', error)
        setError(error)
        setData(null)
        setLoading(false)
        
        // Clear loading timeout
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current)
          loadingTimeoutRef.current = null
        }
      }
    } finally {
      if (mountedRef.current) {
        // Only set loading to false if we don't have initial data (locally or globally)
        if (!hasInitialDataRef.current && !globalHasInitialData) {
          setLoading(false)
        }
        
        // Clear loading timeout
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current)
          loadingTimeoutRef.current = null
        }
      }
    }
  }, [queryFn, enabled, retries, retryDelay, cacheTime, staleTime, queryKey])

  const refetch = useCallback(async () => {
    retryCountRef.current = 0
    await executeQuery(true)
  }, [executeQuery])

  useEffect(() => {
    mountedRef.current = true
    
    // Handle page visibility changes
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden
      
      // If page becomes visible and we have stale data, refetch
      if (isVisibleRef.current && isStale) {
        executeQuery(true)
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Prevent showing global loading on visibility changes if we already have data
    // This avoids perceived "stuck loading" when switching tabs
    if (hasInitialDataRef.current || globalHasInitialData) {
      setLoading(false)
    }
    
    return () => {
      mountedRef.current = false
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
        loadingTimeoutRef.current = null
      }
    }
  }, [executeQuery, isStale, globalHasInitialData])

  useEffect(() => {
    executeQuery()
  }, [executeQuery, ...dependencies]) // eslint-disable-line react-hooks/exhaustive-deps

  // Handle auth state changes
  useEffect(() => {
    const currentUserId = user?.id || null
    
    // If user changed, clear cache and refetch
    if (lastUserRef.current !== currentUserId) {
      lastUserRef.current = currentUserId
      hasInitialDataRef.current = false // Reset initial data flag
      setHasInitialData(false) // Reset global flag
      
      // Clear any pending timeouts
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
        loadingTimeoutRef.current = null
      }
      
      clearSupabaseCache(queryKey)
      executeQuery(true)
    }
  }, [user?.id, queryKey, executeQuery])

  // Clean up old cache entries periodically
  useEffect(() => {
    const cleanup = () => {
      const now = Date.now()
      for (const [key, value] of cache.entries()) {
        if (now - value.timestamp > cacheTime) {
          cache.delete(key)
        }
      }
    }

    const interval = setInterval(cleanup, 60000) // Clean every minute
    return () => clearInterval(interval)
  }, [cacheTime])

  return {
    data,
    loading,
    error,
    refetch,
    isStale
  }
}

// Utility function to clear cache
export function clearSupabaseCache(queryKey?: string) {
  if (queryKey) {
    cache.delete(queryKey)
  } else {
    cache.clear()
  }
}

// Utility function to invalidate cache
export function invalidateSupabaseCache(queryKey: string) {
  const cached = cache.get(queryKey)
  if (cached) {
    cache.set(queryKey, {
      ...cached,
      timestamp: 0 // Force refresh
    })
  }
}

// Utility function to create cache key with user context
export function createCacheKey(baseKey: string, userId?: string | null): string {
  return userId ? `${baseKey}:user:${userId}` : `${baseKey}:anonymous`
}

// Utility function to clear cache by pattern
export function clearSupabaseCacheByPattern(pattern: string) {
  for (const [key] of cache.entries()) {
    if (key.includes(pattern)) {
      cache.delete(key)
    }
  }
}
