'use client'

import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { Event } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const locales = {
  'en-US': enUS,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

interface EventCalendarProps {
  events: Event[]
  className?: string
}

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource: Event
}

export function EventCalendar({ events, className = '' }: EventCalendarProps) {
  const router = useRouter()

  // Transform events for calendar
  const calendarEvents: CalendarEvent[] = events.map(event => ({
    id: event.id,
    title: event.title,
    start: new Date(event.start_date),
    end: new Date(event.end_date),
    resource: event,
  }))

  const handleSelectEvent = (event: CalendarEvent) => {
    router.push(`/events/${event.id}`)
  }

  const eventStyleGetter = (event: CalendarEvent) => {
    const { event_type } = event.resource
    
    let backgroundColor = '#3b82f6' // blue for default
    
    if (event_type === 'online') {
      backgroundColor = '#8b5cf6' // purple
    } else if (event_type === 'in-person') {
      backgroundColor = '#10b981' // green
    } else if (event_type === 'hybrid') {
      backgroundColor = '#f59e0b' // amber
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
        fontSize: '0.875rem',
      }
    }
  }

  return (
    <div className={`h-[700px] bg-card p-4 rounded-lg border ${className}`}>
      <style jsx global>{`
        .rbc-calendar {
          font-family: inherit;
        }
        .rbc-header {
          padding: 10px 3px;
          font-weight: 600;
          font-size: 0.875rem;
        }
        .rbc-today {
          background-color: oklch(var(--muted) / 0.3);
        }
        .rbc-event {
          padding: 2px 5px;
          cursor: pointer;
        }
        .rbc-event:hover {
          opacity: 0.8;
        }
        .rbc-toolbar button {
          color: oklch(var(--foreground));
          background: oklch(var(--background));
          border: 1px solid oklch(var(--border));
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          font-size: 0.875rem;
        }
        .rbc-toolbar button:hover {
          background: oklch(var(--muted));
        }
        .rbc-toolbar button.rbc-active {
          background: oklch(var(--primary));
          color: oklch(var(--primary-foreground));
        }
        .rbc-month-view {
          border-color: oklch(var(--border));
        }
        .rbc-day-bg {
          border-color: oklch(var(--border));
        }
        .rbc-header {
          border-color: oklch(var(--border));
        }
        .rbc-off-range-bg {
          background: oklch(var(--muted) / 0.1);
        }
      `}</style>
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        onSelectEvent={handleSelectEvent}
        eventPropGetter={eventStyleGetter}
        views={['month', 'week', 'day']}
        defaultView="month"
        popup
        tooltipAccessor={(event) => event.resource.description}
      />
    </div>
  )
}

