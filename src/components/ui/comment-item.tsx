'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Edit, Trash2, Save, X } from 'lucide-react'
import { Comment } from '@/lib/supabase'
import { toast } from 'sonner'
import { commentSchema } from '@/lib/validation'
import { sanitizeComment } from '@/lib/sanitization'

interface CommentItemProps {
  comment: Comment
  currentUserId?: string
  onUpdate: (commentId: string, content: string) => Promise<void>
  onDelete: (commentId: string) => Promise<void>
  isUpdating?: boolean
  isDeleting?: boolean
}

export function CommentItem({
  comment,
  currentUserId,
  onUpdate,
  onDelete,
  isUpdating = false,
  isDeleting = false
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const isOwner = currentUserId === comment.user_id

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const handleSave = async () => {
    const validation = commentSchema.safeParse({ content: editContent.trim() })
    if (!validation.success) {
      toast.error(validation.error.issues[0].message)
      return
    }

    const sanitized = sanitizeComment(validation.data.content)
    await onUpdate(comment.id, sanitized)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditContent(comment.content)
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment?')) return
    await onDelete(comment.id)
  }

  return (
    <div className="flex gap-3 group">
      <Avatar className="h-10 w-10 flex-shrink-0">
        <AvatarImage src={comment.user?.avatar_url} />
        <AvatarFallback>
          {comment.user?.username?.charAt(0).toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">{comment.user?.username}</span>
            <span className="text-xs text-muted-foreground">
              {formatDate(comment.created_at)}
            </span>
            {comment.updated_at !== comment.created_at && (
              <span className="text-xs text-muted-foreground italic">
                (edited)
              </span>
            )}
          </div>
          
          {isOwner && !isEditing && (
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                disabled={isUpdating || isDeleting}
                className="h-8 px-2"
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={isUpdating || isDeleting}
                className="h-8 px-2 text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="mt-2 space-y-2">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[80px]"
              maxLength={1000}
              autoFocus
            />
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isUpdating || !editContent.trim()}
              >
                <Save className="h-3 w-3 mr-1" />
                {isUpdating ? 'Saving...' : 'Save'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCancel}
                disabled={isUpdating}
              >
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
              <span className="text-xs text-muted-foreground ml-auto">
                {editContent.length}/1000
              </span>
            </div>
          </div>
        ) : (
          <p className="text-sm mt-1 whitespace-pre-wrap break-words">
            {comment.content}
          </p>
        )}
      </div>
    </div>
  )
}

