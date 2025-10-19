'use client'

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
import { useAgents } from '@/hooks/useAgents'
import { useMCPServers } from '@/hooks/useMCPServers'
import { useEvents } from '@/hooks/useEvents'
import { Agent, MCPServer, Event } from '@/lib/supabase'
import { Skeleton } from '@/components/ui/skeleton'
import { OptimizedImage } from '@/components/ui/optimized-image'
import Link from 'next/link'
import Image from 'next/image'

export default function HomePage() {
  // Fetch trending agents
  const { data: agentsData, isLoading: agentsLoading, error: agentsError } = useAgents({
    sortBy: 'trending',
    limit: 6,
  })

  // Fetch trending MCP servers
  const { data: mcpData, isLoading: mcpLoading, error: mcpError } = useMCPServers({
    sortBy: 'trending',
    limit: 6,
  })

  // Fetch upcoming events
  const { data: eventsData, isLoading: eventsLoading, error: eventsError } = useEvents({
    sortBy: 'upcoming',
    limit: 6,
  })
  
  // When using limit, response is an array
  const trendingAgents = (agentsData || []) as Agent[]
  const trendingMCPs = (mcpData || []) as MCPServer[]
  const upcomingEvents = (eventsData || []) as Event[]

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
                      The World&apos;s #1 AI Agents Platform
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Build, Share & Discover{' '}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                AI Agents
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
                      Join the world&apos;s largest community of AI developers. Discover cutting-edge AI agents,
              build your own intelligent solutions, and shape the future of artificial intelligence.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button asChild size="lg" className="h-12 px-8 text-lg">
                <Link href="/publish" className="flex items-center">
                  <Plus className="h-5 w-5 mr-2" />
                  Build Your AI Agent
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 px-8 text-lg">
                <Link href="#explore" className="flex items-center">
                  Discover AI Agents
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">1,000+</div>
                <div className="text-gray-600">AI Agents</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">500+</div>
                <div className="text-gray-600">AI Developers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-600">50K+</div>
                <div className="text-gray-600">AI Interactions</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            The Ultimate AI Agents Platform
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to build, deploy, and discover cutting-edge AI agents
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bot className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Build AI Agents</h3>
            <p className="text-gray-600">
              Create intelligent AI agents with our comprehensive platform. From simple chatbots to complex autonomous systems.
            </p>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Server className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Deploy & Scale</h3>
            <p className="text-gray-600">
              Deploy your AI agents instantly with our powerful infrastructure. Scale from prototype to production seamlessly.
            </p>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">AI Community</h3>
            <p className="text-gray-600">
                      Join the world&apos;s largest community of AI developers. Share knowledge, collaborate, and build the future together.
            </p>
          </Card>
                </div>
              </div>

      {/* Trending Agents */}
      <div id="explore" className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2">Featured AI Agents</h2>
            <p className="text-gray-600">Discover the most innovative and powerful AI agents created by our community</p>
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
                  {agentsError instanceof Error ? agentsError.message : 'Something went wrong while loading agents'}
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
            <h2 className="text-3xl font-bold mb-2">AI Agent Integrations</h2>
            <p className="text-gray-600">Powerful MCP servers and integrations to enhance your AI agents</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/mcp-servers" className="flex items-center">
              View All
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>

        {agentsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-32 w-full mb-4" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-full mb-4" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : agentsError ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-10 h-10 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Failed to load MCP servers</h3>
                <p className="text-muted-foreground mb-6">
                  {mcpError instanceof Error ? mcpError.message : 'Something went wrong while loading MCP servers'}
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
            <h2 className="text-3xl font-bold mb-2">AI Developer Events</h2>
            <p className="text-gray-600">Join workshops, hackathons, and conferences focused on AI agent development</p>
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
                  {eventsError instanceof Error ? eventsError.message : 'Something went wrong while loading events'}
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
              Ready to Build the Future of AI?
            </h2>
            <p className="text-xl mb-8 opacity-90">
                      Join the world&apos;s leading AI agents platform. Build, deploy, and share your intelligent agents with millions of developers worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="h-12 px-8 text-lg">
                <Link href="/publish" className="flex items-center">
                  <Plus className="h-5 w-5 mr-2" />
                  Build AI Agent
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-8 text-lg border-white text-white hover:bg-white hover:text-blue-600">
                <Link href="/agents" className="flex items-center">
                  Explore AI Agents
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