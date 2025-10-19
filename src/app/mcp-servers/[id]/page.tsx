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
import { useMCPServer, useMCPUpvoteStatus, useUpvoteMCP, useDeleteMCPServer } from '@/hooks/useMCPServers'
import { useMCPComments, useAddMCPComment } from '@/hooks/useComments'
import { toast } from 'sonner'
import { sanitizeComment } from '@/lib/sanitization'
import { commentSchema } from '@/lib/validation'
import { handleError } from '@/lib/error-handler'
import { 
  ChevronUp, 
  ExternalLink, 
  Calendar, 
  Tag, 
  MessageCircle,
  Send,
  ArrowLeft,
  Server,
  Edit,
  Trash2,
  FileText
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function MCPServerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const mcpId = Array.isArray(params.id) ? params.id[0] : (params.id as string)

  const [newComment, setNewComment] = useState('')

  // Fetch MCP server details
  const { data: mcpServer, isLoading: mcpLoading, error: mcpError } = useMCPServer(mcpId)
  
  // Fetch comments
  const { data: comments = [], isLoading: commentsLoading } = useMCPComments(mcpId)
  
  // Check upvote status
  const { data: isUpvoted = false } = useMCPUpvoteStatus(mcpId)
  
  // Upvote mutation
  const upvoteMutation = useUpvoteMCP()
  
  // Add comment mutation
  const addCommentMutation = useAddMCPComment()
  
  // Delete mutation
  const deleteMutation = useDeleteMCPServer()

  // Redirect if MCP server not found
  useEffect(() => {
    if (mcpError) {
      toast.error('MCP Server not found')
      router.push('/mcp-servers')
    }
  }, [mcpError, router])

  const handleUpvote = async () => {
    if (!user) {
      toast.error('Please sign in to upvote')
      return
    }

    if (!mcpServer) return

    upvoteMutation.mutate(
      { mcpId: mcpServer.id, isUpvoted },
      {
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

    if (!mcpServer || !newComment.trim()) return

    // Validate comment
    const validation = commentSchema.safeParse({ content: newComment.trim() })
    if (!validation.success) {
      toast.error(validation.error.issues[0].message)
      return
    }

    // Sanitize comment
    const sanitizedComment = sanitizeComment(validation.data.content)

    addCommentMutation.mutate(
      { id: mcpServer.id, content: sanitizedComment },
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
    if (!mcpServer || !user) return
    
    if (!confirm('Are you sure you want to delete this MCP server? This action cannot be undone.')) {
      return
    }

    deleteMutation.mutate(mcpServer.id, {
      onSuccess: () => {
        toast.success('MCP server deleted successfully')
        router.push('/mcp-servers')
      },
      onError: (error) => {
        const errorMessage = handleError(error, 'Error deleting MCP server', 'Failed to delete MCP server')
        toast.error(errorMessage)
      },
    })
  }

  const isOwner = user && mcpServer && mcpServer.publisher_id === user.id

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (mcpLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!mcpServer) {
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
                <Link href={`/mcp-servers/${mcpServer.id}/edit`}>
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
            {/* MCP Server Header */}
            <Card>
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Thumbnail */}
                  <div className="flex-shrink-0">
                    {mcpServer.thumbnail_url ? (
                      <Image
                        src={mcpServer.thumbnail_url}
                        alt={mcpServer.name}
                        width={128}
                        height={128}
                        className="w-32 h-32 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-lg bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
                        <span className="text-white font-bold text-4xl">
                          {mcpServer.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h1 className="text-3xl font-bold mb-2">{mcpServer.name}</h1>
                        <Badge variant="secondary" className="mb-4">
                          {mcpServer.category}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-muted-foreground mb-4">{mcpServer.description}</p>

                    {/* Tags */}
                    {mcpServer.tags && mcpServer.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {mcpServer.tags.map((tag, index) => (
                          <Badge key={index} variant="outline">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Links */}
                    <div className="flex flex-wrap gap-3">
                      {mcpServer.server_url && (
                        <Button asChild variant="default">
                          <a href={mcpServer.server_url} target="_blank" rel="noopener noreferrer">
                            <Server className="h-4 w-4 mr-2" />
                            Server URL
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </Button>
                      )}
                      {mcpServer.documentation_url && (
                        <Button asChild variant="outline">
                          <a href={mcpServer.documentation_url} target="_blank" rel="noopener noreferrer">
                            <FileText className="h-4 w-4 mr-2" />
                            Documentation
                            <ExternalLink className="h-3 w-3 ml-1" />
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
              </CardHeader>
              <CardContent>
                {/* Add Comment Form */}
                {user && (
                  <form onSubmit={handleSubmitComment} className="mb-6">
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Share your thoughts..."
                      className="mb-2"
                      rows={3}
                      maxLength={1000}
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {newComment.length}/1000 characters
                      </span>
                      <Button 
                        type="submit" 
                        disabled={!newComment.trim() || addCommentMutation.isPending}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {addCommentMutation.isPending ? 'Posting...' : 'Post Comment'}
                      </Button>
                    </div>
                  </form>
                )}

                {!user && (
                  <div className="text-center py-4 mb-6 bg-muted rounded-lg">
                    <p className="text-muted-foreground">
                      Please sign in to comment
                    </p>
                  </div>
                )}

                <Separator className="my-6" />

                {/* Comments List */}
                {commentsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                        <div className="h-16 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : comments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No comments yet. Be the first to comment!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={comment.user?.avatar_url} />
                          <AvatarFallback>
                            {comment.user?.username?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{comment.user?.username}</span>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(comment.created_at)}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
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
            {/* Upvote Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Support this server</CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={handleUpvote}
                  disabled={!user || upvoteMutation.isPending}
                  variant={isUpvoted ? "default" : "outline"}
                  className="w-full"
                >
                  <ChevronUp className="h-5 w-5 mr-2" />
                  {isUpvoted ? 'Upvoted' : 'Upvote'}
                  <span className="ml-2">({mcpServer.upvotes_count})</span>
                </Button>
              </CardContent>
            </Card>

            {/* Publisher Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Publisher</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={mcpServer.publisher?.avatar_url} />
                    <AvatarFallback>
                      {mcpServer.publisher?.username?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{mcpServer.publisher?.username}</p>
                    <p className="text-sm text-muted-foreground">
                      {mcpServer.publisher?.email}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Published {formatDate(mcpServer.created_at)}</span>
                </div>
                {mcpServer.updated_at !== mcpServer.created_at && (
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Updated {formatDate(mcpServer.updated_at)}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

