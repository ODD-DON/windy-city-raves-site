"use client"

import { useState } from "react"
import Image from "next/image"
import { Calendar, Clock, MapPin, Users, Ticket, ExternalLink, Share2, Navigation, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import type { TransformedEvent } from "@/app/api/events/route"

interface EventModalProps {
  event: TransformedEvent | null
  open: boolean
  onClose: () => void
}

// Generate a consistent gradient based on venue name
function getVenueGradient(venueName: string): string {
  const gradients = [
    "from-rose-500 via-red-600 to-orange-500",
    "from-cyan-500 via-blue-600 to-indigo-500",
    "from-violet-500 via-purple-600 to-fuchsia-500",
    "from-emerald-500 via-teal-600 to-cyan-500",
    "from-amber-500 via-orange-600 to-red-500",
    "from-pink-500 via-rose-600 to-red-500",
    "from-indigo-500 via-blue-600 to-cyan-500",
    "from-fuchsia-500 via-purple-600 to-violet-500",
  ]
  
  let hash = 0
  for (let i = 0; i < venueName.length; i++) {
    hash = venueName.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  return gradients[Math.abs(hash) % gradients.length]
}

// Get initials for visual placeholder
function getInitials(name: string): string {
  const words = name.split(" ").filter(w => w.length > 0)
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

export function EventModal({ event, open, onClose }: EventModalProps) {
  const [imageError, setImageError] = useState(false)
  
  if (!event) return null

  const eventDate = new Date(event.date + "T00:00:00")
  const formattedDate = eventDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
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
  
  const gradient = getVenueGradient(event.venue.name)
  const initials = getInitials(event.headliner)

  const handleShare = async () => {
    const shareData = {
      title: event.headliner,
      text: `Check out ${event.headliner} at ${event.venue.name} on ${formattedDate}!`,
      url: window.location.href,
    }
    
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch {
        // User cancelled share
      }
    } else {
      navigator.clipboard.writeText(`${shareData.title} - ${shareData.text}`)
    }
  }

  const getMapsUrl = () => {
    const address = event.venue.address 
      ? `${event.venue.address}, ${event.venue.location}`
      : `${event.venue.name}, ${event.venue.location}`
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0 overflow-hidden border-0 max-h-[100vh] sm:max-h-[90vh] h-[100vh] sm:h-auto w-full sm:w-[95vw] sm:rounded-lg rounded-none" showCloseButton={false}>
        {/* Header with event image or gradient fallback */}
        <div className={`relative h-44 sm:h-56 bg-gradient-to-br ${gradient}`}>
          {/* Event image */}
          {!imageError && (
            <Image 
              src={event.imageUrl} 
              alt={event.headliner}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
              sizes="(max-width: 512px) 100vw, 512px"
              priority
            />
          )}
          
          {/* Dark gradient for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors z-10"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Badges */}
          <div className="absolute top-3 sm:top-4 left-3 sm:left-4 flex gap-1.5 sm:gap-2">
            {isToday && (
              <Badge className="bg-green-500 text-white font-bold animate-pulse shadow-lg text-xs">Tonight</Badge>
            )}
            {isTomorrow && (
              <Badge className="bg-white/20 backdrop-blur-sm text-white border border-white/30 font-semibold text-xs">Tomorrow</Badge>
            )}
            {event.isFestival && (
              <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold shadow-lg text-xs">Festival</Badge>
            )}
          </div>

          {/* Artist initials badge */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white shadow-xl flex items-center justify-center border-4 border-background">
              <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                <span className="text-2xl sm:text-3xl font-black text-white">{initials}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 pt-12 sm:pt-16 relative">
          <DialogHeader className="text-center mb-6">
            <DialogTitle className="text-2xl font-bold">{event.headliner}</DialogTitle>
            <DialogDescription className="text-muted-foreground mt-1">
              {event.artists.length > 1 
                ? `with ${event.artists.slice(1).map(a => a.name).join(", ")}`
                : `${formattedDate} at ${event.venue.name}`
              }
            </DialogDescription>
          </DialogHeader>

          {/* Event details */}
          <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
            <div className="flex items-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-muted/50">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm sm:text-base">{formattedDate}</p>
                {event.startTime && (
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Doors: {formatTime(event.startTime)}
                    {event.endTime && ` - ${formatTime(event.endTime)}`}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-muted/50">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm sm:text-base">{event.venue.name}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">{event.venue.location}</p>
              </div>
              <Button variant="secondary" size="sm" className="flex-shrink-0 gap-1 sm:gap-1.5 h-7 sm:h-8 text-xs" asChild>
                <a href={getMapsUrl()} target="_blank" rel="noopener noreferrer">
                  <Navigation className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span className="hidden sm:inline">Directions</span>
                  <span className="sm:hidden">Map</span>
                </a>
              </Button>
            </div>

            {event.ages && (
              <div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-muted/50">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm sm:text-base">{event.ages}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Age restriction</p>
                </div>
              </div>
            )}
          </div>

          {/* Artists lineup */}
          {event.artists.length > 0 && (
            <div className="mb-4 sm:mb-6">
              <h4 className="text-xs font-bold text-muted-foreground mb-2 sm:mb-3 uppercase tracking-wider">Full Lineup</h4>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {event.artists.map((artist, idx) => (
                  <Badge 
                    key={artist.id || idx} 
                    className={idx === 0 
                      ? "bg-red-500 hover:bg-red-600 text-white px-2 sm:px-3 py-0.5 sm:py-1 text-xs" 
                      : "bg-blue-500 hover:bg-blue-600 text-white px-2 sm:px-3 py-0.5 sm:py-1 text-xs"
                    }
                  >
                    {artist.name}
                    {artist.b2b && " (B2B)"}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button className="flex-1 gap-1.5 sm:gap-2 h-10 sm:h-12 text-sm sm:text-base font-bold shadow-lg" asChild>
              <a href={event.ticketUrl} target="_blank" rel="noopener noreferrer">
                <Ticket className="w-4 h-4 sm:w-5 sm:h-5" />
                Get Tickets
                <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
              </a>
            </Button>
            <Button variant="outline" size="icon" className="h-10 w-10 sm:h-12 sm:w-12" onClick={handleShare}>
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
