'use client'

import { useLoading } from '@/contexts/LoadingContext'
import { Loader2 } from 'lucide-react'

export function GlobalLoading() {
  const { isLoading } = useLoading()

  // Never show global overlay just because of tab switches; only for explicit operations
  if (!isLoading) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 flex items-center space-x-3 shadow-lg">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span className="text-gray-700 font-medium">Loading...</span>
      </div>
    </div>
  )
}


