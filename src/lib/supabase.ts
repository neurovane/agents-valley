import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Profile {
  id: string
  username: string
  email: string
  avatar_url?: string
  created_at: string
}

export interface Agent {
  id: string
  name: string
  description: string
  category: string
  tags: string[]
  mcp_server_url?: string
  demo_link?: string
  thumbnail_url?: string
  publisher_id: string
  created_at: string
  updated_at: string
  upvotes_count: number
  publisher?: Profile
}

export interface Upvote {
  id: string
  agent_id: string
  user_id: string
  created_at: string
}

export interface Comment {
  id: string
  agent_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
  user?: Profile
}

export interface MCPServer {
  id: string
  name: string
  description: string
  category: string
  tags: string[]
  server_url: string
  documentation_url?: string
  thumbnail_url?: string
  publisher_id: string
  created_at: string
  updated_at: string
  upvotes_count: number
  publisher?: Profile
}

export interface MCPUpvote {
  id: string
  mcp_server_id: string
  user_id: string
  created_at: string
}

export interface MCPComment {
  id: string
  mcp_server_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
  user?: Profile
}

export interface Event {
  id: string
  title: string
  description: string
  event_type: 'online' | 'in-person' | 'hybrid'
  location?: string
  event_url?: string
  start_date: string
  end_date: string
  max_attendees?: number
  current_attendees: number
  category: string
  tags: string[]
  thumbnail_url?: string
  organizer_id: string
  created_at: string
  updated_at: string
  is_featured: boolean
  registration_deadline?: string
  requirements?: string
  agenda?: string
  organizer?: Profile
}

export interface EventAttendee {
  id: string
  event_id: string
  user_id: string
  registered_at: string
  status: 'registered' | 'attended' | 'cancelled'
  user?: Profile
}

