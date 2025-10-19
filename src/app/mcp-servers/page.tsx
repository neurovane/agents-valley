'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Search, TrendingUp, Clock, Star, Plus, Server, ChevronUp, ExternalLink, Calendar } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { useMCPServers, useUpvoteMCP, useMCPUpvoteStatus, SortOption } from '@/hooks/useMCPServers'
import { toast } from 'sonner'
import { handleError } from '@/lib/error-handler'

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

export default function MCPServersPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState<SortOption>('trending')
  const { user } = useAuth()
  const upvoteMutation = useUpvoteMCP()
  const supabase = createClient()

  const { data: mcpResponse, isLoading: loading, error } = useMCPServers({
    sortBy,
    category: selectedCategory,
  })
  
  const mcpServers = Array.isArray(mcpResponse) ? mcpResponse : (mcpResponse?.data || [])

  // Filter MCP servers client-side by search query
  const filteredServers = mcpServers.filter(server => {
    if (!searchQuery) return true
    const search = searchQuery.toLowerCase()
    return (
      server.name.toLowerCase().includes(search) ||
      server.description.toLowerCase().includes(search)
    )
  })

  const handleUpvote = async (mcpServerId: string) => {
    if (!user) {
      toast.error('Please sign in to upvote')
      return
    }

    try {
      // Check if already upvoted
      const { data: existingUpvote } = await supabase
        .from('mcp_upvotes')
        .select('id')
        .eq('mcp_server_id', mcpServerId)
        .eq('user_id', user.id)
        .single()

      if (existingUpvote) {
        // Remove upvote
        await supabase
          .from('mcp_upvotes')
          .delete()
          .eq('mcp_server_id', mcpServerId)
          .eq('user_id', user.id)
        
        toast.success('Upvote removed')
      } else {
        // Add upvote
        await supabase
          .from('mcp_upvotes')
          .insert({
            mcp_server_id: mcpServerId,
            user_id: user.id,
          })
        
        toast.success('Upvoted!')
      }

      // Data will auto-refresh via React Query mutation
    } catch (error: unknown) {
      const errorMessage = handleError(error, 'Error toggling upvote', 'Failed to upvote')
      toast.error(errorMessage)
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <Server className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold">MCP Servers</h1>
              </div>
              <p className="text-gray-600">
                Connect to powerful MCP servers that extend AI capabilities and integrations.
              </p>
            </div>
            <Button asChild size="lg">
              <Link href="/publish" className="flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Publish MCP Server
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Discover MCP Servers</CardTitle>
            <CardDescription>
              Find MCP servers that match your needs and interests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search MCP servers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Sort by" />
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
          </CardContent>
        </Card>
      </div>

      {/* MCP Servers Grid */}
      <div className="container mx-auto px-4 pb-16">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : !filteredServers || filteredServers.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Server className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No MCP servers found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery || selectedCategory !== 'All'
                    ? 'Try adjusting your search or filters'
                    : 'Be the first to publish an MCP server!'}
                </p>
                <Button asChild>
                  <Link href="/publish">Publish First MCP Server</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">
                {filteredServers.length} MCP Server{filteredServers.length !== 1 ? 's' : ''} Found
              </h2>
            </div>
            
            <div className="grid gap-4">
              {filteredServers.map((mcpServer) => (
                <Card key={mcpServer.id} className="group hover:shadow-lg transition-all duration-200 cursor-pointer">
                  <Link href={`/mcp-servers/${mcpServer.id}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        {/* Thumbnail */}
                        <div className="flex-shrink-0">
                          {mcpServer.thumbnail_url ? (
                            <Image
                              src={mcpServer.thumbnail_url}
                              alt={mcpServer.name}
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

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-lg group-hover:text-purple-600 transition-colors truncate">
                                {mcpServer.name}
                              </h3>
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                {mcpServer.description}
                              </p>
                            </div>
                            
                            {/* Upvote Button */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleUpvote(mcpServer.id)
                              }}
                              className="ml-4 flex-shrink-0"
                            >
                              <ChevronUp className="h-4 w-4 mr-1" />
                              {mcpServer.upvotes_count}
                            </Button>
                          </div>

                          {/* Meta Info */}
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center space-x-3">
                              {/* Publisher */}
                              {mcpServer.publisher && (
                                <div className="flex items-center space-x-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={mcpServer.publisher.avatar_url || ''} />
                                    <AvatarFallback className="text-xs">
                                      {mcpServer.publisher.username?.charAt(0).toUpperCase() || 'U'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-xs text-muted-foreground">
                                    {mcpServer.publisher.username}
                                  </span>
                                </div>
                              )}

                              {/* Category */}
                              <Badge variant="secondary" className="text-xs">
                                {mcpServer.category}
                              </Badge>

                              {/* Date */}
                              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>{formatDate(mcpServer.created_at)}</span>
                              </div>
                            </div>

                            {/* External Links */}
                            <div className="flex items-center space-x-2">
                              {mcpServer.documentation_url && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    window.open(mcpServer.documentation_url, '_blank')
                                  }}
                                >
                                  <ExternalLink className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </div>

                          {/* Tags */}
                          {mcpServer.tags && mcpServer.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
                              {mcpServer.tags.slice(0, 3).map((tag, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  #{tag}
                                </Badge>
                              ))}
                              {mcpServer.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{mcpServer.tags.length - 3} more
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
