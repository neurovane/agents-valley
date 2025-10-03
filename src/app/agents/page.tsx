'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase-client'
import { Agent } from '@/lib/supabase'
import { AgentCard } from '@/components/agents/AgentCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, TrendingUp, Clock, Star, Plus, Bot, AlertCircle } from 'lucide-react'
import { useSupabaseData } from '@/hooks/useSupabaseData'
import Link from 'next/link'

type SortOption = 'trending' | 'newest' | 'popular'

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

export default function AgentsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState<SortOption>('trending')
  const supabase = createClient()

  const fetchAgents = useCallback(async () => {
    let query = supabase
      .from('agents')
      .select(`
        *,
        publisher:profiles(*)
      `)

    // Apply category filter
    if (selectedCategory !== 'All') {
      query = query.eq('category', selectedCategory)
    }

    // Apply search filter
    if (searchQuery) {
      query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
    }

    // Apply sorting
    switch (sortBy) {
      case 'trending':
        query = query.order('upvotes_count', { ascending: false })
        break
      case 'newest':
        query = query.order('created_at', { ascending: false })
        break
      case 'popular':
        query = query.order('upvotes_count', { ascending: false })
        break
    }

    const { data, error } = await query
    return { data: data || [], error }
  }, [supabase, selectedCategory, searchQuery, sortBy])

  const { data: agents, loading, error, refetch } = useSupabaseData<Agent[]>(
    `agents-${selectedCategory}-${searchQuery}-${sortBy}`,
    fetchAgents,
    [selectedCategory, searchQuery, sortBy],
    { 
      retries: 3, 
      retryDelay: 1000,
      cacheTime: 5 * 60 * 1000, // 5 minutes
      staleTime: 30 * 1000 // 30 seconds
    }
  )

  const handleUpvote = () => {
    // Refresh agents to update upvote counts
    refetch()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold">AI Agents</h1>
              </div>
              <p className="text-gray-600">
                Discover intelligent agents that can help with productivity, creativity, and automation.
              </p>
            </div>
            <Button asChild size="lg">
              <Link href="/publish" className="flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Publish Agent
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Discover AI Agents</CardTitle>
            <CardDescription>
              Find AI agents that match your needs and interests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search AI agents..."
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

      {/* Agents Grid */}
      <div className="container mx-auto px-4 pb-16">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-10 h-10 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Failed to load agents</h3>
                <p className="text-muted-foreground mb-6">
                  {error.message || 'Something went wrong while loading agents'}
                </p>
                <Button onClick={refetch} variant="outline">
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : !agents || agents.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No AI agents found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery || selectedCategory !== 'All'
                    ? 'Try adjusting your search or filters'
                    : 'Be the first to publish an AI agent!'}
                </p>
                <Button asChild>
                  <Link href="/publish">Publish First Agent</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">
                {agents.length} AI Agent{agents.length !== 1 ? 's' : ''} Found
              </h2>
            </div>
            
            <div className="grid gap-4">
              {agents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  onUpvote={handleUpvote}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
