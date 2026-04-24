"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, MapPin, ExternalLink, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { EventCard } from "@/components/events/event-card"
import type { TransformedEvent } from "@/app/api/events/route"

// Venue info database
const VENUE_INFO: Record<string, { website: string; description: string; capacity?: string }> = {
  "radius-chicago": {
    website: "https://radiuschicago.com",
    description: "Chicago's premier electronic music venue featuring world-class DJs in an immersive industrial setting.",
    capacity: "3,500"
  },
  "concord-music-hall": {
    website: "https://concordmusichall.com",
    description: "A historic Chicago music venue known for its intimate atmosphere and excellent sound.",
    capacity: "1,800"
  },
  "the-salt-shed": {
    website: "https://saltshedchicago.com",
    description: "A unique indoor/outdoor venue on the Chicago River, perfect for concerts and festivals.",
    capacity: "3,500+"
  },
  "aragon-ballroom": {
    website: "https://aragonballroom.com",
    description: "An iconic Chicago entertainment venue since 1926 with stunning Moorish Revival architecture.",
    capacity: "5,000"
  },
  "metro-chicago": {
    website: "https://metrochicago.com",
    description: "A legendary Chicago music venue hosting breakthrough performances since 1982.",
    capacity: "1,100"
  },
  "prysm-nightclub": {
    website: "https://prysmchicago.com",
    description: "Chicago's premier nightclub featuring top DJs, immersive visuals, and state-of-the-art sound.",
    capacity: "1,200"
  },
  "smart-bar": {
    website: "https://smartbarchicago.com",
    description: "Chicago's longest-running dance club, a cornerstone of the city's house music scene since 1982.",
    capacity: "350"
  },
  "house-of-blues-chicago": {
    website: "https://houseofblues.com/chicago",
    description: "A world-famous music venue in the heart of downtown Chicago.",
    capacity: "1,500"
  },
  "thalia-hall": {
    website: "https://thaliahallchicago.com",
    description: "A beautifully restored 1892 venue in Pilsen featuring intimate concerts.",
    capacity: "900"
  },
}

export default function VenuePage() {
  const params = useParams()
  const router = useRouter()
  const venueSlug = params.name as string
  
  const [events, setEvents] = useState<TransformedEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [venueName, setVenueName] = useState("")
  const [isIOS, setIsIOS] = useState(false)

  // Detect iOS for Apple Maps vs Google Maps
  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase()
    setIsIOS(/iphone|ipad|ipod/.test(userAgent))
  }, [])

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch("/api/events")
        const data = await response.json()
        if (data.success) {
          const venueEvents = data.events.filter((e: TransformedEvent) => {
            const eventVenueSlug = e.venue.name.toLowerCase().replace(/\s+/g, "-")
            return eventVenueSlug === venueSlug || e.venue.name.toLowerCase().replace(/\s+/g, "-").includes(venueSlug)
          })
          setEvents(venueEvents)
          if (venueEvents.length > 0) {
            setVenueName(venueEvents[0].venue.name)
          } else {
            setVenueName(venueSlug.split("-").map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(" "))
          }
        }
      } catch (error) {
        console.error("Error fetching events:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [venueSlug])

  const venueInfo = VENUE_INFO[venueSlug]
  const firstEvent = events[0]
  const venueLocation = firstEvent?.venue.location || "Chicago, IL"

  // Smart Maps URL - Apple Maps for iOS, Google Maps for others
  const getMapsUrl = () => {
    const query = `${venueName}, Chicago, IL`
    if (isIOS) {
      return `maps://maps.apple.com/?q=${encodeURIComponent(query)}`
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
  }

  if (loading) {
    return (
      <div className="bg-background p-4 pb-8">
        <Skeleton className="h-8 w-24 mb-6" />
        <Skeleton className="h-10 w-3/4 mb-2" />
        <Skeleton className="h-5 w-1/2 mb-6" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="aspect-[3/4]" />
          <Skeleton className="aspect-[3/4]" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-background pb-8">
      {/* Top Navigation */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center px-4 py-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push("/")}
            className="gap-2 -ml-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>
      </div>

      {/* Venue Header */}
      <div className="px-4 sm:px-6 py-4 sm:py-6 max-w-6xl mx-auto">
        <div className="flex items-start gap-2 mb-1">
          <Badge variant="secondary" className="gap-1 text-xs">
            <MapPin className="w-3 h-3" />
            Venue
          </Badge>
          {events.length > 0 && (
            <Badge className="bg-primary/10 text-primary border-0 text-xs">
              {events.length} event{events.length !== 1 ? "s" : ""}
            </Badge>
          )}
        </div>
        
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground mb-1">
          {venueName}
        </h1>
        
        <p className="text-muted-foreground text-sm sm:text-base mb-4">{venueLocation}</p>

        {venueInfo?.description && (
          <p className="text-sm text-muted-foreground mb-4 max-w-2xl">
            {venueInfo.description}
            {venueInfo.capacity && <span className="font-medium"> Capacity: {venueInfo.capacity}</span>}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button variant="outline" size="sm" className="gap-1.5" asChild>
            <a href={getMapsUrl()} target="_blank" rel="noopener noreferrer">
              <MapPin className="w-4 h-4" />
              Directions
            </a>
          </Button>
          {venueInfo?.website && (
            <Button size="sm" className="gap-1.5" asChild>
              <a href={venueInfo.website} target="_blank" rel="noopener noreferrer">
                Website
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </Button>
          )}
        </div>

        {/* Events Grid */}
        {events.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-bold text-foreground mb-2">No upcoming events</h2>
            <p className="text-muted-foreground text-sm mb-6">
              No scheduled events at {venueName} right now.
            </p>
            <Button onClick={() => router.push("/")}>
              Browse All Events
            </Button>
          </div>
        ) : (
          <>
            <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4">
              Upcoming Events
            </h2>
            
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {events.map((event, index) => (
                <EventCard
                  key={event.id}
                  event={event}
                  variant="default"
                  priority={index < 4}
                  onSelect={() => router.push(`/event/${event.id}`)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
