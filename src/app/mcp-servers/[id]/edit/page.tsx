'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useMCPServer, useUpdateMCPServer } from '@/hooks/useMCPServers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { ArrowLeft, Save, Server } from 'lucide-react'
import { mcpServerSchema } from '@/lib/validation'
import { sanitizeObject } from '@/lib/sanitization'
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

export default function EditMCPServerPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const mcpId = Array.isArray(params.id) ? params.id[0] : (params.id as string)

  const { data: mcpServer, isLoading } = useMCPServer(mcpId)
  const updateMutation = useUpdateMCPServer()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    tags: '',
    server_url: '',
    documentation_url: '',
    thumbnail_url: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (mcpServer) {
      // Check ownership
      if (mcpServer.publisher_id !== user?.id) {
        toast.error('You can only edit your own MCP servers')
        router.push(`/mcp-servers/${mcpId}`)
        return
      }

      setFormData({
        name: mcpServer.name,
        description: mcpServer.description,
        category: mcpServer.category,
        tags: mcpServer.tags?.join(', ') || '',
        server_url: mcpServer.server_url,
        documentation_url: mcpServer.documentation_url || '',
        thumbnail_url: mcpServer.thumbnail_url || '',
      })
    }
  }, [mcpServer, user, mcpId, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    if (!mcpServer || !user) return

    // Parse and validate form data
    const formDataToValidate = {
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
    }

    const validation = mcpServerSchema.safeParse(formDataToValidate)

    if (!validation.success) {
      const newErrors: Record<string, string> = {}
      validation.error.issues.forEach((err) => {
        const path = err.path.join('.')
        newErrors[path] = err.message
      })
      setErrors(newErrors)
      toast.error('Please fix the validation errors')
      return
    }

    // Sanitize data
    const sanitizedData = sanitizeObject({
      name: validation.data.name,
      description: validation.data.description,
      category: validation.data.category,
      tags: validation.data.tags,
      server_url: validation.data.server_url,
      documentation_url: validation.data.documentation_url || undefined,
      thumbnail_url: validation.data.thumbnail_url || undefined,
      updated_at: new Date().toISOString(),
    })

    updateMutation.mutate(
      { mcpId: mcpServer.id, data: sanitizedData },
      {
        onSuccess: () => {
          toast.success('MCP server updated successfully!')
          router.push(`/mcp-servers/${mcpServer.id}`)
        },
        onError: (error) => {
          const errorMessage = handleError(error, 'Error updating MCP server', 'Failed to update MCP server')
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
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!mcpServer) {
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
              <Server className="h-6 w-6 mr-2" />
              Edit MCP Server
            </CardTitle>
            <CardDescription>
              Update your MCP server information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="My MCP Server"
                  required
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description *</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what your MCP server does..."
                  rows={4}
                  required
                />
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description}</p>
                )}
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
                {errors.category && (
                  <p className="text-sm text-red-600">{errors.category}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tags</label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="mcp, server, api (comma-separated)"
                />
                {errors.tags && (
                  <p className="text-sm text-red-600">{errors.tags}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Server URL *</label>
                <Input
                  value={formData.server_url}
                  onChange={(e) => setFormData({ ...formData, server_url: e.target.value })}
                  placeholder="https://example.com/mcp-server"
                  type="url"
                  required
                />
                {errors.server_url && (
                  <p className="text-sm text-red-600">{errors.server_url}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Documentation URL</label>
                <Input
                  value={formData.documentation_url}
                  onChange={(e) => setFormData({ ...formData, documentation_url: e.target.value })}
                  placeholder="https://example.com/docs"
                  type="url"
                />
                {errors.documentation_url && (
                  <p className="text-sm text-red-600">{errors.documentation_url}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Thumbnail URL</label>
                <Input
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  placeholder="https://example.com/image.png"
                  type="url"
                />
                {errors.thumbnail_url && (
                  <p className="text-sm text-red-600">{errors.thumbnail_url}</p>
                )}
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

