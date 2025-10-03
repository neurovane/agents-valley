'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'
import { Agent, Comment } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { 
  ChevronUp, 
  ExternalLink, 
  Calendar, 
  Tag, 
  MessageCircle,
  Send,
  ArrowLeft,
  Bot
} from 'lucide-react'
import Link from 'next/link'

export default function AgentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [agent, setAgent] = useState<Agent | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [commentsLoading, setCommentsLoading] = useState(true)
  const [isUpvoted, setIsUpvoted] = useState(false)
  const [upvotesCount, setUpvotesCount] = useState(0)
  const [newComment, setNewComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [upvoting, setUpvoting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (params.id) {
      fetchAgent()
      fetchComments()
    }
  }, [params.id])

  useEffect(() => {
    if (agent && user) {
      checkUpvoteStatus()
    }
  }, [agent, user])

  const fetchAgent = async () => {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select(`
          *,
          publisher:profiles(*)
        `)
        .eq('id', params.id)
        .single()

      if (error) {
        console.error('Error fetching agent:', error)
        toast.error('Agent not found')
        router.push('/')
        return
      }

      setAgent(data)
      setUpvotesCount(data.upvotes_count)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to load agent')
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user:profiles(*)
        `)
        .eq('agent_id', params.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching comments:', error)
      } else {
        setComments(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setCommentsLoading(false)
    }
  }

  const checkUpvoteStatus = async () => {
    if (!user || !agent) return

    try {
      const { data, error } = await supabase
        .from('upvotes')
        .select('id')
        .eq('agent_id', agent.id)
        .eq('user_id', user.id)
        .single()

      if (!error && data) {
        setIsUpvoted(true)
      }
    } catch (error) {
      // User hasn't upvoted
      setIsUpvoted(false)
    }
  }

  const handleUpvote = async () => {
    if (!user) {
      toast.error('Please sign in to upvote')
      return
    }

    if (!agent) return

    setUpvoting(true)
    
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
    } catch (error: unknown) {
      console.error('Error toggling upvote:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to upvote')
    } finally {
      setUpvoting(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast.error('Please sign in to comment')
      return
    }

    if (!agent || !newComment.trim()) return

    setSubmittingComment(true)
    
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          agent_id: agent.id,
          user_id: user.id,
          content: newComment.trim(),
        })

      if (error) throw error

      setNewComment('')
      toast.success('Comment added!')
      fetchComments() // Refresh comments
    } catch (error: unknown) {
      console.error('Error submitting comment:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to add comment')
    } finally {
      setSubmittingComment(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
          <div className="h-32 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  if (!agent) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Agent not found.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      {/* Agent Header */}
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Thumbnail */}
            <div className="flex-shrink-0">
              {agent.thumbnail_url ? (
                <img
                  src={agent.thumbnail_url}
                  alt={agent.name}
                  className="w-32 h-32 rounded-lg object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-4xl">
                    {agent.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{agent.name}</h1>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(agent.created_at)}
                    </div>
                    <Badge variant="secondary">{agent.category}</Badge>
                  </div>
                </div>
                
                {/* Upvote Button */}
                <Button
                  variant={isUpvoted ? "default" : "outline"}
                  size="lg"
                  onClick={handleUpvote}
                  disabled={upvoting}
                  className="flex items-center"
                >
                  <ChevronUp className="h-5 w-5 mr-2" />
                  {upvotesCount} Upvotes
                </Button>
              </div>

              {/* Publisher Info */}
              {agent.publisher && (
                <div className="flex items-center space-x-3 mb-6">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={agent.publisher.avatar_url || ''} />
                    <AvatarFallback>
                      {agent.publisher.username?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">Published by</p>
                    <Link 
                      href={`/profile`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {agent.publisher.username}
                    </Link>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="prose max-w-none mb-6">
                <p className="text-lg leading-relaxed whitespace-pre-wrap">
                  {agent.description}
                </p>
              </div>

              {/* Tags */}
              {agent.tags && agent.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {agent.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="flex items-center">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* External Links */}
              <div className="flex flex-wrap gap-4">
                {agent.demo_link && (
                  <Button asChild variant="outline">
                    <a href={agent.demo_link} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Demo
                    </a>
                  </Button>
                )}
                {agent.mcp_server_url && (
                  <Button asChild variant="outline">
                    <a href={agent.mcp_server_url} target="_blank" rel="noopener noreferrer">
                      <Bot className="h-4 w-4 mr-2" />
                      MCP Server
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageCircle className="h-5 w-5 mr-2" />
            Comments ({comments.length})
          </CardTitle>
          <CardDescription>
            Share your thoughts and feedback about this agent
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add Comment Form */}
          {user ? (
            <form onSubmit={handleSubmitComment} className="space-y-4">
              <div className="flex items-start space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {user.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder="Share your thoughts about this agent..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={!newComment.trim() || submittingComment}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {submittingComment ? 'Posting...' : 'Post Comment'}
                </Button>
              </div>
            </form>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Please sign in to leave a comment
              </p>
              <Button asChild>
                <Link href="/auth">Sign In</Link>
              </Button>
            </div>
          )}

          <Separator />

          {/* Comments List */}
          {commentsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No comments yet. Be the first to share your thoughts!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.user?.avatar_url || ''} />
                    <AvatarFallback>
                      {comment.user?.username?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm">
                        {comment.user?.username || 'Anonymous'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
