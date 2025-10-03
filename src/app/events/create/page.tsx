'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Calendar, MapPin, Users, Upload, Tag, Plus } from 'lucide-react'

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

export default function CreateEventPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
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
    is_featured: false
  })
  const supabase = createClient()

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to create an event.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              You need to be signed in to create events.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Parse tags from comma-separated string
      const tagsArray = formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)

      // Validate required fields
      if (!formData.title || !formData.description || !formData.event_type || 
          !formData.start_date || !formData.end_date || !formData.category) {
        toast.error('Please fill in all required fields')
        return
      }

      // Validate dates
      const startDate = new Date(formData.start_date)
      const endDate = new Date(formData.end_date)
      
      if (startDate >= endDate) {
        toast.error('End date must be after start date')
        return
      }

      if (startDate < new Date()) {
        toast.error('Start date cannot be in the past')
        return
      }

      // Validate event type specific fields
      if (formData.event_type === 'in-person' && !formData.location) {
        toast.error('Location is required for in-person events')
        return
      }

      if (formData.event_type === 'online' && !formData.event_url) {
        toast.error('Event URL is required for online events')
        return
      }

      const { data, error } = await supabase
        .from('events')
        .insert({
          title: formData.title,
          description: formData.description,
          event_type: formData.event_type,
          location: formData.location || null,
          event_url: formData.event_url || null,
          start_date: formData.start_date,
          end_date: formData.end_date,
          max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : null,
          category: formData.category,
          tags: tagsArray,
          thumbnail_url: formData.thumbnail_url || null,
          organizer_id: user.id,
          registration_deadline: formData.registration_deadline || null,
          requirements: formData.requirements || null,
          agenda: formData.agenda || null,
          is_featured: formData.is_featured
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      toast.success('Event created successfully!')
      router.push(`/events/${data.id}`)
    } catch (error: unknown) {
      console.error('Error creating event:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create event')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const getMinDateTime = () => {
    const now = new Date()
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
    return now.toISOString().slice(0, 16)
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="h-6 w-6 mr-2" />
            Create New Event
          </CardTitle>
          <CardDescription>
            Share your event with the AgentsValley community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Event Title */}
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Event Title *
              </label>
              <Input
                id="title"
                placeholder="Enter event title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
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
                placeholder="Describe your event, what attendees will learn, and why they should join..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                required
              />
            </div>

            {/* Event Type */}
            <div className="space-y-2">
              <label htmlFor="event_type" className="text-sm font-medium">
                Event Type *
              </label>
              <Select
                value={formData.event_type}
                onValueChange={(value) => handleInputChange('event_type', value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
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

            {/* Location (for in-person events) */}
            {formData.event_type === 'in-person' && (
              <div className="space-y-2">
                <label htmlFor="location" className="text-sm font-medium flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  Location *
                </label>
                <Input
                  id="location"
                  placeholder="Enter event location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  required
                />
              </div>
            )}

            {/* Event URL (for online events) */}
            {formData.event_type === 'online' && (
              <div className="space-y-2">
                <label htmlFor="event_url" className="text-sm font-medium">
                  Event URL *
                </label>
                <Input
                  id="event_url"
                  placeholder="https://zoom.us/j/123456789 or https://meet.google.com/abc-defg-hij"
                  value={formData.event_url}
                  onChange={(e) => handleInputChange('event_url', e.target.value)}
                  required
                />
              </div>
            )}

            {/* Hybrid events need both */}
            {formData.event_type === 'hybrid' && (
              <>
                <div className="space-y-2">
                  <label htmlFor="location" className="text-sm font-medium flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    Physical Location
                  </label>
                  <Input
                    id="location"
                    placeholder="Enter physical event location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="event_url" className="text-sm font-medium">
                    Online Event URL
                  </label>
                  <Input
                    id="event_url"
                    placeholder="https://zoom.us/j/123456789"
                    value={formData.event_url}
                    onChange={(e) => handleInputChange('event_url', e.target.value)}
                  />
                </div>
              </>
            )}

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="start_date" className="text-sm font-medium flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Start Date & Time *
                </label>
                <Input
                  id="start_date"
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={(e) => handleInputChange('start_date', e.target.value)}
                  min={getMinDateTime()}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="end_date" className="text-sm font-medium">
                  End Date & Time *
                </label>
                <Input
                  id="end_date"
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => handleInputChange('end_date', e.target.value)}
                  min={formData.start_date || getMinDateTime()}
                  required
                />
              </div>
            </div>

            {/* Registration Deadline */}
            <div className="space-y-2">
              <label htmlFor="registration_deadline" className="text-sm font-medium">
                Registration Deadline
              </label>
              <Input
                id="registration_deadline"
                type="datetime-local"
                value={formData.registration_deadline}
                onChange={(e) => handleInputChange('registration_deadline', e.target.value)}
                min={getMinDateTime()}
              />
              <p className="text-xs text-muted-foreground">
                Optional: Set a deadline for event registration
              </p>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">
                Category *
              </label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange('category', value)}
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
                placeholder="ai, workshop, networking, beginners (comma-separated)"
                value={formData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Separate tags with commas
              </p>
            </div>

            {/* Max Attendees */}
            <div className="space-y-2">
              <label htmlFor="max_attendees" className="text-sm font-medium flex items-center">
                <Users className="h-4 w-4 mr-1" />
                Maximum Attendees
              </label>
              <Input
                id="max_attendees"
                type="number"
                placeholder="Leave empty for unlimited"
                value={formData.max_attendees}
                onChange={(e) => handleInputChange('max_attendees', e.target.value)}
                min="1"
              />
              <p className="text-xs text-muted-foreground">
                Optional: Set a limit on the number of attendees
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
                placeholder="https://example.com/event-thumbnail.jpg"
                value={formData.thumbnail_url}
                onChange={(e) => handleInputChange('thumbnail_url', e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Optional: URL to an image representing your event
              </p>
            </div>

            {/* Requirements */}
            <div className="space-y-2">
              <label htmlFor="requirements" className="text-sm font-medium">
                Requirements
              </label>
              <Textarea
                id="requirements"
                placeholder="List any requirements for attendees (e.g., bring laptop, basic Python knowledge, etc.)"
                value={formData.requirements}
                onChange={(e) => handleInputChange('requirements', e.target.value)}
                rows={3}
              />
            </div>

            {/* Agenda */}
            <div className="space-y-2">
              <label htmlFor="agenda" className="text-sm font-medium">
                Agenda
              </label>
              <Textarea
                id="agenda"
                placeholder="Outline the event schedule and activities"
                value={formData.agenda}
                onChange={(e) => handleInputChange('agenda', e.target.value)}
                rows={4}
              />
            </div>

            {/* Submit Button */}
            <div className="flex space-x-4">
              <Button
                type="submit"
                disabled={loading || !formData.title || !formData.description || !formData.event_type || !formData.start_date || !formData.end_date || !formData.category}
                className="flex-1"
              >
                {loading ? 'Creating Event...' : 'Create Event'}
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
  )
}
