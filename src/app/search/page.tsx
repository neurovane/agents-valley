'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Agent, MCPServer } from '@/lib/supabase'
import { useSearchAgents } from '@/hooks/useAgents'
import { useSearchMCPServers } from '@/hooks/useMCPServers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Search, 
  Bot, 
  Server, 
  TrendingUp, 
  Clock, 
  Star, 
  ChevronUp, 
  Calendar,
  Filter,
  X
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'sonner'

type SortOption = 'trending' | 'newest' | 'popular'
type SearchType = 'all' | 'agents' | 'mcp'

const CATEGORIES = [
  'All',
  'Productivity',
  'Development',
  'Design',
  'Marketing',
  'Research',
  'Writing',
  'Data Analysis',
  'Customer Support',
  'Education',
  'Entertainment',
  'Other'
]

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState<SortOption>('trending')
  const [searchType, setSearchType] = useState<SearchType>('all')
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const supabase = createClient()

  const { data: agents, isLoading: agentsLoading, error: agentsError } = useSearchAgents(
    searchQuery,
    { sortBy, category: selectedCategory }
  )

  const { data: mcpServers, isLoading: mcpLoading, error: mcpError } = useSearchMCPServers(
    searchQuery,
    { sortBy, category: selectedCategory }
  )

  const search = useCallback(async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search term')
      return
    }

    setHasSearched(true)
  }, [searchQuery])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      search()
    }
  }

  const clearSearch = () => {
    setSearchQuery('')
    setHasSearched(false)
  }

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

  const totalResults = (agents?.length || 0) + (mcpServers?.length || 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-4">Search AgentsValley</h1>
            <p className="text-gray-600 mb-6">
              Find AI agents and MCP servers that match your needs
            </p>

            {/* Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search for agents, MCP servers, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10 pr-10 h-12 text-lg"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSearch}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <Button 
                onClick={search} 
                disabled={loading || !searchQuery.trim()}
                className="h-12 px-8"
              >
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Filters:</span>
              </div>
              
              <Select value={searchType} onValueChange={(value: SearchType) => setSearchType(value)}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="agents">AI Agents</SelectItem>
                  <SelectItem value="mcp">MCP Servers</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trending">
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Trending
                    </div>
                  </SelectItem>
                  <SelectItem value="newest">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      Newest
                    </div>
                  </SelectItem>
                  <SelectItem value="popular">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 mr-2" />
                      Popular
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {hasSearched && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold">
                {agentsLoading || mcpLoading ? 'Searching...' : `${totalResults} result${totalResults !== 1 ? 's' : ''} found`}
              </h2>
              {!agentsLoading && !mcpLoading && totalResults > 0 && (
                <p className="text-gray-600">
                  Results for &quot;{searchQuery}&quot; {selectedCategory !== 'All' && `in ${selectedCategory}`}
                </p>
              )}
            </div>
          )}

          {!hasSearched ? (
            <div className="text-center py-16">
              <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Start your search</h3>
              <p className="text-gray-500">
                Enter keywords to find AI agents and MCP servers
              </p>
            </div>
          ) : agentsLoading || mcpLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-32 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : totalResults === 0 ? (
            <div className="text-center py-16">
              <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No results found</h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your search terms or filters
              </p>
              <Button onClick={clearSearch} variant="outline">
                Clear Search
              </Button>
            </div>
          ) : (
            <Tabs value={searchType} onValueChange={(value: string) => setSearchType(value as SearchType)}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="all" className="flex items-center">
                  All Results ({totalResults})
                </TabsTrigger>
                <TabsTrigger value="agents" className="flex items-center">
                  <Bot className="h-4 w-4 mr-2" />
                  Agents ({agents?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="mcp" className="flex items-center">
                  <Server className="h-4 w-4 mr-2" />
                  MCP Servers ({mcpServers?.length || 0})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                {/* AI Agents */}
                {agents && agents.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Bot className="h-5 w-5 mr-2" />
                      AI Agents ({agents.length})
                    </h3>
                    <div className="space-y-4">
                      {agents.map((agent) => (
                        <Card key={agent.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer">
                          <Link href={`/agents/${agent.id}`}>
                            <CardContent className="p-6">
                              <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0">
                                  {agent.thumbnail_url ? (
                                    <Image
                                      src={agent.thumbnail_url}
                                      alt={agent.name}
                                      width={64}
                                      height={64}
                                      className="w-16 h-16 rounded-lg object-cover"
                                    />
                                  ) : (
                                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                      <Bot className="w-8 h-8 text-white" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-lg hover:text-blue-600 transition-colors truncate">
                                    {agent.name}
                                  </h4>
                                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                    {agent.description}
                                  </p>
                                  <div className="flex items-center justify-between mt-3">
                                    <div className="flex items-center space-x-3">
                                      {agent.publisher && (
                                        <div className="flex items-center space-x-2">
                                          <Avatar className="h-6 w-6">
                                            <AvatarImage src={agent.publisher.avatar_url || ''} />
                                            <AvatarFallback className="text-xs">
                                              {agent.publisher.username?.charAt(0).toUpperCase() || 'U'}
                                            </AvatarFallback>
                                          </Avatar>
                                          <span className="text-xs text-gray-600">
                                            {agent.publisher.username}
                                          </span>
                                        </div>
                                      )}
                                      <Badge variant="secondary" className="text-xs">
                                        {agent.category}
                                      </Badge>
                                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                                        <Calendar className="h-3 w-3" />
                                        <span>{formatDate(agent.created_at)}</span>
                                      </div>
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
                  </div>
                )}

                {/* MCP Servers */}
                {mcpServers && mcpServers.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Server className="h-5 w-5 mr-2" />
                      MCP Servers ({mcpServers.length})
                    </h3>
                    <div className="space-y-4">
                      {mcpServers.map((mcp) => (
                        <Card key={mcp.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer">
                          <Link href={`/mcp-servers/${mcp.id}`}>
                            <CardContent className="p-6">
                              <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0">
                                  {mcp.thumbnail_url ? (
                                    <Image
                                      src={mcp.thumbnail_url}
                                      alt={mcp.name}
                                      width={64}
                                      height={64}
                                      className="w-16 h-16 rounded-lg object-cover"
                                    />
                                  ) : (
                                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                                      <Server className="w-8 h-8 text-white" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-lg hover:text-purple-600 transition-colors truncate">
                                    {mcp.name}
                                  </h4>
                                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                    {mcp.description}
                                  </p>
                                  <div className="flex items-center justify-between mt-3">
                                    <div className="flex items-center space-x-3">
                                      {mcp.publisher && (
                                        <div className="flex items-center space-x-2">
                                          <Avatar className="h-6 w-6">
                                            <AvatarImage src={mcp.publisher.avatar_url || ''} />
                                            <AvatarFallback className="text-xs">
                                              {mcp.publisher.username?.charAt(0).toUpperCase() || 'U'}
                                            </AvatarFallback>
                                          </Avatar>
                                          <span className="text-xs text-gray-600">
                                            {mcp.publisher.username}
                                          </span>
                                        </div>
                                      )}
                                      <Badge variant="secondary" className="text-xs">
                                        {mcp.category}
                                      </Badge>
                                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                                        <Calendar className="h-3 w-3" />
                                        <span>{formatDate(mcp.created_at)}</span>
                                      </div>
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
                  </div>
                )}
              </TabsContent>

              <TabsContent value="agents" className="space-y-4">
                {!agents || agents.length === 0 ? (
                  <div className="text-center py-16">
                    <Bot className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No AI agents found</h3>
                    <p className="text-gray-500">Try adjusting your search terms</p>
                  </div>
                ) : (
                  agents.map((agent) => (
                    <Card key={agent.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer">
                      <Link href={`/agents/${agent.id}`}>
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                              {agent.thumbnail_url ? (
                                <Image
                                  src={agent.thumbnail_url}
                                  alt={agent.name}
                                  width={64}
                                  height={64}
                                  className="w-16 h-16 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                  <Bot className="w-8 h-8 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-lg hover:text-blue-600 transition-colors truncate">
                                {agent.name}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {agent.description}
                              </p>
                              <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center space-x-3">
                                  {agent.publisher && (
                                    <div className="flex items-center space-x-2">
                                      <Avatar className="h-6 w-6">
                                        <AvatarImage src={agent.publisher.avatar_url || ''} />
                                        <AvatarFallback className="text-xs">
                                          {agent.publisher.username?.charAt(0).toUpperCase() || 'U'}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="text-xs text-gray-600">
                                        {agent.publisher.username}
                                      </span>
                                    </div>
                                  )}
                                  <Badge variant="secondary" className="text-xs">
                                    {agent.category}
                                  </Badge>
                                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                                    <Calendar className="h-3 w-3" />
                                    <span>{formatDate(agent.created_at)}</span>
                                  </div>
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
                  ))
                )}
              </TabsContent>

              <TabsContent value="mcp" className="space-y-4">
                {!mcpServers || mcpServers.length === 0 ? (
                  <div className="text-center py-16">
                    <Server className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No MCP servers found</h3>
                    <p className="text-gray-500">Try adjusting your search terms</p>
                  </div>
                ) : (
                  mcpServers.map((mcp) => (
                    <Card key={mcp.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer">
                      <Link href={`/mcp-servers/${mcp.id}`}>
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                              {mcp.thumbnail_url ? (
                                <Image
                                  src={mcp.thumbnail_url}
                                  alt={mcp.name}
                                  width={64}
                                  height={64}
                                  className="w-16 h-16 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                                  <Server className="w-8 h-8 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-lg hover:text-purple-600 transition-colors truncate">
                                {mcp.name}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {mcp.description}
                              </p>
                              <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center space-x-3">
                                  {mcp.publisher && (
                                    <div className="flex items-center space-x-2">
                                      <Avatar className="h-6 w-6">
                                        <AvatarImage src={mcp.publisher.avatar_url || ''} />
                                        <AvatarFallback className="text-xs">
                                          {mcp.publisher.username?.charAt(0).toUpperCase() || 'U'}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span className="text-xs text-gray-600">
                                        {mcp.publisher.username}
                                      </span>
                                    </div>
                                  )}
                                  <Badge variant="secondary" className="text-xs">
                                    {mcp.category}
                                  </Badge>
                                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                                    <Calendar className="h-3 w-3" />
                                    <span>{formatDate(mcp.created_at)}</span>
                                  </div>
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
                  ))
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  )
}
