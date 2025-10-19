'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/contexts/AuthContext'
import { useAgent, useAgentUpvoteStatus, useUpvoteAgent, useDeleteAgent } from '@/hooks/useAgents'
import { useAgentComments, useAddComment } from '@/hooks/useComments'
import { toast } from 'sonner'
import { handleError } from '@/lib/error-handler'
import { 
  ChevronUp, 
  ExternalLink, 
  Calendar, 
  Tag, 
  MessageCircle,
  Send,
  ArrowLeft,
  Bot,
  Edit,
  Trash2
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function AgentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [newComment, setNewComment] = useState('')
  const agentId = Array.isArray(params.id) ? params.id[0] : (params.id as string)

  // Fetch agent data
  const { data: agent, isLoading: loading, error: agentError } = useAgent(agentId)
  
  // Fetch comments
  const { data: comments = [], isLoading: commentsLoading } = useAgentComments(agentId)
  
  // Check upvote status
  const { data: isUpvoted = false } = useAgentUpvoteStatus(agentId)
  
  // Upvote mutation
  const upvoteMutation = useUpvoteAgent()
  
  // Add comment mutation
  const addCommentMutation = useAddComment('agent')
  
  // Delete mutation
  const deleteMutation = useDeleteAgent()

  // Redirect if agent not found
  useEffect(() => {
    if (agentError) {
      toast.error('Agent not found')
      router.push('/agents')
    }
  }, [agentError, router])

  const handleUpvote = async () => {
    if (!user) {
      toast.error('Please sign in to upvote')
      return
    }

    if (!agent) return

    upvoteMutation.mutate(
      { agentId: agent.id, isUpvoted },
      {
        onSuccess: () => {
          toast.success(isUpvoted ? 'Upvote removed' : 'Upvoted!')
        },
        onError: (error) => {
          const errorMessage = handleError(error, 'Error toggling upvote', 'Failed to upvote')
          toast.error(errorMessage)
        },
      }
    )
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      toast.error('Please sign in to comment')
      return
    }

    if (!agent || !newComment.trim()) return

    addCommentMutation.mutate(
      { id: agent.id, content: newComment.trim() },
      {
        onSuccess: () => {
          setNewComment('')
          toast.success('Comment added!')
        },
        onError: (error) => {
          const errorMessage = handleError(error, 'Error adding comment', 'Failed to add comment')
          toast.error(errorMessage)
        },
      }
    )
  }

  const handleDelete = async () => {
    if (!agent || !user) return
    
    if (!confirm('Are you sure you want to delete this agent? This action cannot be undone.')) {
      return
    }

    deleteMutation.mutate(agent.id, {
      onSuccess: () => {
        toast.success('Agent deleted successfully')
        router.push('/agents')
      },
      onError: (error) => {
        const errorMessage = handleError(error, 'Error deleting agent', 'Failed to delete agent')
        toast.error(errorMessage)
      },
    })
  }

  const isOwner = user && agent && agent.publisher_id === user.id

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
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!agent) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button & Actions */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          {isOwner && (
            <div className="flex gap-2">
              <Button 
                variant="outline"
                asChild
              >
                <Link href={`/agents/${agent.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Agent Header */}
            <Card>
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Thumbnail */}
                  <div className="flex-shrink-0">
                    {agent.thumbnail_url ? (
                      <Image
                        src={agent.thumbnail_url}
                        alt={agent.name}
                        width={128}
                        height={128}
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
                        disabled={upvoteMutation.isPending}
                        className="flex items-center"
                      >
                        <ChevronUp className="h-5 w-5 mr-2" />
                        {agent.upvotes_count || 0} Upvotes
                      </Button>
                    </div>

                    {/* Publisher Info */}
                    {agent.publisher && (
                      <div className="flex items-center space-x-3 p-4 bg-muted rounded-lg">
                        <Avatar>
                          <AvatarImage src={agent.publisher.avatar_url} />
                          <AvatarFallback>
                            {agent.publisher.username?.[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm text-muted-foreground">Published by</p>
                          <p className="font-medium">{agent.publisher.username || 'Anonymous'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">{agent.description}</p>
              </CardContent>
            </Card>

            {/* Links */}
            {(agent.mcp_server_url || agent.demo_link) && (
              <Card>
                <CardHeader>
                  <CardTitle>Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {agent.mcp_server_url && (
                    <Link 
                      href={agent.mcp_server_url} 
                      target="_blank"
                      className="flex items-center text-blue-600 hover:underline"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      MCP Server
                    </Link>
                  )}
                  {agent.demo_link && (
                    <Link 
                      href={agent.demo_link} 
                      target="_blank"
                      className="flex items-center text-blue-600 hover:underline"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Demo
                    </Link>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Comments Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Comments ({comments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Comment Form */}
                {user ? (
                  <form onSubmit={handleSubmitComment} className="space-y-4">
                    <Textarea
                      placeholder="Share your thoughts..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={3}
                    />
                    <Button 
                      type="submit" 
                      disabled={!newComment.trim() || addCommentMutation.isPending}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {addCommentMutation.isPending ? 'Posting...' : 'Post Comment'}
                    </Button>
                  </form>
                ) : (
                  <div className="text-center p-6 bg-muted rounded-lg">
                    <p className="text-muted-foreground mb-4">Please sign in to comment</p>
                  </div>
                )}

                <Separator />

                {/* Comments List */}
                {commentsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-20 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No comments yet. Be the first!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {comments.map((comment) => (
                      <div key={comment.id} className="space-y-2">
                        <div className="flex items-start space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={comment.user?.avatar_url} />
                            <AvatarFallback>
                              {comment.user?.username?.[0]?.toUpperCase() || 'U'}
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
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tags */}
            {agent.tags && agent.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Tag className="h-4 w-4 mr-2" />
                    Tags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {agent.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Upvotes</span>
                  <span className="font-semibold">{agent.upvotes_count || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Comments</span>
                  <span className="font-semibold">{comments.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

