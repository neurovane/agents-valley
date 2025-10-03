'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'

interface LoadingContextType {
  isLoading: boolean
  setLoading: (loading: boolean) => void
  withLoading: <T>(fn: () => Promise<T>) => Promise<T>
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false)

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading)
  }, [])

  const withLoading = useCallback(async <T,>(fn: () => Promise<T>): Promise<T> => {
    try {
      setIsLoading(true)
      const result = await fn()
      return result
    } finally {
      setIsLoading(false)
    }
  }, [])

  const value = {
    isLoading,
    setLoading,
    withLoading
  }

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  const context = useContext(LoadingContext)
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
}
