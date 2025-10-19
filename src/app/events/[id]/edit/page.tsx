'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useEvent, useUpdateEvent } from '@/hooks/useEvents'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { ArrowLeft, Save, CalendarDays } from 'lucide-react'
import { handleError } from '@/lib/error-handler'

const CATEGORIES = [
  'Workshop',
  'Conference',
  'Meetup',
  'Webinar',
  'Hackathon',
  'Training',
  'Networking',
  'Demo',
  'Other'
]

const EVENT_TYPES = [
  { value: 'online', label: 'Online Event' },
  { value: 'in-person', label: 'In-Person Event' },
  { value: 'hybrid', label: 'Hybrid Event' }
]

export default function EditEventPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const eventId = Array.isArray(params.id) ? params.id[0] : (params.id as string)

  const { data: event, isLoading } = useEvent(eventId)
  const updateMutation = useUpdateEvent()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: '',
    location: '',
    event_url: '',
    start_date: '',
    end_date: '',
    max_attendees: '',
    category: '',
    tags: '',
    thumbnail_url: '',
    registration_deadline: '',
    requirements: '',
    agenda: '',
  })

  useEffect(() => {
    if (event) {
      // Check ownership
      if (event.organizer_id !== user?.id) {
        toast.error('You can only edit your own events')
        router.push(`/events/${eventId}`)
        return
      }

      setFormData({
        title: event.title,
        description: event.description,
        event_type: event.event_type,
        location: event.location || '',
        event_url: event.event_url || '',
        start_date: event.start_date ? event.start_date.slice(0, 16) : '',
        end_date: event.end_date ? event.end_date.slice(0, 16) : '',
        max_attendees: event.max_attendees?.toString() || '',
        category: event.category,
        tags: event.tags?.join(', ') || '',
        thumbnail_url: event.thumbnail_url || '',
        registration_deadline: event.registration_deadline ? event.registration_deadline.slice(0, 16) : '',
        requirements: event.requirements || '',
        agenda: event.agenda || '',
      })
    }
  }, [event, user, eventId, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!event || !user) return

    const updateData = {
      title: formData.title,
      description: formData.description,
      event_type: formData.event_type as 'online' | 'in-person' | 'hybrid',
      location: formData.location || undefined,
      event_url: formData.event_url || undefined,
      start_date: formData.start_date,
      end_date: formData.end_date,
      max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : undefined,
      category: formData.category,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      thumbnail_url: formData.thumbnail_url || undefined,
      registration_deadline: formData.registration_deadline || undefined,
      requirements: formData.requirements || undefined,
      agenda: formData.agenda || undefined,
      updated_at: new Date().toISOString(),
    }

    updateMutation.mutate(
      { eventId: event.id, data: updateData },
      {
        onSuccess: () => {
          toast.success('Event updated successfully!')
          router.push(`/events/${event.id}`)
        },
        onError: (error) => {
          const errorMessage = handleError(error, 'Error updating event', 'Failed to update event')
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

  if (!event) {
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
              <CalendarDays className="h-6 w-6 mr-2" />
              Edit Event
            </CardTitle>
            <CardDescription>
              Update your event information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Event Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="AI Agent Hackathon 2024"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description *</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your event..."
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Event Type *</label>
                  <Select value={formData.event_type} onValueChange={(value) => setFormData({ ...formData, event_type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {EVENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Category *</label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
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
              </div>

              {formData.event_type === 'in-person' || formData.event_type === 'hybrid' ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="123 Main St, City, Country"
                  />
                </div>
              ) : null}

              {formData.event_type === 'online' || formData.event_type === 'hybrid' ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Event URL</label>
                  <Input
                    value={formData.event_url}
                    onChange={(e) => setFormData({ ...formData, event_url: e.target.value })}
                    placeholder="https://zoom.us/meeting-link"
                    type="url"
                  />
                </div>
              ) : null}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Date & Time *</label>
                  <Input
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">End Date & Time *</label>
                  <Input
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Max Attendees</label>
                  <Input
                    type="number"
                    value={formData.max_attendees}
                    onChange={(e) => setFormData({ ...formData, max_attendees: e.target.value })}
                    placeholder="100"
                    min="1"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Registration Deadline</label>
                  <Input
                    type="datetime-local"
                    value={formData.registration_deadline}
                    onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Tags</label>
                <Input
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="ai, hackathon, workshop (comma-separated)"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Thumbnail URL</label>
                <Input
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  placeholder="https://example.com/event-image.png"
                  type="url"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Requirements</label>
                <Textarea
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  placeholder="List any requirements for attendees..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Agenda</label>
                <Textarea
                  value={formData.agenda}
                  onChange={(e) => setFormData({ ...formData, agenda: e.target.value })}
                  placeholder="Event schedule and activities..."
                  rows={4}
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


