'use client'

import { useCallback } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Agent, MCPServer } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Plus, 
  Bot, 
  Server, 
  ArrowRight,
  Users,
  Sparkles,
  ChevronUp,
  AlertCircle,
  CalendarDays
} from 'lucide-react'
import { useSupabaseData } from '@/hooks/useSupabaseData'
import { Event } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'

export default function HomePage() {
  const supabase = createClient()

  const fetchTrendingAgents = useCallback(async () => {
    const { data, error } = await supabase
        .from('agents')
        .select(`
          *,
          publisher:profiles(*)
        `)
      .order('upvotes_count', { ascending: false })
      .limit(6)

    return { data: data || [], error }
  }, [supabase])

  const fetchTrendingMCPs = useCallback(async () => {
    const { data, error } = await supabase
      .from('mcp_servers')
      .select(`
        *,
        publisher:profiles(*)
      `)
      .order('upvotes_count', { ascending: false })
      .limit(6)

    return { data: data || [], error }
  }, [supabase])

  const fetchUpcomingEvents = useCallback(async () => {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        organizer:profiles(*)
      `)
      .gte('start_date', new Date().toISOString())
      .order('start_date', { ascending: true })
      .limit(6)

    return { data: data || [], error }
  }, [supabase])

  const { data: trendingAgents, loading: agentsLoading, error: agentsError } = useSupabaseData<Agent[]>(
    'trending-agents',
    fetchTrendingAgents,
    [],
    { 
      retries: 3, 
      retryDelay: 1000,
      cacheTime: 5 * 60 * 1000, // 5 minutes
      staleTime: 30 * 1000 // 30 seconds
    }
  )

  const { data: trendingMCPs, loading: mcpLoading, error: mcpError } = useSupabaseData<MCPServer[]>(
    'trending-mcp-servers',
    fetchTrendingMCPs,
    [],
    { 
      retries: 3, 
      retryDelay: 1000,
      cacheTime: 5 * 60 * 1000, // 5 minutes
      staleTime: 30 * 1000 // 30 seconds
    }
  )

  const { data: upcomingEvents, loading: eventsLoading, error: eventsError } = useSupabaseData<Event[]>(
    'upcoming-events',
    fetchUpcomingEvents,
    [],
    { 
      retries: 3, 
      retryDelay: 1000,
      cacheTime: 5 * 60 * 1000, // 5 minutes
      staleTime: 30 * 1000 // 30 seconds
    }
  )

  const loading = agentsLoading || mcpLoading || eventsLoading


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="container mx-auto px-4 py-20 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              The Future of AI is Here
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Discover Amazing{' '}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                AI Tools
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
              Explore, upvote, and share the best AI agents and MCP servers built by the community. 
              Find your next productivity boost or creative inspiration.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button asChild size="lg" className="h-12 px-8 text-lg">
                <Link href="/publish" className="flex items-center">
                  <Plus className="h-5 w-5 mr-2" />
                  Start Publishing
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 px-8 text-lg">
                <Link href="#explore" className="flex items-center">
                  Explore Now
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">500+</div>
                <div className="text-gray-600">AI Agents</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">200+</div>
                <div className="text-gray-600">MCP Servers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-600">10K+</div>
                <div className="text-gray-600">Community</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose AgentsValley?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            The most comprehensive platform for discovering and sharing AI tools
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bot className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI Agents</h3>
            <p className="text-gray-600">
              Discover intelligent agents that can help with productivity, creativity, and automation.
            </p>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Server className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">MCP Servers</h3>
            <p className="text-gray-600">
              Connect to powerful MCP servers that extend AI capabilities and integrations.
            </p>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Community</h3>
            <p className="text-gray-600">
              Join a vibrant community of developers, creators, and AI enthusiasts.
            </p>
          </Card>
                </div>
              </div>

      {/* Trending Agents */}
      <div id="explore" className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Trending AI Agents</h2>
            <p className="text-gray-600">The most popular agents this week</p>
                    </div>
          <Button asChild variant="outline">
            <Link href="/agents" className="flex items-center">
              View All
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
      </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : agentsError ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-10 h-10 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Failed to load agents</h3>
                <p className="text-muted-foreground mb-6">
                  {agentsError.message || 'Something went wrong while loading agents'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : !trendingAgents || trendingAgents.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🤖</div>
                <h3 className="text-xl font-semibold mb-2">No trending agents found</h3>
                <p className="text-muted-foreground mb-6">
                  Be the first to publish an agent!
                </p>
                <Button asChild>
                  <Link href="/publish">Publish First Agent</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingAgents.map((agent) => (
              <Card key={agent.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
                <Link href={`/agents/${agent.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {agent.thumbnail_url ? (
                          <Image
                            src={agent.thumbnail_url}
                            alt={agent.name}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <Bot className="w-6 h-6 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors truncate">
                          {agent.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {agent.description}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-2">
                            {agent.publisher && (
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={agent.publisher.avatar_url || ''} />
                                <AvatarFallback className="text-xs">
                                  {agent.publisher.username?.charAt(0).toUpperCase() || 'U'}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <Badge variant="secondary" className="text-xs">
                              {agent.category}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <ChevronUp className="h-3 w-3" />
                            <span>{agent.upvotes_count}</span>
                          </div>
                    </div>
                    </div>
            </div>
          </CardContent>
                </Link>
        </Card>
            ))}
          </div>
        )}
      </div>

      {/* Trending MCP Servers */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Trending MCP Servers</h2>
            <p className="text-gray-600">The most popular MCP servers this week</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/mcp-servers" className="flex items-center">
              View All
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : mcpError ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-10 h-10 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Failed to load MCP servers</h3>
                <p className="text-muted-foreground mb-6">
                  {mcpError.message || 'Something went wrong while loading MCP servers'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : !trendingMCPs || trendingMCPs.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">⚙️</div>
                <h3 className="text-xl font-semibold mb-2">No trending MCP servers found</h3>
                <p className="text-muted-foreground mb-6">
                  Be the first to publish an MCP server!
                </p>
                <Button asChild>
                  <Link href="/publish">Publish First MCP Server</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingMCPs.map((mcp) => (
              <Card key={mcp.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
                <Link href={`/mcp-servers/${mcp.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {mcp.thumbnail_url ? (
                          <Image
                            src={mcp.thumbnail_url}
                            alt={mcp.name}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                            <Server className="w-6 h-6 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg group-hover:text-purple-600 transition-colors truncate">
                          {mcp.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {mcp.description}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-2">
                            {mcp.publisher && (
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={mcp.publisher.avatar_url || ''} />
                                <AvatarFallback className="text-xs">
                                  {mcp.publisher.username?.charAt(0).toUpperCase() || 'U'}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <Badge variant="secondary" className="text-xs">
                              {mcp.category}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <ChevronUp className="h-3 w-3" />
                            <span>{mcp.upvotes_count}</span>
                          </div>
                        </div>
                      </div>
              </div>
            </CardContent>
                </Link>
          </Card>
            ))}
          </div>
        )}
            </div>
            
      {/* CTA Section */}
      {/* Upcoming Events Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Upcoming Events</h2>
            <p className="text-gray-600">Join exciting AI and tech events in your community</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/events" className="flex items-center">
              View All
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg"></div>
              </div>
              ))}
            </div>
        ) : eventsError ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-10 h-10 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Failed to load events</h3>
                <p className="text-muted-foreground mb-6">
                  {eventsError.message || 'Something went wrong while loading events'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : !upcomingEvents || upcomingEvents.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-xl font-semibold mb-2">No upcoming events found</h3>
                <p className="text-muted-foreground mb-6">
                  Be the first to create an event!
                </p>
                <Button asChild>
                  <Link href="/events/create">Create First Event</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
                <Link href={`/events/${event.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {event.thumbnail_url ? (
                          <Image
                            src={event.thumbnail_url}
                            alt={event.title}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
                            <CalendarDays className="w-6 h-6 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg group-hover:text-green-600 transition-colors truncate">
                          {event.title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {event.description}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className="text-xs">
                              {event.category}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {event.event_type}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <Users className="h-3 w-3" />
                            <span>{event.current_attendees}</span>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          {new Date(event.start_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Share Your AI Creation?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of developers and creators sharing their AI agents, MCP servers, and events with the world.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="h-12 px-8 text-lg">
                <Link href="/publish" className="flex items-center">
                  <Plus className="h-5 w-5 mr-2" />
                  Publish Now
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-8 text-lg border-white text-white hover:bg-white hover:text-blue-600">
                <Link href="/events" className="flex items-center">
                  Explore Events
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}