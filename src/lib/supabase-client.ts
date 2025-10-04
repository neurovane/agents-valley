import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bghemyfvgptvnwouooyb.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnaGVteWZ2Z3B0dm53b3Vvb3liIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0ODUzMDMsImV4cCI6MjA3NTA2MTMwM30.85cZl7k5mDhJ37zxXcqIroJOQlbXfJ7X_k0eyyfCnbU'

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

