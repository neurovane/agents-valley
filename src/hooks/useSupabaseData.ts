import { useState, useEffect, useCallback, useRef } from 'react'

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

  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isStale, setIsStale] = useState(false)
  
  const mountedRef = useRef(true)
  const retryCountRef = useRef(0)
  const abortControllerRef = useRef<AbortController | null>(null)

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
        
        // If data is stale, refetch in background
        if (isStaleData) {
          executeQuery(true)
        }
        return
      }
    }

    setLoading(true)
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
      retryCountRef.current = 0

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
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [queryFn, enabled, retries, retryDelay, cacheTime, staleTime, queryKey])

  const refetch = useCallback(async () => {
    retryCountRef.current = 0
    await executeQuery(true)
  }, [executeQuery])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  useEffect(() => {
    executeQuery()
  }, [executeQuery, ...dependencies]) // eslint-disable-line react-hooks/exhaustive-deps

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
