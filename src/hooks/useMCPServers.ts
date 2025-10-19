import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase-client'
import { MCPServer } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

const supabase = createClient()

export type SortOption = 'trending' | 'newest' | 'popular'

interface UseMCPServersOptions {
  sortBy?: SortOption
  category?: string
  limit?: number
  page?: number
  pageSize?: number
}

// Fetch single MCP server
export function useMCPServer(mcpId: string) {
  return useQuery({
    queryKey: ['mcp-server', mcpId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mcp_servers')
        .select(`
          *,
          publisher:profiles(*)
        `)
        .eq('id', mcpId)
        .single()

      if (error) {
        throw new Error(error.message)
      }

      return data as MCPServer
    },
    enabled: !!mcpId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Fetch all MCP servers
export function useMCPServers(options: UseMCPServersOptions = {}) {
  const { sortBy = 'trending', category, limit, page = 1, pageSize = 20 } = options

  return useQuery({
    queryKey: ['mcp-servers', sortBy, category, limit, page, pageSize],
    queryFn: async () => {
      let query = supabase
        .from('mcp_servers')
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
        return data as MCPServer[]
      }

      // If using pagination, return paginated response
      return {
        data: data as MCPServer[],
        count: count || 0,
        page,
        pageSize,
        totalPages: count ? Math.ceil(count / pageSize) : 0
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Check upvote status
export function useMCPUpvoteStatus(mcpId: string) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['mcp-upvote', mcpId, user?.id],
    queryFn: async () => {
      if (!user) return false

      const { data } = await supabase
        .from('mcp_upvotes')
        .select('id')
        .eq('mcp_server_id', mcpId)
        .eq('user_id', user.id)
        .single()

      return !!data
    },
    enabled: !!user && !!mcpId,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

// Upvote mutation
export function useUpvoteMCP() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ mcpId, isUpvoted }: { mcpId: string; isUpvoted: boolean }) => {
      if (!user) throw new Error('User not authenticated')

      if (isUpvoted) {
        // Remove upvote
        const { error } = await supabase
          .from('mcp_upvotes')
          .delete()
          .eq('mcp_server_id', mcpId)
          .eq('user_id', user.id)

        if (error) throw new Error(error.message)
      } else {
        // Add upvote
        const { error } = await supabase
          .from('mcp_upvotes')
          .insert({
            mcp_server_id: mcpId,
            user_id: user.id,
          })

        if (error) throw new Error(error.message)
      }

      return { mcpId, isUpvoted: !isUpvoted }
    },
    onSuccess: ({ mcpId }) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['mcp-server', mcpId] })
      queryClient.invalidateQueries({ queryKey: ['mcp-servers'] })
      queryClient.invalidateQueries({ queryKey: ['mcp-upvote', mcpId] })
    },
  })
}

// Update MCP server mutation
export function useUpdateMCPServer() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ mcpId, data }: { mcpId: string; data: Partial<MCPServer> }) => {
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('mcp_servers')
        .update(data)
        .eq('id', mcpId)
        .eq('publisher_id', user.id) // Ensure user owns the MCP server

      if (error) throw new Error(error.message)

      return { mcpId }
    },
    onSuccess: ({ mcpId }) => {
      queryClient.invalidateQueries({ queryKey: ['mcp-server', mcpId] })
      queryClient.invalidateQueries({ queryKey: ['mcp-servers'] })
    },
  })
}

// Delete MCP server mutation
export function useDeleteMCPServer() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (mcpId: string) => {
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('mcp_servers')
        .delete()
        .eq('id', mcpId)
        .eq('publisher_id', user.id) // Ensure user owns the MCP server

      if (error) throw new Error(error.message)

      return { mcpId }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mcp-servers'] })
    },
  })
}

// Search MCP servers
export function useSearchMCPServers(searchQuery: string, options: UseMCPServersOptions = {}) {
  const { sortBy = 'trending', category } = options

  return useQuery({
    queryKey: ['mcp-servers', 'search', searchQuery, sortBy, category],
    queryFn: async () => {
      if (!searchQuery.trim()) return []

      let query = supabase
        .from('mcp_servers')
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

      return data as MCPServer[]
    },
    enabled: !!searchQuery.trim(),
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

