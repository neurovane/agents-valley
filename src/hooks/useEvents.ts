import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase-client'
import { Event, EventAttendee } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

const supabase = createClient()

export type SortOption = 'upcoming' | 'newest' | 'popular'

interface UseEventsOptions {
  sortBy?: SortOption
  eventType?: string
  category?: string
  limit?: number
  page?: number
  pageSize?: number
}

// Fetch all events
export function useEvents(options: UseEventsOptions = {}) {
  const { sortBy = 'upcoming', eventType, category, limit, page = 1, pageSize = 20 } = options

  return useQuery({
    queryKey: ['events', sortBy, eventType, category, limit, page, pageSize],
    queryFn: async () => {
      let query = supabase
        .from('events')
        .select(`
          *,
          organizer:profiles(*)
        `, { count: 'exact' })

      if (eventType && eventType !== 'all') {
        query = query.eq('event_type', eventType)
      }

      if (category && category !== 'All') {
        query = query.eq('category', category)
      }

      switch (sortBy) {
        case 'upcoming':
          query = query
            .gte('start_date', new Date().toISOString())
            .order('start_date', { ascending: true })
          break
        case 'newest':
          query = query.order('created_at', { ascending: false })
          break
        case 'popular':
          query = query.order('current_attendees', { ascending: false })
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
        return data as Event[]
      }

      // If using pagination, return paginated response
      return {
        data: data as Event[],
        count: count || 0,
        page,
        pageSize,
        totalPages: count ? Math.ceil(count / pageSize) : 0
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

// Fetch single event
export function useEvent(id: string | string[]) {
  const eventId = Array.isArray(id) ? id[0] : id

  return useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          organizer:profiles(*)
        `)
        .eq('id', eventId)
        .single()

      if (error) {
        throw new Error(error.message)
      }

      return data as Event
    },
    enabled: !!eventId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// Fetch event attendees
export function useEventAttendees(eventId: string) {
  return useQuery({
    queryKey: ['event-attendees', eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('event_attendees')
        .select(`
          *,
          user:profiles(*)
        `)
        .eq('event_id', eventId)
        .order('registered_at', { ascending: false })

      if (error) {
        throw new Error(error.message)
      }

      return data as EventAttendee[]
    },
    enabled: !!eventId,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

// Check if user is registered
export function useEventRegistrationStatus(eventId: string) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['event-registration', eventId, user?.id],
    queryFn: async () => {
      if (!user) return false

      const { data } = await supabase
        .from('event_attendees')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .single()

      return !!data
    },
    enabled: !!user && !!eventId,
    staleTime: 1 * 60 * 1000, // 1 minute
  })
}

// Register for event mutation
export function useRegisterEvent() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ eventId, isRegistered }: { eventId: string; isRegistered: boolean }) => {
      if (!user) throw new Error('User not authenticated')

      if (isRegistered) {
        // Unregister
        const { error } = await supabase
          .from('event_attendees')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', user.id)

        if (error) throw new Error(error.message)
      } else {
        // Register
        const { error } = await supabase
          .from('event_attendees')
          .insert({
            event_id: eventId,
            user_id: user.id,
          })

        if (error) throw new Error(error.message)
      }

      return { eventId, isRegistered: !isRegistered }
    },
    onSuccess: ({ eventId }) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['event', eventId] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['event-attendees', eventId] })
      queryClient.invalidateQueries({ queryKey: ['event-registration', eventId] })
    },
  })
}

// Update event mutation
export function useUpdateEvent() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ eventId, data }: { eventId: string; data: Partial<Event> }) => {
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('events')
        .update(data)
        .eq('id', eventId)
        .eq('organizer_id', user.id) // Ensure user owns the event

      if (error) throw new Error(error.message)

      return { eventId }
    },
    onSuccess: ({ eventId }) => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

// Delete event mutation
export function useDeleteEvent() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (eventId: string) => {
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)
        .eq('organizer_id', user.id) // Ensure user owns the event

      if (error) throw new Error(error.message)

      return { eventId }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}

