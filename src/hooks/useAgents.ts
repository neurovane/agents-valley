import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase-client'
import { Agent } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

const supabase = createClient()

export type SortOption = 'trending' | 'newest' | 'popular'

interface UseAgentsOptions {
  sortBy?: SortOption
  category?: string
  limit?: number
  page?: number
  pageSize?: number
}

// Fetch all agents
export function useAgents(options: UseAgentsOptions = {}) {
  const { sortBy = 'trending', category, limit, page = 1, pageSize = 20 } = options

  return useQuery({
    queryKey: ['agents', sortBy, category, limit, page, pageSize],
    queryFn: async () => {
      let query = supabase
        .from('agents')
        .select(`
          *,
          publisher:profiles(*)
        `, { count: 'exact' })

      if (category && category !== 'All') {
        query = query.eq('category', category)
      }

      switch (sortBy) {
        case 'trending':
        case 'popular':
          query = query.order('upvotes_count', { ascending: false })
          break
        case 'newest':
          query = query.order('created_at', { ascending: false })
          break
      }

      // Apply pagination
      if (limit) {
        query = query.limit(limit)
      } else if (pageSize) {
        const from = (page - 1) * pageSize
        const to = from + pageSize - 1
        query = query.range(from, to)
      }

      const { data, error, count } = await query

      if (error) {
        throw new Error(error.message)
      }

      // If using limit, return just the data for backward compatibility
      if (limit) {
        return data as Agent[]
      }

      // If using pagination, return paginated response
      return { 
        data: data as Agent[], 
        count: count || 0,
        page,
        pageSize,
        totalPages: count ? Math.ceil(count / pageSize) : 0
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Fetch single agent
export function useAgent(id: string | string[]) {
  const agentId = Array.isArray(id) ? id[0] : id

  return useQuery({
    queryKey: ['agent', agentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agents')
        .select(`
          *,
          publisher:profiles(*)
        `)
        .eq('id', agentId)
        .single()

      if (error) {
        throw new Error(error.message)
      }

      return data as Agent
    },
    enabled: !!agentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Fetch user's agents
export function useUserAgents(userId?: string) {
  return useQuery({
    queryKey: ['agents', 'user', userId],
    queryFn: async () => {
      if (!userId) return []

      const { data, error } = await supabase
        .from('agents')
        .select(`
          *,
          publisher:profiles(*)
        `)
        .eq('publisher_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(error.message)
      }

      return data as Agent[]
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  })
}

// Check upvote status
export function useAgentUpvoteStatus(agentId: string) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['agent-upvote', agentId, user?.id],
    queryFn: async () => {
      if (!user) return false

      const { data } = await supabase
        .from('upvotes')
        .select('id')
        .eq('agent_id', agentId)
        .eq('user_id', user.id)
        .single()

      return !!data
    },
    enabled: !!user && !!agentId,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

// Upvote mutation
export function useUpvoteAgent() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ agentId, isUpvoted }: { agentId: string; isUpvoted: boolean }) => {
      if (!user) throw new Error('User not authenticated')

      if (isUpvoted) {
        // Remove upvote
        const { error } = await supabase
          .from('upvotes')
          .delete()
          .eq('agent_id', agentId)
          .eq('user_id', user.id)

        if (error) throw new Error(error.message)
      } else {
        // Add upvote
        const { error } = await supabase
          .from('upvotes')
          .insert({
            agent_id: agentId,
            user_id: user.id,
          })

        if (error) throw new Error(error.message)
      }

      return { agentId, isUpvoted: !isUpvoted }
    },
    onSuccess: ({ agentId }) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['agent', agentId] })
      queryClient.invalidateQueries({ queryKey: ['agents'] })
      queryClient.invalidateQueries({ queryKey: ['agent-upvote', agentId] })
    },
  })
}

// Update agent mutation
export function useUpdateAgent() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ agentId, data }: { agentId: string; data: Partial<Agent> }) => {
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('agents')
        .update(data)
        .eq('id', agentId)
        .eq('publisher_id', user.id) // Ensure user owns the agent

      if (error) throw new Error(error.message)

      return { agentId }
    },
    onSuccess: ({ agentId }) => {
      queryClient.invalidateQueries({ queryKey: ['agent', agentId] })
      queryClient.invalidateQueries({ queryKey: ['agents'] })
    },
  })
}

// Delete agent mutation
export function useDeleteAgent() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (agentId: string) => {
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('agents')
        .delete()
        .eq('id', agentId)
        .eq('publisher_id', user.id) // Ensure user owns the agent

      if (error) throw new Error(error.message)

      return { agentId }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] })
    },
  })
}

// Search agents
export function useSearchAgents(searchQuery: string, options: UseAgentsOptions = {}) {
  const { sortBy = 'trending', category } = options

  return useQuery({
    queryKey: ['agents', 'search', searchQuery, sortBy, category],
    queryFn: async () => {
      if (!searchQuery.trim()) return []

      let query = supabase
        .from('agents')
        .select(`
          *,
          publisher:profiles(*)
        `)
        .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,tags.cs.{${searchQuery}}`)

      if (category && category !== 'All') {
        query = query.eq('category', category)
      }

      switch (sortBy) {
        case 'trending':
        case 'popular':
          query = query.order('upvotes_count', { ascending: false })
          break
        case 'newest':
          query = query.order('created_at', { ascending: false })
          break
      }

      const { data, error } = await query

      if (error) {
        throw new Error(error.message)
      }

      return data as Agent[]
    },
    enabled: !!searchQuery.trim(),
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

