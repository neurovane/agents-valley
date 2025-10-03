import { useState, useEffect, useCallback, useRef } from 'react'

interface UseSupabaseQueryOptions {
  retries?: number
  retryDelay?: number
  enabled?: boolean
}

interface UseSupabaseQueryResult<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useSupabaseQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: unknown }>,
  dependencies: unknown[] = [],
  options: UseSupabaseQueryOptions = {}
): UseSupabaseQueryResult<T> {
  const { retries = 3, retryDelay = 1000, enabled = true } = options
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const mountedRef = useRef(true)
  const retryCountRef = useRef(0)

  const executeQuery = useCallback(async () => {
    if (!enabled) return

    setLoading(true)
    setError(null)

    try {
      const result = await queryFn()
      
      if (!mountedRef.current) return

      if (result.error) {
        const errorMessage = result.error instanceof Error 
          ? result.error.message 
          : typeof result.error === 'object' && result.error !== null && 'message' in result.error
          ? (result.error as { message: string }).message
          : 'Query failed'
        throw new Error(errorMessage)
      }

      setData(result.data)
      setError(null)
      retryCountRef.current = 0
    } catch (err) {
      if (!mountedRef.current) return

      const error = err instanceof Error ? err : new Error('Unknown error')
      
      if (retryCountRef.current < retries) {
        retryCountRef.current++
        console.warn(`Query failed, retrying... (${retryCountRef.current}/${retries})`, error.message)
        
        setTimeout(() => {
          if (mountedRef.current) {
            executeQuery()
          }
        }, retryDelay * retryCountRef.current)
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
  }, [queryFn, enabled, retries, retryDelay])

  const refetch = useCallback(async () => {
    retryCountRef.current = 0
    await executeQuery()
  }, [executeQuery])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    executeQuery()
  }, [executeQuery, ...dependencies]) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    data,
    loading,
    error,
    refetch
  }
}
