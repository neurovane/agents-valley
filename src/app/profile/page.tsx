'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase-client'
import { Profile } from '@/lib/supabase'
import { useUserAgents, useDeleteAgent } from '@/hooks/useAgents'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { handleError } from '@/lib/error-handler'
import { User, Mail, Calendar, Edit3, Save, X, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  const { user, profile, loading } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [editProfile, setEditProfile] = useState<Partial<Profile>>({})
  const supabase = createClient()

  const { data: userAgents, isLoading: agentsLoading, error: agentsError } = useUserAgents(user?.id)
  const deleteAgentMutation = useDeleteAgent()

  useEffect(() => {
    if (profile) {
      setEditProfile(profile)
    }
  }, [profile])

  const handleDeleteAgent = async (agentId: string, agentName: string) => {
    if (!confirm(`Are you sure you want to delete "${agentName}"? This action cannot be undone.`)) {
      return
    }

    deleteAgentMutation.mutate(agentId, {
      onSuccess: () => {
        toast.success('Agent deleted successfully')
      },
      onError: (error) => {
        const errorMessage = handleError(error, 'Error deleting agent', 'Failed to delete agent')
        toast.error(errorMessage)
      },
    })
  }

  const handleSaveProfile = async () => {
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .update({
        username: editProfile.username,
        avatar_url: editProfile.avatar_url,
      })
      .eq('id', user.id)

    if (error) {
      toast.error('Failed to update profile')
    } else {
      toast.success('Profile updated successfully!')
      setIsEditing(false)
    }
  }

  const handleCancelEdit = () => {
    setEditProfile(profile || {})
    setIsEditing(false)
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Please sign in to view your profile.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.avatar_url || ''} alt={profile.username} />
                <AvatarFallback className="text-lg">
                  {profile.username?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{profile.username}</CardTitle>
                <CardDescription className="flex items-center space-x-4 mt-2">
                  <span className="flex items-center">
                    <Mail className="h-4 w-4 mr-1" />
                    {profile.email}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Joined {new Date(profile.created_at).toLocaleDateString()}
                  </span>
                </CardDescription>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? <X className="h-4 w-4 mr-2" /> : <Edit3 className="h-4 w-4 mr-2" />}
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>
        </CardHeader>

        {isEditing && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">
                  Username
                </label>
                <Input
                  id="username"
                  value={editProfile.username || ''}
                  onChange={(e) => setEditProfile({ ...editProfile, username: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="avatar_url" className="text-sm font-medium">
                  Avatar URL
                </label>
                <Input
                  id="avatar_url"
                  value={editProfile.avatar_url || ''}
                  onChange={(e) => setEditProfile({ ...editProfile, avatar_url: e.target.value })}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleSaveProfile}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={handleCancelEdit}>
                Cancel
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* User's Agents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            My Agents ({userAgents?.length || 0})
          </CardTitle>
          <CardDescription>
            Agents you&apos;ve published on AgentsValley
          </CardDescription>
        </CardHeader>
        <CardContent>
          {agentsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-gray-200 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : !userAgents || userAgents.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                You haven&apos;t published any agents yet.
              </p>
              <Button asChild>
                <Link href="/publish">Publish Your First Agent</Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userAgents.map((agent) => (
                <Card key={agent.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      {agent.thumbnail_url && (
                        <img
                          src={agent.thumbnail_url}
                          alt={agent.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{agent.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {agent.description}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">
                            {agent.upvotes_count} upvotes
                          </span>
                          <div className="flex gap-1">
                            <Button asChild size="sm" variant="outline">
                              <Link href={`/agents/${agent.id}`}>View</Link>
                            </Button>
                            <Button asChild size="sm" variant="ghost">
                              <Link href={`/agents/${agent.id}/edit`}>
                                <Edit className="h-3 w-3" />
                              </Link>
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={(e) => {
                                e.preventDefault()
                                handleDeleteAgent(agent.id, agent.name)
                              }}
                              disabled={deleteAgentMutation.isPending}
                            >
                              <Trash2 className="h-3 w-3 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
