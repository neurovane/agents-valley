'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Agent } from '@/lib/supabase'
import { ChevronUp, ExternalLink, Calendar } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase-client'
import { toast } from 'sonner'

interface AgentCardProps {
  agent: Agent
  onUpvote?: () => void
}

export function AgentCard({ agent, onUpvote }: AgentCardProps) {
  const { user } = useAuth()
  const [isUpvoted, setIsUpvoted] = useState(false)
  const [upvotesCount, setUpvotesCount] = useState(agent.upvotes_count)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleUpvote = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!user) {
      toast.error('Please sign in to upvote')
      return
    }

    setLoading(true)
    
    try {
      if (isUpvoted) {
        // Remove upvote
        const { error } = await supabase
          .from('upvotes')
          .delete()
          .eq('agent_id', agent.id)
          .eq('user_id', user.id)

        if (error) throw error
        
        setIsUpvoted(false)
        setUpvotesCount(prev => prev - 1)
        toast.success('Upvote removed')
      } else {
        // Add upvote
        const { error } = await supabase
          .from('upvotes')
          .insert({
            agent_id: agent.id,
            user_id: user.id,
          })

        if (error) throw error
        
        setIsUpvoted(true)
        setUpvotesCount(prev => prev + 1)
        toast.success('Upvoted!')
      }
      
      onUpvote?.()
    } catch (error: unknown) {
      console.error('Error toggling upvote:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to upvote')
    } finally {
      setLoading(false)
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
    <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer">
      <Link href={`/agents/${agent.id}`}>
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            {/* Thumbnail */}
            <div className="flex-shrink-0">
              {agent.thumbnail_url ? (
                <img
                  src={agent.thumbnail_url}
                  alt={agent.name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {agent.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors truncate">
                    {agent.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {agent.description}
                  </p>
                </div>
                
                {/* Upvote Button */}
                <Button
                  variant={isUpvoted ? "default" : "outline"}
                  size="sm"
                  onClick={handleUpvote}
                  disabled={loading}
                  className="ml-4 flex-shrink-0"
                >
                  <ChevronUp className="h-4 w-4 mr-1" />
                  {upvotesCount}
                </Button>
              </div>

              {/* Meta Info */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center space-x-3">
                  {/* Publisher */}
                  {agent.publisher && (
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={agent.publisher.avatar_url || ''} />
                        <AvatarFallback className="text-xs">
                          {agent.publisher.username?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">
                        {agent.publisher.username}
                      </span>
                    </div>
                  )}

                  {/* Category */}
                  <Badge variant="secondary" className="text-xs">
                    {agent.category}
                  </Badge>

                  {/* Date */}
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(agent.created_at)}</span>
                  </div>
                </div>

                {/* External Links */}
                <div className="flex items-center space-x-2">
                  {agent.demo_link && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        window.open(agent.demo_link, '_blank')
                      }}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Tags */}
              {agent.tags && agent.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {agent.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                  {agent.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{agent.tags.length - 3} more
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  )
}
