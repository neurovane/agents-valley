'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase-client'
import { Profile, Agent } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { User, Mail, Calendar, Edit3, Save, X } from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  const { user, profile, loading } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [editProfile, setEditProfile] = useState<Partial<Profile>>({})
  const [userAgents, setUserAgents] = useState<Agent[]>([])
  const [agentsLoading, setAgentsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (profile) {
      setEditProfile(profile)
      fetchUserAgents()
    }
  }, [profile])

  const fetchUserAgents = async () => {
    if (!user) return
    
    const { data, error } = await supabase
      .from('agents')
      .select(`
        *,
        publisher:profiles(*)
      `)
      .eq('publisher_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user agents:', error)
    } else {
      setUserAgents(data || [])
    }
    setAgentsLoading(false)
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
            My Agents ({userAgents.length})
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
          ) : userAgents.length === 0 ? (
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
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/agents/${agent.id}`}>View</Link>
                          </Button>
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
