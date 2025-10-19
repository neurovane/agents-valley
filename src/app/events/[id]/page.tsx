'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useEvent, useEventAttendees, useEventRegistrationStatus, useRegisterEvent, useDeleteEvent } from '@/hooks/useEvents'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  ExternalLink, 
  CalendarDays, 
  UserPlus,
  UserMinus,
  AlertCircle,
  Globe,
  Building,
  Link as LinkIcon,
  Edit,
  Trash2,
  ArrowLeft
} from 'lucide-react'
import { toast } from 'sonner'
import { handleError } from '@/lib/error-handler'
import Link from 'next/link'
import Image from 'next/image'

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const eventId = Array.isArray(params.id) ? params.id[0] : (params.id as string)

  // Fetch event data
  const { data: event, isLoading: loading, error: eventError } = useEvent(eventId)
  
  // Fetch attendees
  const { data: attendees = [], isLoading: attendeesLoading, error: attendeesError } = useEventAttendees(eventId)
  
  // Check registration status
  const { data: isRegistered = false } = useEventRegistrationStatus(eventId)
  
  // Register mutation
  const registerMutation = useRegisterEvent()
  
  // Delete mutation
  const deleteMutation = useDeleteEvent()

  // Redirect if event not found
  useEffect(() => {
    if (eventError) {
      toast.error('Event not found')
      router.push('/events')
    }
  }, [eventError, router])


  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }    )
  }

  const handleDelete = async () => {
    if (!event || !user) return
    
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return
    }

    deleteMutation.mutate(event.id, {
      onSuccess: () => {
        toast.success('Event deleted successfully')
        router.push('/events')
      },
      onError: (error) => {
        const errorMessage = handleError(error, 'Error deleting event', 'Failed to delete event')
        toast.error(errorMessage)
      },
    })
  }

  const isOwner = user && event && event.organizer_id === user.id

  const isEventUpcoming = (startDate: string) => {
    return new Date(startDate) > new Date()
  }

  const isRegistrationOpen = (eventData: typeof event) => {
    if (!eventData || !isEventUpcoming(eventData.start_date)) return false
    if (eventData.registration_deadline) {
      return new Date(eventData.registration_deadline) > new Date()
    }
    return true
  }

  const isEventFull = (eventData: typeof event) => {
    if (!eventData) return false
    if (!eventData.max_attendees) return false
    return eventData.current_attendees >= eventData.max_attendees
  }

  const handleRegister = async () => {
    if (!user || !event) {
      if (!user) toast.error('Please sign in to register')
      return
    }

    registerMutation.mutate(
      { eventId: event.id, isRegistered },
      {
        onSuccess: () => {
          toast.success(isRegistered ? 'Successfully unregistered from event' : 'Successfully registered for event')
        },
        onError: (error) => {
          const errorMessage = handleError(error, 'Error updating registration', 'Failed to update registration')
          toast.error(errorMessage)
        },
      }
    )
  }

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case 'online':
        return <Globe className="h-4 w-4" />
      case 'in-person':
        return <Building className="h-4 w-4" />
      case 'hybrid':
        return <LinkIcon className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case 'online':
        return 'bg-blue-100 text-blue-800'
      case 'in-person':
        return 'bg-green-100 text-green-800'
      case 'hybrid':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (eventError || !event) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Event not found</h3>
              <p className="text-muted-foreground mb-6">
                {eventError?.message || 'The event you are looking for does not exist or has been removed.'}
              </p>
              <Button asChild variant="outline">
                <Link href="/events">Back to Events</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
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
                <Link href={`/events/${event.id}/edit`}>
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

        {/* Event Header */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start space-x-6">
              {/* Event Thumbnail */}
              <div className="flex-shrink-0">
                {event.thumbnail_url ? (
                  <Image
                    src={event.thumbnail_url}
                    alt={event.title}
                    width={120}
                    height={120}
                    className="w-30 h-30 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-30 h-30 rounded-lg bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
                    <CalendarDays className="w-16 h-16 text-white" />
                  </div>
                )}
              </div>

              {/* Event Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="secondary">{event.category}</Badge>
                      <Badge className={getEventTypeColor(event.event_type)}>
                        {getEventTypeIcon(event.event_type)}
                        <span className="ml-1 capitalize">{event.event_type}</span>
                      </Badge>
                      {event.is_featured && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          ⭐ Featured
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Event Details */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Calendar className="h-5 w-5" />
                    <span className="font-medium">Start:</span>
                    <span>{formatDate(event.start_date)}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Clock className="h-5 w-5" />
                    <span className="font-medium">End:</span>
                    <span>{formatDate(event.end_date)}</span>
                  </div>

                  {event.location && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <MapPin className="h-5 w-5" />
                      <span>{event.location}</span>
                    </div>
                  )}

                  {event.event_url && (
                    <div className="flex items-center space-x-2">
                      <ExternalLink className="h-5 w-5 text-blue-600" />
                      <a 
                        href={event.event_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Join Event
                      </a>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 text-gray-600">
                    <Users className="h-5 w-5" />
                    <span>
                      {event.current_attendees} attendees
                      {event.max_attendees && ` / ${event.max_attendees} max`}
                    </span>
                  </div>

                  {event.organizer && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <span className="font-medium">Organized by:</span>
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={event.organizer.avatar_url || ''} />
                          <AvatarFallback className="text-xs">
                            {event.organizer.username?.charAt(0).toUpperCase() || 'O'}
                          </AvatarFallback>
                        </Avatar>
                        <span>{event.organizer.username}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Registration Button */}
              <div className="flex-shrink-0">
                {!user ? (
                  <Button asChild>
                    <Link href="/auth">Sign in to Register</Link>
                  </Button>
                ) : !isEventUpcoming(event.start_date) ? (
                  <Button disabled variant="outline">
                    Event Ended
                  </Button>
                ) : isEventFull(event) ? (
                  <Button disabled variant="outline">
                    Event Full
                  </Button>
                ) : !isRegistrationOpen(event) ? (
                  <Button disabled variant="outline">
                    Registration Closed
                  </Button>
                ) : (
                  <Button
                    onClick={handleRegister}
                      disabled={registerMutation.isPending}
                    variant={isRegistered ? "outline" : "default"}
                    className="min-w-32"
                  >
                    {registerMutation.isPending ? (
                      'Loading...'
                    ) : isRegistered ? (
                      <>
                        <UserMinus className="h-4 w-4 mr-2" />
                        Unregister
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Register
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About This Event</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
              </CardContent>
            </Card>

            {/* Agenda */}
            {event.agenda && (
              <Card>
                <CardHeader>
                  <CardTitle>Agenda</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{event.agenda}</p>
                </CardContent>
              </Card>
            )}

            {/* Requirements */}
            {event.requirements && (
              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{event.requirements}</p>
                </CardContent>
              </Card>
            )}

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event Details */}
            <Card>
              <CardHeader>
                <CardTitle>Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">Start Time</div>
                  <div className="text-sm">{formatTime(event.start_date)}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">End Time</div>
                  <div className="text-sm">{formatTime(event.end_date)}</div>
                </div>
                {event.registration_deadline && (
                  <div>
                    <div className="text-sm font-medium text-gray-500">Registration Deadline</div>
                    <div className="text-sm">{formatDate(event.registration_deadline)}</div>
                  </div>
                )}
                <div>
                  <div className="text-sm font-medium text-gray-500">Event Type</div>
                  <div className="text-sm capitalize">{event.event_type}</div>
                </div>
              </CardContent>
            </Card>

            {/* Attendees */}
            <Card>
              <CardHeader>
                <CardTitle>Attendees ({event.current_attendees})</CardTitle>
              </CardHeader>
              <CardContent>
                {attendeesLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                ) : attendeesError ? (
                  <p className="text-sm text-gray-500">Failed to load attendees</p>
                ) : !attendees || attendees.length === 0 ? (
                  <p className="text-sm text-gray-500">No attendees yet</p>
                ) : (
                  <div className="space-y-3">
                    {attendees.slice(0, 10).map((attendee) => (
                      <div key={attendee.id} className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={attendee.user?.avatar_url || ''} />
                          <AvatarFallback className="text-xs">
                            {attendee.user?.username?.charAt(0).toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium">
                            {attendee.user?.username || 'Anonymous'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(attendee.registered_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                    {attendees.length > 10 && (
                      <p className="text-sm text-gray-500">
                        +{attendees.length - 10} more attendees
                      </p>
                    )}
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
