'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { Upload, Bot, Server, Link as LinkIcon, Tag, FileText, Plus } from 'lucide-react'
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

export default function PublishPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('agent')
  const [agentFormData, setAgentFormData] = useState({
    name: '',
    description: '',
    category: '',
    tags: '',
    demo_link: '',
    thumbnail_url: '',
  })
  const [mcpFormData, setMcpFormData] = useState({
    name: '',
    description: '',
    category: '',
    tags: '',
    server_url: '',
    documentation_url: '',
    thumbnail_url: '',
  })
  const supabase = createClient()

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Please sign in to publish an agent.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleAgentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate required fields
      if (!agentFormData.name.trim()) {
        throw new Error('Agent name is required')
      }
      if (!agentFormData.description.trim()) {
        throw new Error('Description is required')
      }
      if (!agentFormData.category) {
        throw new Error('Category is required')
      }
      if (agentFormData.name.length < 3) {
        throw new Error('Agent name must be at least 3 characters')
      }
      if (agentFormData.description.length < 10) {
        throw new Error('Description must be at least 10 characters')
      }

      // Parse tags from comma-separated string
      const tagsArray = agentFormData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      const { data, error } = await supabase
        .from('agents')
        .insert({
          name: agentFormData.name.trim(),
          description: agentFormData.description.trim(),
          category: agentFormData.category,
          tags: tagsArray,
          demo_link: agentFormData.demo_link?.trim() || null,
          thumbnail_url: agentFormData.thumbnail_url?.trim() || null,
          publisher_id: user.id,
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      toast.success('Agent published successfully!')
      router.push(`/agents/${data.id}`)
    } catch (error: unknown) {
      const errorMessage = handleError(error, 'Error publishing agent', 'Failed to publish agent')
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleMCPServerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate required fields
      if (!mcpFormData.name.trim()) {
        throw new Error('MCP Server name is required')
      }
      if (!mcpFormData.description.trim()) {
        throw new Error('Description is required')
      }
      if (!mcpFormData.category) {
        throw new Error('Category is required')
      }
      if (!mcpFormData.server_url.trim()) {
        throw new Error('Server URL is required')
      }
      if (mcpFormData.name.length < 3) {
        throw new Error('MCP Server name must be at least 3 characters')
      }
      if (mcpFormData.description.length < 10) {
        throw new Error('Description must be at least 10 characters')
      }

      // Parse tags from comma-separated string
      const tagsArray = mcpFormData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      const { data, error } = await supabase
        .from('mcp_servers')
        .insert({
          name: mcpFormData.name.trim(),
          description: mcpFormData.description.trim(),
          category: mcpFormData.category,
          tags: tagsArray,
          server_url: mcpFormData.server_url.trim(),
          documentation_url: mcpFormData.documentation_url?.trim() || null,
          thumbnail_url: mcpFormData.thumbnail_url?.trim() || null,
          publisher_id: user.id,
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      toast.success('MCP Server published successfully!')
      router.push(`/mcp-servers/${data.id}`)
    } catch (error: unknown) {
      const errorMessage = handleError(error, 'Error publishing MCP server', 'Failed to publish MCP server')
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleAgentInputChange = (field: string, value: string) => {
    setAgentFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleMCPInputChange = (field: string, value: string) => {
    setMcpFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="h-6 w-6 mr-2" />
            Publish New Content
          </CardTitle>
          <CardDescription>
            Share your AI agent or MCP server with the AgentsValley community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="agent" className="flex items-center">
                <Bot className="h-4 w-4 mr-2" />
                AI Agent
              </TabsTrigger>
              <TabsTrigger value="mcp" className="flex items-center">
                <Server className="h-4 w-4 mr-2" />
                MCP Server
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="agent" className="space-y-6">
              <form onSubmit={handleAgentSubmit} className="space-y-6">
            {/* Agent Name */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Agent Name *
              </label>
              <Input
                id="name"
                placeholder="Enter agent name"
                value={agentFormData.name}
                onChange={(e) => handleAgentInputChange('name', e.target.value)}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description *
              </label>
              <Textarea
                id="description"
                placeholder="Describe what your agent does, its capabilities, and how it can help users..."
                value={agentFormData.description}
                onChange={(e) => handleAgentInputChange('description', e.target.value)}
                rows={4}
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">
                Category *
              </label>
              <Select
                value={agentFormData.category}
                onValueChange={(value) => handleAgentInputChange('category', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label htmlFor="tags" className="text-sm font-medium flex items-center">
                <Tag className="h-4 w-4 mr-1" />
                Tags
              </label>
              <Input
                id="tags"
                placeholder="ai, productivity, automation (comma-separated)"
                value={agentFormData.tags}
                onChange={(e) => handleAgentInputChange('tags', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Separate tags with commas
              </p>
            </div>

            {/* Thumbnail URL */}
            <div className="space-y-2">
              <label htmlFor="thumbnail_url" className="text-sm font-medium flex items-center">
                <Upload className="h-4 w-4 mr-1" />
                Thumbnail URL
              </label>
              <Input
                id="thumbnail_url"
                placeholder="https://example.com/agent-thumbnail.jpg"
                value={agentFormData.thumbnail_url}
                onChange={(e) => handleAgentInputChange('thumbnail_url', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Optional: URL to an image representing your agent
              </p>
            </div>

            {/* Demo Link */}
            <div className="space-y-2">
              <label htmlFor="demo_link" className="text-sm font-medium flex items-center">
                <LinkIcon className="h-4 w-4 mr-1" />
                Demo Link
              </label>
              <Input
                id="demo_link"
                placeholder="https://demo.example.com"
                value={agentFormData.demo_link}
                onChange={(e) => handleAgentInputChange('demo_link', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Optional: Link to a live demo or documentation
              </p>
            </div>

                {/* Submit Button */}
                <div className="flex space-x-4">
                  <Button
                    type="submit"
                    disabled={loading || !agentFormData.name || !agentFormData.description || !agentFormData.category}
                    className="flex-1"
                  >
                    {loading ? 'Publishing...' : 'Publish Agent'}
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
            </TabsContent>
            
            <TabsContent value="mcp" className="space-y-6">
              <form onSubmit={handleMCPServerSubmit} className="space-y-6">
                {/* MCP Server Name */}
                <div className="space-y-2">
                  <label htmlFor="mcp-name" className="text-sm font-medium">
                    MCP Server Name *
                  </label>
                  <Input
                    id="mcp-name"
                    placeholder="Enter MCP server name"
                    value={mcpFormData.name}
                    onChange={(e) => handleMCPInputChange('name', e.target.value)}
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label htmlFor="mcp-description" className="text-sm font-medium">
                    Description *
                  </label>
                  <Textarea
                    id="mcp-description"
                    placeholder="Describe what your MCP server does, its capabilities, and how it can help users..."
                    value={mcpFormData.description}
                    onChange={(e) => handleMCPInputChange('description', e.target.value)}
                    rows={4}
                    required
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <label htmlFor="mcp-category" className="text-sm font-medium">
                    Category *
                  </label>
                  <Select
                    value={mcpFormData.category}
                    onValueChange={(value) => handleMCPInputChange('category', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <label htmlFor="mcp-tags" className="text-sm font-medium flex items-center">
                    <Tag className="h-4 w-4 mr-1" />
                    Tags
                  </label>
                  <Input
                    id="mcp-tags"
                    placeholder="mcp, server, api, integration (comma-separated)"
                    value={mcpFormData.tags}
                    onChange={(e) => handleMCPInputChange('tags', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate tags with commas
                  </p>
                </div>

                {/* Thumbnail URL */}
                <div className="space-y-2">
                  <label htmlFor="mcp-thumbnail_url" className="text-sm font-medium flex items-center">
                    <Upload className="h-4 w-4 mr-1" />
                    Thumbnail URL
                  </label>
                  <Input
                    id="mcp-thumbnail_url"
                    placeholder="https://example.com/mcp-server-thumbnail.jpg"
                    value={mcpFormData.thumbnail_url}
                    onChange={(e) => handleMCPInputChange('thumbnail_url', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Optional: URL to an image representing your MCP server
                  </p>
                </div>

                {/* Server URL */}
                <div className="space-y-2">
                  <label htmlFor="mcp-server_url" className="text-sm font-medium flex items-center">
                    <Server className="h-4 w-4 mr-1" />
                    Server URL *
                  </label>
                  <Input
                    id="mcp-server_url"
                    placeholder="https://your-mcp-server.com"
                    value={mcpFormData.server_url}
                    onChange={(e) => handleMCPInputChange('server_url', e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    The URL where your MCP server is hosted
                  </p>
                </div>

                {/* Documentation URL */}
                <div className="space-y-2">
                  <label htmlFor="mcp-documentation_url" className="text-sm font-medium flex items-center">
                    <FileText className="h-4 w-4 mr-1" />
                    Documentation URL
                  </label>
                  <Input
                    id="mcp-documentation_url"
                    placeholder="https://docs.example.com"
                    value={mcpFormData.documentation_url}
                    onChange={(e) => handleMCPInputChange('documentation_url', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Optional: Link to documentation or usage guide
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex space-x-4">
                  <Button
                    type="submit"
                    disabled={loading || !mcpFormData.name || !mcpFormData.description || !mcpFormData.category || !mcpFormData.server_url}
                    className="flex-1"
                  >
                    {loading ? 'Publishing...' : 'Publish MCP Server'}
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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
