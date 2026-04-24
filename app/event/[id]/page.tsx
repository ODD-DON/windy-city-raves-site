"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import Script from "next/script"
import { ArrowLeft, Calendar, Clock, MapPin, Ticket, ExternalLink, Share2, ChevronRight, Users, Music, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import type { TransformedEvent } from "@/app/api/events/route"

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string
  
  const [event, setEvent] = useState<TransformedEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase()
    setIsIOS(/iphone|ipad|ipod/.test(userAgent))
  }, [])

  useEffect(() => {
    async function fetchEvent() {
      try {
        const response = await fetch("/api/events")
        const data = await response.json()
        if (data.success) {
          const foundEvent = data.events.find((e: TransformedEvent) => e.id === parseInt(eventId))
          setEvent(foundEvent || null)
          
          // Update document title and meta tags dynamically
          if (foundEvent) {
            document.title = `${foundEvent.headliner} at ${foundEvent.venue.name} | Chicago EDM Events | Windy City Raves`
            
            // Update meta description
            const metaDesc = document.querySelector('meta[name="description"]')
            if (metaDesc) {
              metaDesc.setAttribute('content', `Get tickets for ${foundEvent.headliner} performing at ${foundEvent.venue.name} in Chicago on ${new Date(foundEvent.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}. ${foundEvent.artists.length > 1 ? `Featuring ${foundEvent.artists.slice(1, 4).map((a: { name: string }) => a.name).join(', ')}.` : ''}`)
            }
          }
        }
      } catch (error) {
        console.error("Error fetching event:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchEvent()
  }, [eventId])

  const handleShare = async () => {
    if (!event) return
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${event.headliner} at ${event.venue.name}`,
          text: `Check out ${event.headliner} at ${event.venue.name}!`,
          url: window.location.href,
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        alert("Link copied to clipboard!")
      }
    } catch (err) {
      console.error("Error sharing:", err)
    }
  }

  // Generate JSON-LD structured data for the event
  const generateJsonLd = () => {
    if (!event) return null
    
    const eventDate = new Date(event.date + "T00:00:00")
    const startDateTime = event.startTime 
      ? `${event.date}T${event.startTime}:00` 
      : `${event.date}T21:00:00`
    
    return {
      "@context": "https://schema.org",
      "@type": "MusicEvent",
      "name": event.headliner,
      "description": `${event.headliner} performing live at ${event.venue.name} in Chicago. ${event.artists.length > 1 ? `With support from ${event.artists.slice(1, 4).map(a => a.name).join(', ')}.` : ''}`,
      "startDate": startDateTime,
      "endDate": startDateTime.replace("T21:", "T02:").replace("T19:", "T00:").replace("T20:", "T01:"),
      "eventStatus": "https://schema.org/EventScheduled",
      "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
      "location": {
        "@type": "MusicVenue",
        "name": event.venue.name,
        "address": {
          "@type": "PostalAddress",
          "streetAddress": event.venue.address || "",
          "addressLocality": "Chicago",
          "addressRegion": "IL",
          "postalCode": "",
          "addressCountry": "US"
        }
      },
      "image": event.imageUrl,
      "performer": event.artists.map(artist => ({
        "@type": "MusicGroup",
        "name": artist.name
      })),
      "offers": {
        "@type": "Offer",
        "url": event.ticketUrl,
        "availability": "https://schema.org/InStock",
        "validFrom": new Date().toISOString()
      },
      "organizer": {
        "@type": "Organization",
        "name": "Windy City Raves",
        "url": "https://windycityraves.com"
      }
    }
  }

  if (loading) {
    return (
      <div className="bg-white pb-8">
        <div className="p-4">
          <Skeleton className="h-8 w-24 mb-4" />
        </div>
        <Skeleton className="w-full aspect-square sm:aspect-[16/9]" />
        <div className="p-4 max-w-4xl mx-auto">
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-6" />
          <Skeleton className="h-14 w-full" />
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="bg-white flex items-center justify-center p-4 py-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-gray-900">Event Not Found</h1>
          <p className="text-gray-600 mb-6">This event may have passed or been removed.</p>
          <Button onClick={() => router.push("/events")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>
        </div>
      </div>
    )
  }

  const eventDate = new Date(event.date + "T00:00:00")
  const formattedDate = eventDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })

  const formatTime = (time?: string) => {
    if (!time) return null
    const [hours, minutes] = time.split(":")
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  const isToday = new Date().toDateString() === eventDate.toDateString()
  const isTomorrow = new Date(Date.now() + 86400000).toDateString() === eventDate.toDateString()

  const venueSlug = encodeURIComponent(event.venue.name.toLowerCase().replace(/\s+/g, "-"))

  return (
    <>
      {/* JSON-LD Structured Data for SEO */}
      <Script
        id="event-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateJsonLd()) }}
      />
      
      <div className="bg-white pb-8">
        {/* Navigation */}
        <div className="sticky top-16 z-20 bg-white/90 backdrop-blur-md border-b border-gray-100">
          <div className="flex items-center justify-between px-4 py-3 max-w-6xl mx-auto">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push("/events")}
              className="gap-2 text-gray-700 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Events</span>
              <span className="sm:hidden">Back</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={handleShare} className="text-gray-700">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Full Width Flyer - Edge to edge */}
        <div className="relative w-full">
          <div className="relative w-full aspect-square sm:aspect-[16/9] lg:aspect-[21/9]">
            {!imageError ? (
              <Image 
                src={event.imageUrl} 
                alt={`${event.headliner} at ${event.venue.name} - Chicago EDM Event`}
                fill
                className="object-cover"
                onError={() => setImageError(true)}
                priority
                sizes="100vw"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-cyan-500 to-red-500 flex items-center justify-center">
                <span className="text-8xl font-black text-white/20">
                  {event.headliner.split(" ").map(w => w[0]).join("").slice(0, 3)}
                </span>
              </div>
            )}
            
            {/* Gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
            
            {/* Badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              {isToday && (
                <Badge className="bg-green-500 text-white font-bold shadow-lg text-sm px-3 py-1">Tonight</Badge>
              )}
              {isTomorrow && (
                <Badge className="bg-cyan-500 text-white font-bold shadow-lg text-sm px-3 py-1">Tomorrow</Badge>
              )}
              {event.isFestival && (
                <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold shadow-lg text-sm px-3 py-1">Festival</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Content - Centered with max width, wider on desktop */}
        <div className="px-4 sm:px-6 py-8 max-w-3xl lg:max-w-4xl mx-auto">
          <div className="space-y-8">
            
            {/* Main Content */}
            <div className="space-y-8">
              
              {/* Header Section */}
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-3 leading-tight">
                  {event.headliner}
                </h1>
                
                {event.artists.length > 1 && (
                  <p className="text-lg text-gray-600">
                    with {event.artists.slice(1, 4).map(a => a.name).join(", ")}
                    {event.artists.length > 4 && ` +${event.artists.length - 4} more`}
                  </p>
                )}
              </div>

              {/* Full Lineup Section */}
              {event.artists.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900">Full Lineup</h2>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        Headliner
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-500" />
                        Support
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {event.artists.map((artist, idx) => {
                      const isHeadliner = idx === 0
                      return (
                        <Badge 
                          key={artist.id || idx} 
                          className={isHeadliner 
                            ? "bg-red-500 hover:bg-red-600 text-white px-4 py-2 text-sm font-bold" 
                            : "bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 border border-cyan-500/20 px-4 py-2 text-sm font-medium"
                          }
                        >
                          {artist.name}
                          {artist.b2b && " (B2B)"}
                        </Badge>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Event Details Section */}
              <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 space-y-4">
                <h2 className="text-lg font-bold text-gray-900">Event Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-semibold text-gray-900">{formattedDate}</p>
                    </div>
                  </div>
                  {event.startTime && (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-5 h-5 text-cyan-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Doors Open</p>
                        <p className="font-semibold text-gray-900">{formatTime(event.startTime)}</p>
                      </div>
                    </div>
                  )}
                  {event.ages && (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Users className="w-5 h-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Age Requirement</p>
                        <p className="font-semibold text-gray-900">{event.ages}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Music className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Performing</p>
                      <p className="font-semibold text-gray-900">{event.artists.length} Artist{event.artists.length > 1 ? "s" : ""}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Cards */}
            <div className="space-y-4">
                
                {/* Get Tickets - Main CTA */}
                <a 
                  href={event.ticketUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 w-full py-4 px-6 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold text-lg transition-colors"
                >
                  <Ticket className="w-6 h-6" />
                  Get Tickets
                  <ExternalLink className="w-5 h-5" />
                </a>

                {/* Venue Card with Map */}
                <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden">
                  {/* Google Maps Embed */}
                  <div className="w-full h-48 bg-gray-100">
                    <iframe
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(event.venue.address ? `${event.venue.name}, ${event.venue.address}, Chicago, IL` : `${event.venue.name}, Chicago, IL`)}&zoom=15`}
                    />
                  </div>
                  
                  <div className="p-5 space-y-4">
                    <Link href={`/venue/${venueSlug}`} className="block group">
                      <h3 className="font-bold text-gray-900 group-hover:text-red-500 transition-colors text-lg">
                        {event.venue.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{event.venue.location}</p>
                      {event.venue.address && (
                        <p className="text-sm text-gray-500">{event.venue.address}</p>
                      )}
                    </Link>
                    
                    {/* Get Directions Button - Opens Apple Maps on iOS, Google Maps otherwise */}
                    <a 
                      href={isIOS 
                        ? `maps://maps.apple.com/?q=${encodeURIComponent(event.venue.address ? `${event.venue.name}, ${event.venue.address}, Chicago, IL` : `${event.venue.name}, Chicago, IL`)}`
                        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.venue.address ? `${event.venue.name}, ${event.venue.address}, Chicago, IL` : `${event.venue.name}, Chicago, IL`)}`
                      }
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                    >
                      <Navigation className="w-4 h-4" />
                      Get Directions
                    </a>
                  </div>
                </div>

                {/* Share Section */}
                <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Share Event</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={handleShare}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out ${event.headliner} at ${event.venue.name}!`)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center p-3 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 transition-colors text-gray-700"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                      </svg>
                    </a>
                  </div>
                </div>

                {/* View More at Venue */}
                <Link 
                  href={`/venue/${venueSlug}`}
                  className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-red-200 hover:bg-red-50/50 transition-all group"
                >
                  <span className="text-sm font-medium text-gray-700">More events at {event.venue.name}</span>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
