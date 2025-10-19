import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase-client'
import { RealtimeChannel } from '@supabase/supabase-js'

const supabase = createClient()

/**
 * Subscribe to real-time updates for agent comments
 */
export function useRealtimeAgentComments(agentId: string | undefined) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!agentId) return

    let channel: RealtimeChannel

    const setupChannel = async () => {
      channel = supabase
        .channel(`comments-${agentId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'comments',
            filter: `agent_id=eq.${agentId}`,
          },
          () => {
            // Invalidate comments query to refetch
            queryClient.invalidateQueries({ queryKey: ['comments', 'agent', agentId] })
          }
        )
        .subscribe()
    }

    setupChannel()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [agentId, queryClient])
}

/**
 * Subscribe to real-time updates for MCP server comments
 */
export function useRealtimeMCPComments(mcpId: string | undefined) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!mcpId) return

    let channel: RealtimeChannel

    const setupChannel = async () => {
      channel = supabase
        .channel(`mcp-comments-${mcpId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'mcp_comments',
            filter: `mcp_server_id=eq.${mcpId}`,
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ['comments', 'mcp', mcpId] })
          }
        )
        .subscribe()
    }

    setupChannel()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [mcpId, queryClient])
}

/**
 * Subscribe to real-time updates for agent upvotes
 */
export function useRealtimeAgentUpvotes(agentId: string | undefined) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!agentId) return

    let channel: RealtimeChannel

    const setupChannel = async () => {
      channel = supabase
        .channel(`upvotes-${agentId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'upvotes',
            filter: `agent_id=eq.${agentId}`,
          },
          () => {
            // Invalidate agent and upvote queries
            queryClient.invalidateQueries({ queryKey: ['agent', agentId] })
            queryClient.invalidateQueries({ queryKey: ['agent-upvote', agentId] })
          }
        )
        .subscribe()
    }

    setupChannel()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [agentId, queryClient])
}

/**
 * Subscribe to real-time updates for MCP server upvotes
 */
export function useRealtimeMCPUpvotes(mcpId: string | undefined) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!mcpId) return

    let channel: RealtimeChannel

    const setupChannel = async () => {
      channel = supabase
        .channel(`mcp-upvotes-${mcpId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'mcp_upvotes',
            filter: `mcp_server_id=eq.${mcpId}`,
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ['mcp-server', mcpId] })
            queryClient.invalidateQueries({ queryKey: ['mcp-upvote', mcpId] })
          }
        )
        .subscribe()
    }

    setupChannel()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [mcpId, queryClient])
}

/**
 * Subscribe to real-time updates for event attendees
 */
export function useRealtimeEventAttendees(eventId: string | undefined) {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!eventId) return

    let channel: RealtimeChannel

    const setupChannel = async () => {
      channel = supabase
        .channel(`event-attendees-${eventId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'event_attendees',
            filter: `event_id=eq.${eventId}`,
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ['event', eventId] })
            queryClient.invalidateQueries({ queryKey: ['event-attendees', eventId] })
            queryClient.invalidateQueries({ queryKey: ['event-registration', eventId] })
          }
        )
        .subscribe()
    }

    setupChannel()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [eventId, queryClient])
}

/**
 * Subscribe to real-time updates for new agents
 */
export function useRealtimeAgents() {
  const queryClient = useQueryClient()

  useEffect(() => {
    let channel: RealtimeChannel

    const setupChannel = async () => {
      channel = supabase
        .channel('agents-list')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'agents',
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ['agents'] })
          }
        )
        .subscribe()
    }

    setupChannel()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [queryClient])
}

/**
 * Subscribe to real-time updates for new MCP servers
 */
export function useRealtimeMCPServers() {
  const queryClient = useQueryClient()

  useEffect(() => {
    let channel: RealtimeChannel

    const setupChannel = async () => {
      channel = supabase
        .channel('mcp-servers-list')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'mcp_servers',
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ['mcp-servers'] })
          }
        )
        .subscribe()
    }

    setupChannel()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [queryClient])
}

/**
 * Subscribe to real-time updates for new events
 */
export function useRealtimeEvents() {
  const queryClient = useQueryClient()

  useEffect(() => {
    let channel: RealtimeChannel

    const setupChannel = async () => {
      channel = supabase
        .channel('events-list')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'events',
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ['events'] })
          }
        )
        .subscribe()
    }

    setupChannel()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [queryClient])
}

