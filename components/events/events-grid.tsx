"use client"

import { EventCard } from "./event-card"
import type { TransformedEvent } from "@/app/api/events/route"

interface EventsGridProps {
  events: TransformedEvent[]
  secondaryFeatured: TransformedEvent[]
  onSelectEvent: (event: TransformedEvent) => void
}

export function EventsGrid({ events, secondaryFeatured, onSelectEvent }: EventsGridProps) {
  const filteredSecondary = secondaryFeatured.filter(e => events.some(fe => fe.id === e.id))
  const regularEvents = events.filter(e => !e.featured)

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4">
      {/* Secondary featured events first */}
      {filteredSecondary.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          variant="featured-secondary"
          onSelect={onSelectEvent}
        />
      ))}
      
      {/* Regular (non-featured) events */}
      {regularEvents.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          variant="default"
          onSelect={onSelectEvent}
        />
      ))}
    </div>
  )
}
