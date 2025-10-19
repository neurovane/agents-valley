'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Search, Calendar, MapPin, Users, Clock, Plus, CalendarDays, AlertCircle } from 'lucide-react'
import { useEvents } from '@/hooks/useEvents'
import Link from 'next/link'
import Image from 'next/image'

type SortOption = 'upcoming' | 'newest' | 'popular'

const CATEGORIES = [
  'All',
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
  'All',
  'Online',
  'In-Person',
  'Hybrid'
]

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedEventType, setSelectedEventType] = useState('All')
  const [sortBy, setSortBy] = useState<SortOption>('upcoming')

  const { data: eventsResponse, isLoading: loading, error } = useEvents({
    sortBy,
    eventType: selectedEventType === 'All' ? undefined : selectedEventType.toLowerCase(),
    category: selectedCategory,
  })
  
  const events = Array.isArray(eventsResponse) ? eventsResponse : (eventsResponse?.data || [])

  // Filter events client-side by search query
  const filteredEvents = events.filter(event => {
    if (!searchQuery) return true
    const search = searchQuery.toLowerCase()
    return (
      event.title.toLowerCase().includes(search) ||
      event.description.toLowerCase().includes(search)
    )
  })


  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }


  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case 'online':
        return '🌐'
      case 'in-person':
        return '📍'
      case 'hybrid':
        return '🔗'
      default:
        return '📅'
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <CalendarDays className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold">Events</h1>
              </div>
              <p className="text-gray-600">
                Discover and join amazing AI and tech events in your community.
              </p>
            </div>
            <Button asChild size="lg">
              <Link href="/events/create" className="flex items-center">
                <Plus className="h-5 w-5 mr-2" />
                Create Event
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Discover Events</CardTitle>
            <CardDescription>
              Find events that match your interests and schedule
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Event Type Filter */}
              <Select value={selectedEventType} onValueChange={setSelectedEventType}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Event Type" />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      Upcoming
                    </div>
                  </SelectItem>
                  <SelectItem value="newest">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Newest
                    </div>
                  </SelectItem>
                  <SelectItem value="featured">
                    <div className="flex items-center">
                      <CalendarDays className="h-4 w-4 mr-2" />
                      Featured
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Events Grid */}
      <div className="container mx-auto px-4 pb-16">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-10 h-10 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Failed to load events</h3>
                <p className="text-muted-foreground mb-6">
                  {error.message || 'Something went wrong while loading events'}
                </p>
                <Button onClick={() => window.location.reload()} variant="outline">
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : !filteredEvents || filteredEvents.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CalendarDays className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No events found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery || selectedCategory !== 'All' || selectedEventType !== 'All'
                    ? 'Try adjusting your search or filters'
                    : 'Be the first to create an event!'}
                </p>
                <Button asChild>
                  <Link href="/events/create">Create First Event</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">
                {filteredEvents.length} Event{filteredEvents.length !== 1 ? 's' : ''} Found
              </h2>
            </div>
            
            <div className="grid gap-6">
              {filteredEvents.map((event) => (
                <Card key={event.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
                  <Link href={`/events/${event.id}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        {/* Event Thumbnail */}
                        <div className="flex-shrink-0">
                          {event.thumbnail_url ? (
                            <Image
                              src={event.thumbnail_url}
                              alt={event.title}
                              width={80}
                              height={80}
                              className="w-20 h-20 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
                              <CalendarDays className="w-10 h-10 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Event Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-lg group-hover:text-blue-600 transition-colors truncate">
                                {event.title}
                              </h3>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge variant="secondary" className="text-xs">
                                  {event.category}
                                </Badge>
                                <Badge className={`text-xs ${getEventTypeColor(event.event_type)}`}>
                                  {getEventTypeIcon(event.event_type)} {event.event_type}
                                </Badge>
                                {event.is_featured && (
                                  <Badge className="text-xs bg-yellow-100 text-yellow-800">
                                    ⭐ Featured
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {event.description}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(event.start_date)}</span>
                              </div>
                              
                              {event.location && (
                                <div className="flex items-center space-x-1">
                                  <MapPin className="h-4 w-4" />
                                  <span className="truncate max-w-32">{event.location}</span>
                                </div>
                              )}
                              
                              <div className="flex items-center space-x-1">
                                <Users className="h-4 w-4" />
                                <span>
                                  {event.current_attendees}
                                  {event.max_attendees && `/${event.max_attendees}`} attendees
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              {event.organizer && (
                                <div className="flex items-center space-x-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={event.organizer.avatar_url || ''} />
                                    <AvatarFallback className="text-xs">
                                      {event.organizer.username?.charAt(0).toUpperCase() || 'O'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-xs text-gray-600">
                                    {event.organizer.username}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
