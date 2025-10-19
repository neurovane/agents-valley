import { Card, CardContent, CardHeader } from '@/components/ui/card'

/**
 * Skeleton for Agent Card
 */
export function AgentCardSkeleton() {
  return (
    <Card className="overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200 dark:bg-gray-700" />
      <CardContent className="p-4 space-y-3">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
        <div className="flex gap-2 mt-4">
          <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Skeleton for MCP Server Card
 */
export function MCPCardSkeleton() {
  return (
    <Card className="overflow-hidden animate-pulse">
      <div className="h-32 bg-gray-200 dark:bg-gray-700" />
      <CardContent className="p-4 space-y-3">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5" />
        <div className="flex gap-2 mt-4">
          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="h-8 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Skeleton for Event Card
 */
export function EventCardSkeleton() {
  return (
    <Card className="overflow-hidden animate-pulse">
      <div className="h-40 bg-gray-200 dark:bg-gray-700" />
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32" />
          <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Skeleton for Comment
 */
export function CommentSkeleton() {
  return (
    <div className="flex gap-3 animate-pulse">
      <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5" />
        </div>
      </div>
    </div>
  )
}

/**
 * Skeleton for Detail Page Header
 */
export function DetailHeaderSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardContent className="p-8">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-32 h-32 rounded-lg bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
            </div>
            <div className="flex gap-2">
              <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
            <div className="flex gap-3">
              <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Skeleton for Profile Header
 */
export function ProfileHeaderSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader className="p-6">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div className="flex-1 space-y-3 text-center md:text-left">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mx-auto md:mx-0" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64 mx-auto md:mx-0" />
            <div className="flex gap-4 justify-center md:justify-start">
              <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}

/**
 * Skeleton for List Item
 */
export function ListItemSkeleton() {
  return (
    <div className="flex items-start gap-4 p-4 border rounded-lg animate-pulse">
      <div className="w-16 h-16 rounded bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        <div className="flex gap-2">
          <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
      <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
    </div>
  )
}

/**
 * Skeleton Grid - displays multiple card skeletons
 */
export function SkeletonGrid({ 
  count = 6, 
  variant = 'agent' 
}: { 
  count?: number
  variant?: 'agent' | 'mcp' | 'event' | 'list'
}) {
  const SkeletonComponent = {
    agent: AgentCardSkeleton,
    mcp: MCPCardSkeleton,
    event: EventCardSkeleton,
    list: ListItemSkeleton,
  }[variant]

  return (
    <div className={variant === 'list' ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonComponent key={i} />
      ))}
    </div>
  )
}

