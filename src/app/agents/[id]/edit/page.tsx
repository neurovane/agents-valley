'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useAgent, useUpdateAgent } from '@/hooks/useAgents'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { ArrowLeft, Save, Bot } from 'lucide-react'
import { handleError } from '@/lib/error-handler'

const CATEGORIES = [
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

export default function EditAgentPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const agentId = Array.isArray(params.id) ? params.id[0] : (params.id as string)

  const { data: agent, isLoading } = useAgent(agentId)
  const updateMutation = useUpdateAgent()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    tags: '',
    demo_link: '',
    thumbnail_url: '',
  })

  useEffect(() => {
    if (agent) {
      // Check ownership
      if (agent.publisher_id !== user?.id) {
        toast.error('You can only edit your own agents')
        router.push(`/agents/${agentId}`)
        return
      }

      setFormData({
        name: agent.name,
        description: agent.description,
        category: agent.category,
        tags: agent.tags?.join(', ') || '',
        demo_link: agent.demo_link || '',
        thumbnail_url: agent.thumbnail_url || '',
      })
    }
  }, [agent, user, agentId, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!agent || !user) return

    const updateData = {
      name: formData.name,
      description: formData.description,
      category: formData.category,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      demo_link: formData.demo_link || undefined,
      thumbnail_url: formData.thumbnail_url || undefined,
      updated_at: new Date().toISOString(),
    }

    updateMutation.mutate(
      { agentId: agent.id, data: updateData },
      {
        onSuccess: () => {
          toast.success('Agent updated successfully!')
          router.push(`/agents/${agent.id}`)
        },
        onError: (error) => {
          const errorMessage = handleError(error, 'Error updating agent', 'Failed to update agent')
          toast.error(errorMessage)
        },
      }
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!agent) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Button 
          variant="ghost" 
          className="mb-6" 
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Bot className="h-6 w-6 mr-2" />
              Edit AI Agent
            </CardTitle>
            <CardDescription>
              Update your agent&apos;s information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="My Amazing AI Agent"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description *</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what your agent does..."
                  rows={4}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Category *</label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tags</label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="ai, productivity, automation (comma-separated)"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Demo Link</label>
                <Input
                  value={formData.demo_link}
                  onChange={(e) => setFormData({ ...formData, demo_link: e.target.value })}
                  placeholder="https://example.com/demo"
                  type="url"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Thumbnail URL</label>
                <Input
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  placeholder="https://example.com/image.png"
                  type="url"
                />
              </div>

              <div className="flex gap-4">
                <Button 
                  type="submit" 
                  disabled={updateMutation.isPending}
                  className="flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


