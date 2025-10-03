'use client'

import React, { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Agent, MCPServer } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Trophy, 
  Medal, 
  Crown, 
  Bot, 
  Server, 
  ChevronUp, 
  Calendar,
  TrendingUp,
  AlertCircle
} from 'lucide-react'
import { useSupabaseData } from '@/hooks/useSupabaseData'
import Link from 'next/link'
import Image from 'next/image'

type LeaderboardType = 'agents' | 'mcp' | 'all'

interface LeaderboardItem {
  id: string
  name: string
  description: string
  category: string
  tags: string[]
  thumbnail_url?: string
  publisher_id: string
  created_at: string
  upvotes_count: number
  publisher?: {
    id: string
    username: string
    avatar_url?: string
  }
  type: 'agent' | 'mcp'
}

export default function LeaderboardPage() {
  const [leaderboardType, setLeaderboardType] = useState<LeaderboardType>('agents')
  const supabase = createClient()

  const fetchAgents = useCallback(async () => {
    const { data, error } = await supabase
      .from('agents')
      .select(`
        *,
        publisher:profiles(*)
      `)
      .order('upvotes_count', { ascending: false })

    return { data: data || [], error }
  }, [supabase])

  const fetchMCPServers = useCallback(async () => {
    const { data, error } = await supabase
      .from('mcp_servers')
      .select(`
        *,
        publisher:profiles(*)
      `)
      .order('upvotes_count', { ascending: false })

    return { data: data || [], error }
  }, [supabase])

  const { data: agents, loading: agentsLoading, error: agentsError } = useSupabaseData<Agent[]>(
    'leaderboard-agents',
    fetchAgents,
    [],
    { 
      retries: 3, 
      retryDelay: 1000,
      cacheTime: 5 * 60 * 1000, // 5 minutes
      staleTime: 30 * 1000 // 30 seconds
    }
  )

  const { data: mcpServers, loading: mcpLoading, error: mcpError } = useSupabaseData<MCPServer[]>(
    'leaderboard-mcp-servers',
    fetchMCPServers,
    [],
    { 
      retries: 3, 
      retryDelay: 1000,
      cacheTime: 5 * 60 * 1000, // 5 minutes
      staleTime: 30 * 1000 // 30 seconds
    }
  )

  const loading = agentsLoading || mcpLoading

  // Combine and sort all items
  const allItems: LeaderboardItem[] = React.useMemo(() => {
    const agentsWithType: LeaderboardItem[] = (agents || []).map(agent => ({
      ...agent,
      type: 'agent' as const
    }))

    const mcpWithType: LeaderboardItem[] = (mcpServers || []).map(mcp => ({
      ...mcp,
      type: 'mcp' as const
    }))

    return [...agentsWithType, ...mcpWithType]
      .sort((a, b) => b.upvotes_count - a.upvotes_count)
  }, [agents, mcpServers])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Today'
    if (diffDays === 2) return 'Yesterday'
    if (diffDays <= 7) return `${diffDays - 1} days ago`
    return date.toLocaleDateString()
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 3:
        return <Trophy className="h-6 w-6 text-amber-600" />
      default:
        return <span className="text-lg font-bold text-gray-600">#{rank}</span>
    }
  }

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white'
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white'
      case 3:
        return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const LeaderboardCard = ({ item, rank }: { item: LeaderboardItem; rank: number }) => {
    const isTopThree = rank <= 3
    
    return (
      <Card className={`hover:shadow-lg transition-all duration-200 cursor-pointer ${
        isTopThree ? 'ring-2 ring-offset-2' : ''
      } ${
        rank === 1 ? 'ring-yellow-400' : 
        rank === 2 ? 'ring-gray-400' : 
        rank === 3 ? 'ring-amber-400' : ''
      }`}>
        <Link href={item.type === 'agent' ? `/agents/${item.id}` : `/mcp-servers/${item.id}`}>
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              {/* Rank */}
              <div className="flex-shrink-0">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getRankBadgeColor(rank)}`}>
                  {getRankIcon(rank)}
                </div>
              </div>

              {/* Thumbnail */}
              <div className="flex-shrink-0">
                {item.thumbnail_url ? (
                  <Image
                    src={item.thumbnail_url}
                    alt={item.name}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${
                    item.type === 'agent' 
                      ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
                      : 'bg-gradient-to-br from-purple-500 to-pink-600'
                  }`}>
                    {item.type === 'agent' ? (
                      <Bot className="w-8 h-8 text-white" />
                    ) : (
                      <Server className="w-8 h-8 text-white" />
                    )}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-2">
                  <h4 className={`font-semibold text-lg hover:text-blue-600 transition-colors truncate ${
                    isTopThree ? 'text-lg font-bold' : ''
                  }`}>
                    {item.name}
                  </h4>
                  <Badge variant="secondary" className="text-xs">
                    {item.type === 'agent' ? 'AI Agent' : 'MCP Server'}
                  </Badge>
                  {isTopThree && (
                    <Badge className={`text-xs ${getRankBadgeColor(rank)}`}>
                      Top {rank}
                    </Badge>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {item.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {item.publisher && (
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={item.publisher.avatar_url || ''} />
                          <AvatarFallback className="text-xs">
                            {item.publisher.username?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-gray-600">
                          {item.publisher.username}
                        </span>
                      </div>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {item.category}
                    </Badge>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(item.created_at)}</span>
                    </div>
                  </div>
                  
                  <div className={`flex items-center space-x-1 text-sm font-semibold ${
                    isTopThree ? 'text-lg' : ''
                  }`}>
                    <ChevronUp className="h-4 w-4 text-primary" />
                    <span className={isTopThree ? 'text-lg font-bold' : ''}>
                      {item.upvotes_count}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Link>
      </Card>
    )
  }

  const getTopThree = (items: LeaderboardItem[]) => {
    return items.slice(0, 3)
  }

  const getRest = (items: LeaderboardItem[]) => {
    return items.slice(3)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <Trophy className="h-8 w-8 text-yellow-500 mr-3" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-500 to-amber-600 bg-clip-text text-transparent">
                Leaderboard
              </h1>
            </div>
            <p className="text-xl text-gray-600 mb-6">
              Discover the most popular AI agents and MCP servers on AgentsValley
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{agents?.length || 0}</div>
                <div className="text-gray-600">AI Agents</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{mcpServers?.length || 0}</div>
                <div className="text-gray-600">MCP Servers</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{allItems.length}</div>
                <div className="text-gray-600">Total Items</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {allItems.reduce((sum, item) => sum + item.upvotes_count, 0)}
                </div>
                <div className="text-gray-600">Total Upvotes</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <Tabs value={leaderboardType} onValueChange={(value: string) => setLeaderboardType(value as LeaderboardType)}>
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="agents" className="flex items-center">
                <Bot className="h-4 w-4 mr-2" />
                AI Agents ({agents?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="mcp" className="flex items-center">
                <Server className="h-4 w-4 mr-2" />
                MCP Servers ({mcpServers?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="all" className="flex items-center">
                <Trophy className="h-4 w-4 mr-2" />
                All Items ({allItems.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="agents" className="space-y-6">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-32 bg-gray-200 rounded-lg"></div>
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
              ) : !agents || agents.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-12">
                      <Bot className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No AI agents found</h3>
                      <p className="text-muted-foreground mb-6">
                        Be the first to publish an AI agent!
                      </p>
                      <Button asChild>
                        <Link href="/publish">Publish First Agent</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Top 3 Agents */}
                  {agents.length >= 3 && (
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold mb-6 flex items-center">
                        <Crown className="h-6 w-6 text-yellow-500 mr-2" />
                        Top 3 AI Agents
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {getTopThree(agents.map(agent => ({ ...agent, type: 'agent' as const }))).map((agent, index) => (
                          <LeaderboardCard key={agent.id} item={agent} rank={index + 1} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Rest of Agents */}
                  {agents.length > 3 && (
                    <div>
                      <h2 className="text-2xl font-bold mb-6 flex items-center">
                        <TrendingUp className="h-6 w-6 text-blue-500 mr-2" />
                        All AI Agents
                      </h2>
                      <div className="space-y-4">
                        {getRest(agents.map(agent => ({ ...agent, type: 'agent' as const }))).map((agent, index) => (
                          <LeaderboardCard key={agent.id} item={agent} rank={index + 4} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Single agent or less than 3 */}
                  {agents.length <= 3 && agents.length > 0 && (
                    <div>
                      <h2 className="text-2xl font-bold mb-6 flex items-center">
                        <TrendingUp className="h-6 w-6 text-blue-500 mr-2" />
                        AI Agents Leaderboard
                      </h2>
                      <div className="space-y-4">
                        {agents.map((agent, index) => (
                          <LeaderboardCard key={agent.id} item={{ ...agent, type: 'agent' as const }} rank={index + 1} />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="mcp" className="space-y-6">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-32 bg-gray-200 rounded-lg"></div>
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
              ) : !mcpServers || mcpServers.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-12">
                      <Server className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No MCP servers found</h3>
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
                <>
                  {/* Top 3 MCP Servers */}
                  {mcpServers.length >= 3 && (
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold mb-6 flex items-center">
                        <Crown className="h-6 w-6 text-yellow-500 mr-2" />
                        Top 3 MCP Servers
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {getTopThree(mcpServers.map(mcp => ({ ...mcp, type: 'mcp' as const }))).map((mcp, index) => (
                          <LeaderboardCard key={mcp.id} item={mcp} rank={index + 1} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Rest of MCP Servers */}
                  {mcpServers.length > 3 && (
                    <div>
                      <h2 className="text-2xl font-bold mb-6 flex items-center">
                        <TrendingUp className="h-6 w-6 text-purple-500 mr-2" />
                        All MCP Servers
                      </h2>
                      <div className="space-y-4">
                        {getRest(mcpServers.map(mcp => ({ ...mcp, type: 'mcp' as const }))).map((mcp, index) => (
                          <LeaderboardCard key={mcp.id} item={mcp} rank={index + 4} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Single MCP server or less than 3 */}
                  {mcpServers.length <= 3 && mcpServers.length > 0 && (
                    <div>
                      <h2 className="text-2xl font-bold mb-6 flex items-center">
                        <TrendingUp className="h-6 w-6 text-purple-500 mr-2" />
                        MCP Servers Leaderboard
                      </h2>
                      <div className="space-y-4">
                        {mcpServers.map((mcp, index) => (
                          <LeaderboardCard key={mcp.id} item={{ ...mcp, type: 'mcp' as const }} rank={index + 1} />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </TabsContent>

            <TabsContent value="all" className="space-y-6">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-32 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : (agentsError || mcpError) ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-10 h-10 text-red-600" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Failed to load leaderboard data</h3>
                      <p className="text-muted-foreground mb-6">
                        {agentsError?.message || mcpError?.message || 'Something went wrong while loading leaderboard data'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : allItems.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-12">
                      <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No items found</h3>
                      <p className="text-muted-foreground mb-6">
                        Be the first to publish content on AgentsValley!
                      </p>
                      <Button asChild>
                        <Link href="/publish">Publish First Item</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Top 3 Overall */}
                  {allItems.length >= 3 && (
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold mb-6 flex items-center">
                        <Crown className="h-6 w-6 text-yellow-500 mr-2" />
                        Top 3 Overall
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {getTopThree(allItems).map((item, index) => (
                          <LeaderboardCard key={item.id} item={item} rank={index + 1} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Rest of All Items */}
                  {allItems.length > 3 && (
                    <div>
                      <h2 className="text-2xl font-bold mb-6 flex items-center">
                        <TrendingUp className="h-6 w-6 text-green-500 mr-2" />
                        Complete Leaderboard
                      </h2>
                      <div className="space-y-4">
                        {getRest(allItems).map((item, index) => (
                          <LeaderboardCard key={item.id} item={item} rank={index + 4} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Single item or less than 3 */}
                  {allItems.length <= 3 && allItems.length > 0 && (
                    <div>
                      <h2 className="text-2xl font-bold mb-6 flex items-center">
                        <TrendingUp className="h-6 w-6 text-green-500 mr-2" />
                        Complete Leaderboard
                      </h2>
                      <div className="space-y-4">
                        {allItems.map((item, index) => (
                          <LeaderboardCard key={item.id} item={item} rank={index + 1} />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
