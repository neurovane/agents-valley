import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase-client'
import { Comment } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

const supabase = createClient()

// Fetch agent comments
export function useAgentComments(agentId: string) {
  return useQuery({
    queryKey: ['comments', 'agent', agentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user:profiles(*)
        `)
        .eq('agent_id', agentId)
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(error.message)
      }

      return data as Comment[]
    },
    enabled: !!agentId,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

// Fetch MCP comments
export function useMCPComments(mcpId: string) {
  return useQuery({
    queryKey: ['comments', 'mcp', mcpId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mcp_comments')
        .select(`
          *,
          user:profiles(*)
        `)
        .eq('mcp_server_id', mcpId)
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(error.message)
      }

      return data as Comment[]
    },
    enabled: !!mcpId,
    staleTime: 1 * 60 * 1000,
  })
}

// Add comment mutation
export function useAddComment(type: 'agent' | 'mcp') {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      if (!user) throw new Error('User not authenticated')

      const table = type === 'agent' ? 'comments' : 'mcp_comments'
      const idField = type === 'agent' ? 'agent_id' : 'mcp_server_id'

      const { error } = await supabase
        .from(table)
        .insert({
          [idField]: id,
          user_id: user.id,
          content: content.trim(),
        })

      if (error) throw new Error(error.message)

      return { id }
    },
    onSuccess: ({ id }) => {
      // Invalidate comments query
      queryClient.invalidateQueries({ queryKey: ['comments', type, id] })
    },
  })
}

// Specific hook for adding MCP comments
export function useAddMCPComment() {
  return useAddComment('mcp')
}

// Update comment mutation
export function useUpdateComment(type: 'agent' | 'mcp') {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ commentId, content, itemId }: { commentId: string; content: string; itemId: string }) => {
      if (!user) throw new Error('User not authenticated')

      const table = type === 'agent' ? 'comments' : 'mcp_comments'

      const { error } = await supabase
        .from(table)
        .update({ content: content.trim(), updated_at: new Date().toISOString() })
        .eq('id', commentId)
        .eq('user_id', user.id) // Ensure user owns the comment

      if (error) throw new Error(error.message)

      return { commentId, itemId }
    },
    onSuccess: ({ itemId }) => {
      queryClient.invalidateQueries({ queryKey: ['comments', type, itemId] })
    },
  })
}

// Delete comment mutation
export function useDeleteComment(type: 'agent' | 'mcp') {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ commentId, itemId }: { commentId: string; itemId: string }) => {
      if (!user) throw new Error('User not authenticated')

      const table = type === 'agent' ? 'comments' : 'mcp_comments'

      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id) // Ensure user owns the comment

      if (error) throw new Error(error.message)

      return { itemId }
    },
    onSuccess: ({ itemId }) => {
      queryClient.invalidateQueries({ queryKey: ['comments', type, itemId] })
    },
  })
}


