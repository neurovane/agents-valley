-- Complete Supabase Schema with All RLS Policies and Security
-- This file includes all tables, policies, functions, and triggers

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  website TEXT,
  github_url TEXT,
  twitter_url TEXT,
  linkedin_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- AGENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL CHECK (length(name) >= 3 AND length(name) <= 100),
  description TEXT NOT NULL CHECK (length(description) >= 10 AND length(description) <= 2000),
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  demo_link TEXT,
  thumbnail_url TEXT,
  publisher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  upvotes_count INTEGER DEFAULT 0 CHECK (upvotes_count >= 0),
  views_count INTEGER DEFAULT 0 CHECK (views_count >= 0)
);

-- ============================================
-- UPVOTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.upvotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(agent_id, user_id)
);

-- ============================================
-- COMMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL CHECK (length(content) >= 1 AND length(content) <= 1000),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- MCP SERVERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.mcp_servers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL CHECK (length(name) >= 3 AND length(name) <= 100),
  description TEXT NOT NULL CHECK (length(description) >= 10 AND length(description) <= 2000),
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  server_url TEXT NOT NULL,
  documentation_url TEXT,
  thumbnail_url TEXT,
  publisher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  upvotes_count INTEGER DEFAULT 0 CHECK (upvotes_count >= 0),
  views_count INTEGER DEFAULT 0 CHECK (views_count >= 0)
);

-- ============================================
-- MCP UPVOTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.mcp_upvotes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mcp_server_id UUID REFERENCES public.mcp_servers(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(mcp_server_id, user_id)
);

-- ============================================
-- MCP COMMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.mcp_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mcp_server_id UUID REFERENCES public.mcp_servers(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL CHECK (length(content) >= 1 AND length(content) <= 1000),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- EVENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL CHECK (length(title) >= 5 AND length(title) <= 200),
  description TEXT NOT NULL CHECK (length(description) >= 20 AND length(description) <= 5000),
  event_type TEXT NOT NULL CHECK (event_type IN ('online', 'in-person', 'hybrid')),
  location TEXT,
  event_url TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  max_attendees INTEGER CHECK (max_attendees > 0),
  current_attendees INTEGER DEFAULT 0 CHECK (current_attendees >= 0),
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  thumbnail_url TEXT,
  organizer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_featured BOOLEAN DEFAULT false,
  registration_deadline TIMESTAMP WITH TIME ZONE,
  requirements TEXT,
  agenda TEXT,
  CONSTRAINT valid_dates CHECK (end_date > start_date),
  CONSTRAINT valid_registration_deadline CHECK (registration_deadline IS NULL OR registration_deadline < start_date)
);

-- ============================================
-- EVENT ATTENDEES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.event_attendees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'cancelled')),
  UNIQUE(event_id, user_id)
);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mcp_servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mcp_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mcp_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================
CREATE POLICY "Public profiles are viewable by everyone" 
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- ============================================
-- AGENTS POLICIES
-- ============================================
CREATE POLICY "Agents are viewable by everyone" 
  ON public.agents FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create agents" 
  ON public.agents FOR INSERT 
  WITH CHECK (auth.uid() = publisher_id);

CREATE POLICY "Users can update their own agents" 
  ON public.agents FOR UPDATE 
  USING (auth.uid() = publisher_id);

CREATE POLICY "Users can delete their own agents" 
  ON public.agents FOR DELETE 
  USING (auth.uid() = publisher_id);

-- ============================================
-- UPVOTES POLICIES
-- ============================================
CREATE POLICY "Upvotes are viewable by everyone" 
  ON public.upvotes FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create upvotes" 
  ON public.upvotes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own upvotes" 
  ON public.upvotes FOR DELETE 
  USING (auth.uid() = user_id);

-- ============================================
-- COMMENTS POLICIES
-- ============================================
CREATE POLICY "Comments are viewable by everyone" 
  ON public.comments FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create comments" 
  ON public.comments FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
  ON public.comments FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
  ON public.comments FOR DELETE 
  USING (auth.uid() = user_id);

-- ============================================
-- MCP SERVERS POLICIES
-- ============================================
CREATE POLICY "MCP servers are viewable by everyone" 
  ON public.mcp_servers FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create MCP servers" 
  ON public.mcp_servers FOR INSERT 
  WITH CHECK (auth.uid() = publisher_id);

CREATE POLICY "Users can update their own MCP servers" 
  ON public.mcp_servers FOR UPDATE 
  USING (auth.uid() = publisher_id);

CREATE POLICY "Users can delete their own MCP servers" 
  ON public.mcp_servers FOR DELETE 
  USING (auth.uid() = publisher_id);

-- ============================================
-- MCP UPVOTES POLICIES
-- ============================================
CREATE POLICY "MCP upvotes are viewable by everyone" 
  ON public.mcp_upvotes FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can upvote MCP servers" 
  ON public.mcp_upvotes FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own MCP upvotes" 
  ON public.mcp_upvotes FOR DELETE 
  USING (auth.uid() = user_id);

-- ============================================
-- MCP COMMENTS POLICIES
-- ============================================
CREATE POLICY "MCP comments are viewable by everyone" 
  ON public.mcp_comments FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can comment on MCP servers" 
  ON public.mcp_comments FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own MCP comments" 
  ON public.mcp_comments FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own MCP comments" 
  ON public.mcp_comments FOR DELETE 
  USING (auth.uid() = user_id);

-- ============================================
-- EVENTS POLICIES
-- ============================================
CREATE POLICY "Events are viewable by everyone" 
  ON public.events FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create events" 
  ON public.events FOR INSERT 
  WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Users can update their own events" 
  ON public.events FOR UPDATE 
  USING (auth.uid() = organizer_id);

