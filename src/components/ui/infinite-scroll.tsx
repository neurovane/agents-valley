'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface InfiniteScrollProps {
  hasMore: boolean
  loadMore: () => Promise<void>
  loading?: boolean
  threshold?: number
  className?: string
  children: React.ReactNode
}

export function InfiniteScroll({
  hasMore,
  loadMore,
  loading = false,
  threshold = 200,
  className,
  children
}: InfiniteScrollProps) {
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return
    
    setIsLoadingMore(true)
    try {
      await loadMore()
    } finally {
      setIsLoadingMore(false)
    }
  }, [isLoadingMore, hasMore, loadMore])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting && hasMore && !isLoadingMore && !loading) {
          handleLoadMore()
        }
      },
      {
        rootMargin: `${threshold}px`,
        threshold: 0.1
      }
    )

    observerRef.current.observe(sentinel)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [hasMore, isLoadingMore, loading, threshold, handleLoadMore])

  return (
    <div className={cn("w-full", className)}>
      {children}
      
      {hasMore && (
        <div
          ref={sentinelRef}
          className="flex justify-center items-center py-4"
        >
          {(isLoadingMore || loading) && (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span className="text-sm text-muted-foreground">Loading more...</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}


