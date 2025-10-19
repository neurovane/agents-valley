'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface PrefetchOptions {
  delay?: number
  priority?: 'high' | 'low'
}

export function usePrefetch() {
  const router = useRouter()
  const prefetchedRoutes = useRef(new Set<string>())
  const prefetchTimeouts = useRef(new Map<string, NodeJS.Timeout>())

  const prefetch = useCallback((href: string, options: PrefetchOptions = {}) => {
    const { delay = 0, priority = 'low' } = options

    // Don't prefetch if already prefetched
    if (prefetchedRoutes.current.has(href)) return

    // Clear existing timeout for this route
    const existingTimeout = prefetchTimeouts.current.get(href)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }

    const timeout = setTimeout(() => {
      try {
        router.prefetch(href)
        prefetchedRoutes.current.add(href)
        prefetchTimeouts.current.delete(href)
      } catch (error) {
        console.warn('Prefetch failed for:', href, error)
      }
    }, delay)

    prefetchTimeouts.current.set(href, timeout)
  }, [router])

  const prefetchOnHover = useCallback((href: string, options: PrefetchOptions = {}) => {
    return {
      onMouseEnter: () => prefetch(href, { ...options, delay: 200 }),
      onFocus: () => prefetch(href, { ...options, delay: 100 })
    }
  }, [prefetch])

  const prefetchOnVisible = useCallback((href: string, options: PrefetchOptions = {}) => {
    return {
      'data-prefetch': href,
      'data-prefetch-delay': options.delay || 500,
      'data-prefetch-priority': options.priority || 'low'
    }
  }, [])

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      prefetchTimeouts.current.forEach(timeout => clearTimeout(timeout))
      prefetchTimeouts.current.clear()
    }
  }, [])

  return {
    prefetch,
    prefetchOnHover,
    prefetchOnVisible,
    isPrefetched: (href: string) => prefetchedRoutes.current.has(href)
  }
}

// Hook for prefetching based on viewport intersection
export function useIntersectionPrefetch(href: string, options: PrefetchOptions = {}) {
  const { prefetch } = usePrefetch()
  const { delay = 500, priority = 'low' } = options

  const ref = useCallback((node: HTMLElement | null) => {
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting) {
          prefetch(href, { delay, priority })
          observer.disconnect()
        }
      },
      {
        rootMargin: '100px', // Start prefetching when element is 100px away from viewport
        threshold: 0.1
      }
    )

    observer.observe(node)

    return () => observer.disconnect()
  }, [href, delay, priority, prefetch])

  return ref
}