CREATE POLICY "Users can delete their own events" 
  ON public.events FOR DELETE 
  USING (auth.uid() = organizer_id);

-- ============================================
-- EVENT ATTENDEES POLICIES
-- ============================================
CREATE POLICY "Event attendees are viewable by everyone" 
  ON public.event_attendees FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can register for events" 
  ON public.event_attendees FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own event registrations" 
  ON public.event_attendees FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own event registrations" 
  ON public.event_attendees FOR DELETE 
  USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'username', NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update agent upvotes count
CREATE OR REPLACE FUNCTION public.update_agent_upvotes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.agents 
    SET upvotes_count = upvotes_count + 1 
    WHERE id = NEW.agent_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.agents 
    SET upvotes_count = GREATEST(upvotes_count - 1, 0)
    WHERE id = OLD.agent_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update MCP server upvotes count
CREATE OR REPLACE FUNCTION public.update_mcp_upvotes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.mcp_servers 
    SET upvotes_count = upvotes_count + 1 
    WHERE id = NEW.mcp_server_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.mcp_servers 
    SET upvotes_count = GREATEST(upvotes_count - 1, 0)
    WHERE id = OLD.mcp_server_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update event attendees count
CREATE OR REPLACE FUNCTION public.update_event_attendees_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'registered' THEN
    UPDATE public.events 
    SET current_attendees = current_attendees + 1 
    WHERE id = NEW.event_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'registered' THEN
    UPDATE public.events 
    SET current_attendees = GREATEST(current_attendees - 1, 0)
    WHERE id = OLD.event_id;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status = 'registered' AND NEW.status != 'registered' THEN
      UPDATE public.events 
      SET current_attendees = GREATEST(current_attendees - 1, 0)
      WHERE id = NEW.event_id;
    ELSIF OLD.status != 'registered' AND NEW.status = 'registered' THEN
      UPDATE public.events 
      SET current_attendees = current_attendees + 1 
      WHERE id = NEW.event_id;
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to update agent upvotes count
DROP TRIGGER IF EXISTS update_agent_upvotes_count_trigger ON public.upvotes;
CREATE TRIGGER update_agent_upvotes_count_trigger
  AFTER INSERT OR DELETE ON public.upvotes
  FOR EACH ROW EXECUTE FUNCTION public.update_agent_upvotes_count();

-- Trigger to update MCP upvotes count
DROP TRIGGER IF EXISTS update_mcp_upvotes_count_trigger ON public.mcp_upvotes;
CREATE TRIGGER update_mcp_upvotes_count_trigger
  AFTER INSERT OR DELETE ON public.mcp_upvotes
  FOR EACH ROW EXECUTE FUNCTION public.update_mcp_upvotes_count();

-- Trigger to update event attendees count
DROP TRIGGER IF EXISTS update_event_attendees_count_trigger ON public.event_attendees;
CREATE TRIGGER update_event_attendees_count_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.event_attendees
  FOR EACH ROW EXECUTE FUNCTION public.update_event_attendees_count();

-- Triggers to update updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_agents_updated_at ON public.agents;
CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON public.agents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_comments_updated_at ON public.comments;
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_mcp_servers_updated_at ON public.mcp_servers;
CREATE TRIGGER update_mcp_servers_updated_at
  BEFORE UPDATE ON public.mcp_servers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_mcp_comments_updated_at ON public.mcp_comments;
CREATE TRIGGER update_mcp_comments_updated_at
  BEFORE UPDATE ON public.mcp_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_events_updated_at ON public.events;
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Agents indexes
CREATE INDEX IF NOT EXISTS idx_agents_publisher_id ON public.agents(publisher_id);
CREATE INDEX IF NOT EXISTS idx_agents_category ON public.agents(category);
CREATE INDEX IF NOT EXISTS idx_agents_created_at ON public.agents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_agents_upvotes_count ON public.agents(upvotes_count DESC);
CREATE INDEX IF NOT EXISTS idx_agents_tags ON public.agents USING GIN(tags);

-- MCP Servers indexes
CREATE INDEX IF NOT EXISTS idx_mcp_servers_publisher_id ON public.mcp_servers(publisher_id);
CREATE INDEX IF NOT EXISTS idx_mcp_servers_category ON public.mcp_servers(category);
CREATE INDEX IF NOT EXISTS idx_mcp_servers_created_at ON public.mcp_servers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mcp_servers_upvotes_count ON public.mcp_servers(upvotes_count DESC);
CREATE INDEX IF NOT EXISTS idx_mcp_servers_tags ON public.mcp_servers USING GIN(tags);

-- Events indexes
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON public.events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_category ON public.events(category);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON public.events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON public.events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_tags ON public.events USING GIN(tags);

-- Upvotes indexes
CREATE INDEX IF NOT EXISTS idx_upvotes_agent_id ON public.upvotes(agent_id);
CREATE INDEX IF NOT EXISTS idx_upvotes_user_id ON public.upvotes(user_id);
CREATE INDEX IF NOT EXISTS idx_mcp_upvotes_mcp_server_id ON public.mcp_upvotes(mcp_server_id);
CREATE INDEX IF NOT EXISTS idx_mcp_upvotes_user_id ON public.mcp_upvotes(user_id);

-- Comments indexes
CREATE INDEX IF NOT EXISTS idx_comments_agent_id ON public.comments(agent_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_mcp_comments_mcp_server_id ON public.mcp_comments(mcp_server_id);
CREATE INDEX IF NOT EXISTS idx_mcp_comments_user_id ON public.mcp_comments(user_id);

-- Event attendees indexes
CREATE INDEX IF NOT EXISTS idx_event_attendees_event_id ON public.event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_user_id ON public.event_attendees(user_id);

