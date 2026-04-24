"use client"

import { useState } from "react"
import Image from "next/image"
import { Clock, MapPin, Ticket, ExternalLink, Star, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { TransformedEvent } from "@/app/api/events/route"

interface EventCardProps {
  event: TransformedEvent
  variant?: "default" | "compact" | "list" | "featured" | "featured-secondary"
  onSelect?: (event: TransformedEvent) => void
}

// Generate a consistent gradient based on venue name
function getVenueGradient(venueName: string): string {
  const gradients = [
    "from-rose-500/90 via-red-600/80 to-orange-500/90",
    "from-cyan-500/90 via-blue-600/80 to-indigo-500/90",
    "from-violet-500/90 via-purple-600/80 to-fuchsia-500/90",
    "from-emerald-500/90 via-teal-600/80 to-cyan-500/90",
    "from-amber-500/90 via-orange-600/80 to-red-500/90",
    "from-pink-500/90 via-rose-600/80 to-red-500/90",
    "from-indigo-500/90 via-blue-600/80 to-cyan-500/90",
    "from-fuchsia-500/90 via-purple-600/80 to-violet-500/90",
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

export function EventCard({ event, variant = "default", onSelect }: EventCardProps) {
  const eventDate = new Date(event.date + "T00:00:00")
  const dayName = eventDate.toLocaleDateString("en-US", { weekday: "short" })
  const monthName = eventDate.toLocaleDateString("en-US", { month: "short" })
  const dayNumber = eventDate.getDate()
  
  const isToday = new Date().toDateString() === eventDate.toDateString()
  const isTomorrow = new Date(Date.now() + 86400000).toDateString() === eventDate.toDateString()
  const isThisWeekend = (() => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const friday = new Date(today)
    friday.setDate(today.getDate() + (5 - dayOfWeek))
    const sunday = new Date(friday)
    sunday.setDate(friday.getDate() + 2)
    return eventDate >= friday && eventDate <= sunday
  })()

  const formatTime = (time?: string) => {
    if (!time) return null
    const [hours, minutes] = time.split(":")
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12}:${minutes} ${ampm}`
  }

  const gradient = getVenueGradient(event.venue.name)
  const initials = getInitials(event.headliner)
  const [imageError, setImageError] = useState(false)

  if (variant === "compact") {
    return (
      <button
        onClick={() => onSelect?.(event)}
        className="w-full text-left p-2 rounded-lg hover:bg-muted/50 transition-colors group"
      >
        <div className="flex items-start gap-2">
          <div className={`relative flex-shrink-0 w-10 h-10 rounded-md overflow-hidden bg-gradient-to-br ${gradient}`}>
            {!imageError ? (
              <Image 
                src={event.imageUrl} 
                alt={event.headliner}
                fill
                className="object-cover"
                onError={() => setImageError(true)}
                sizes="40px"
                loading="eager"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-white">{initials}</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
              {event.headliner}
            </p>
            <p className="text-xs text-muted-foreground truncate">{event.venue.name}</p>
          </div>
        </div>
      </button>
    )
  }

  if (variant === "list") {
    return (
      <div 
        className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer group"
        onClick={() => onSelect?.(event)}
      >
        {/* Event image */}
        <div className={`relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br ${gradient} shadow-lg`}>
          {!imageError ? (
            <Image 
              src={event.imageUrl} 
              alt={event.headliner}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
              sizes="64px"
              loading="eager"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-black text-white leading-none">{initials}</span>
            </div>
          )}
        </div>
        
        {/* Date */}
        <div className="flex-shrink-0 w-14 text-center">
          <span className="block text-xs font-medium text-primary uppercase">{dayName}</span>
          <span className="block text-2xl font-bold text-foreground leading-none">{dayNumber}</span>
          <span className="block text-xs text-muted-foreground uppercase">{monthName}</span>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-bold text-lg text-foreground truncate group-hover:text-primary transition-colors">
              {event.headliner}
            </h3>
            {event.isFestival && (
              <Badge className="bg-gradient-to-r from-primary to-secondary text-white text-[10px] px-2 py-0.5 font-semibold">Festival</Badge>
            )}
            {isToday && (
              <Badge className="bg-green-500 text-white text-[10px] px-2 py-0.5 font-semibold animate-pulse">Tonight</Badge>
            )}
            {isTomorrow && (
              <Badge className="bg-secondary text-white text-[10px] px-2 py-0.5 font-semibold">Tomorrow</Badge>
            )}
          </div>
          {event.artists.length > 1 && (
            <p className="text-sm text-muted-foreground mb-1.5 truncate">
              w/ {event.artists.slice(1, 4).map(a => a.name).join(", ")}
              {event.artists.length > 4 && ` +${event.artists.length - 4}`}
            </p>
          )}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              {event.venue.name}
            </span>
            {event.startTime && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-secondary" />
                {formatTime(event.startTime)}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {event.ages && (
            <Badge variant="outline" className="text-xs hidden sm:flex font-medium">{event.ages}</Badge>
          )}
          {event.ticketUrl && (
            <Button size="sm" className="gap-1.5 shadow-md" asChild onClick={(e) => e.stopPropagation()}>
              <a href={event.ticketUrl} target="_blank" rel="noopener noreferrer">
                <Ticket className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tickets</span>
              </a>
            </Button>
          )}
        </div>
      </div>
    )
  }

  // Primary Featured card - FULL WIDTH banner
  if (variant === "featured") {
    return (
      <div 
        className="group relative rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer aspect-[16/9] sm:aspect-[21/9] ring-2 ring-amber-400 ring-offset-2 ring-offset-background shadow-[0_0_40px_rgba(251,191,36,0.3)]"
        onClick={() => onSelect?.(event)}
      >
        {!imageError ? (
          <Image 
            src={event.imageUrl} 
            alt={event.headliner}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImageError(true)}
            sizes="100vw"
            priority={true}
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
        )}
        
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />

        <div className="relative h-full flex items-center p-4 sm:p-6 lg:p-8">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-2 sm:mb-3 flex-wrap">
              <Badge className="bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-xs sm:text-sm px-3 py-1 font-bold shadow-lg gap-1.5">
                <Star className="w-3.5 h-3.5 fill-current" />
                Featured Event
              </Badge>
              {isToday && (
                <Badge className="bg-green-500 text-white text-xs px-2.5 py-1 font-bold animate-pulse shadow-lg">
                  Tonight
                </Badge>
              )}
              {isTomorrow && (
                <Badge className="bg-secondary text-white text-xs px-2.5 py-1 font-semibold shadow-lg">
                  Tomorrow
                </Badge>
              )}
              {event.isFestival && (
                <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-black text-xs px-2.5 py-1 font-bold shadow-lg">
                  Festival
                </Badge>
              )}
            </div>

            <h3 className="font-black text-xl sm:text-2xl lg:text-4xl text-white mb-1 sm:mb-2 line-clamp-2 leading-tight">
              {event.headliner}
            </h3>
            
            {event.artists.length > 1 && (
              <p className="text-sm sm:text-base lg:text-lg text-white/80 mb-2 sm:mb-3 line-clamp-1">
                w/ {event.artists.slice(1, 4).map(a => a.name).join(", ")}
                {event.artists.length > 4 && ` +${event.artists.length - 4} more`}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-white/90 text-sm sm:text-base mb-3 sm:mb-4">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-primary" />
                {event.venue.name}
              </span>
              {event.startTime && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-secondary" />
                  {formatTime(event.startTime)}
                </span>
              )}
              {event.ages && (
                <Badge variant="outline" className="text-white border-white/30 text-xs sm:text-sm">
                  {event.ages}
                </Badge>
              )}
            </div>

            <Button 
              className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-black font-bold shadow-lg h-10 sm:h-12 px-6 sm:px-8 text-sm sm:text-base" 
              asChild 
              onClick={(e) => e.stopPropagation()}
            >
              <a href={event.ticketUrl} target="_blank" rel="noopener noreferrer">
                <Sparkles className="w-4 h-4 mr-2" />
                Get Tickets
                <ExternalLink className="w-3.5 h-3.5 ml-2" />
              </a>
            </Button>
          </div>

          <div className="hidden sm:flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-xl px-4 py-3 lg:px-6 lg:py-4">
            <span className="text-xs lg:text-sm font-bold text-amber-400 uppercase tracking-wider">{dayName}</span>
            <span className="text-4xl lg:text-5xl font-black text-white leading-none">{dayNumber}</span>
            <span className="text-xs lg:text-sm font-medium text-white/70 uppercase">{monthName}</span>
          </div>
        </div>
      </div>
    )
  }

  // Secondary Featured card - normal size with gold glow
  if (variant === "featured-secondary") {
    return (
      <div 
        className="group relative rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer card-hover aspect-[4/5] sm:aspect-[3/4] ring-2 ring-amber-400/50 shadow-[0_0_20px_rgba(251,191,36,0.2)]"
        onClick={() => onSelect?.(event)}
      >
        {!imageError ? (
          <Image 
            src={event.imageUrl} 
            alt={event.headliner}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => setImageError(true)}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            loading="eager"
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10" />

        <div className="relative h-full flex flex-col p-3 sm:p-4 justify-between">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1">
              <Badge className="bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 font-bold shadow-lg gap-1">
                <Star className="w-3 h-3 fill-current" />
                Featured
              </Badge>
              {isToday && (
                <Badge className="bg-green-500 text-white text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 font-bold animate-pulse shadow-lg">
                  Tonight
                </Badge>
              )}
              {isTomorrow && (
                <Badge className="bg-secondary text-white text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 font-semibold shadow-lg">
                  Tomorrow
                </Badge>
              )}
            </div>
            
            <div className="bg-black/60 backdrop-blur-sm rounded-md sm:rounded-lg px-2 py-1 sm:px-2.5 sm:py-1.5 text-center">
              <span className="block text-[8px] sm:text-[10px] font-bold text-amber-400 uppercase tracking-wider">{dayName}</span>
              <span className="block text-lg sm:text-xl font-black text-white leading-none">{dayNumber}</span>
              <span className="block text-[8px] sm:text-[10px] font-medium text-white/70 uppercase">{monthName}</span>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-base sm:text-xl text-white mb-0.5 sm:mb-1 line-clamp-2 leading-tight">
              {event.headliner}
            </h3>
            
            {event.artists.length > 1 && (
              <p className="text-xs sm:text-sm text-white/70 mb-1.5 sm:mb-2 line-clamp-1">
                w/ {event.artists.slice(1, 2).map(a => a.name).join(", ")}
                {event.artists.length > 2 && ` +${event.artists.length - 2}`}
              </p>
            )}

            <div className="flex items-center gap-2 sm:gap-3 text-white/80 text-xs sm:text-sm mb-2 sm:mb-3">
              <span className="flex items-center gap-1 min-w-0">
                <MapPin className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-primary flex-shrink-0" />
                <span className="truncate">{event.venue.name}</span>
              </span>
              {event.startTime && (
                <span className="flex items-center gap-1 flex-shrink-0">
                  <Clock className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-secondary" />
                  {formatTime(event.startTime)}
                </span>
              )}
            </div>

            <Button 
              className="w-full bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-black font-bold shadow-lg h-8 sm:h-9 text-xs sm:text-sm" 
              size="sm" 
              asChild 
              onClick={(e) => e.stopPropagation()}
            >
              <a href={event.ticketUrl} target="_blank" rel="noopener noreferrer">
                <Ticket className="w-3.5 sm:w-4 h-3.5 sm:h-4 mr-1 sm:mr-1.5" />
                Get Tickets
                <ExternalLink className="w-2.5 sm:w-3 h-2.5 sm:h-3 ml-1 sm:ml-1.5" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Default card view with real event images
  return (
    <div 
      className="group relative rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer card-hover aspect-[4/5] sm:aspect-[3/4]"
      onClick={() => onSelect?.(event)}
    >
      {/* Background - real image or gradient fallback */}
      {!imageError ? (
        <Image 
          src={event.imageUrl} 
          alt={event.headliner}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          onError={() => setImageError(true)}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          loading="eager"
        />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
      )}
      
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/10" />

      {/* Content */}
      <div className="relative h-full flex flex-col p-3 sm:p-4 justify-between">
        {/* Top row - badges and date */}
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            {isToday && (
              <Badge className="bg-green-500 text-white text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 font-bold animate-pulse shadow-lg">
                Tonight
              </Badge>
            )}
            {isTomorrow && (
              <Badge className="bg-secondary text-white text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 font-semibold shadow-lg">
                Tomorrow
              </Badge>
            )}
            {isThisWeekend && !isToday && !isTomorrow && (
              <Badge className="bg-white/20 backdrop-blur-sm text-white text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 font-semibold border border-white/30">
                Weekend
              </Badge>
            )}
            {event.isFestival && (
              <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-black text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 font-bold shadow-lg">
                Festival
              </Badge>
            )}
          </div>
          
          {/* Date badge */}
          <div className="bg-black/60 backdrop-blur-sm rounded-md sm:rounded-lg px-2 py-1 sm:px-2.5 sm:py-1.5 text-center">
            <span className="block text-[8px] sm:text-[10px] font-bold text-primary uppercase tracking-wider">{dayName}</span>
            <span className="block text-lg sm:text-xl font-black text-white leading-none">{dayNumber}</span>
            <span className="block text-[8px] sm:text-[10px] font-medium text-white/70 uppercase">{monthName}</span>
          </div>
        </div>

        {/* Bottom content */}
        <div>
          <h3 className="font-bold text-base sm:text-xl text-white mb-0.5 sm:mb-1 line-clamp-2 leading-tight">
            {event.headliner}
          </h3>
          
          {event.artists.length > 1 && (
            <p className="text-xs sm:text-sm text-white/70 mb-1.5 sm:mb-2 line-clamp-1">
              w/ {event.artists.slice(1, 2).map(a => a.name).join(", ")}
              {event.artists.length > 2 && ` +${event.artists.length - 2}`}
            </p>
          )}

          <div className="flex items-center gap-2 sm:gap-3 text-white/80 text-xs sm:text-sm mb-2 sm:mb-3">
            <span className="flex items-center gap-1 min-w-0">
              <MapPin className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-primary flex-shrink-0" />
              <span className="truncate">{event.venue.name}</span>
            </span>
            {event.startTime && (
              <span className="flex items-center gap-1 flex-shrink-0">
                <Clock className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-secondary" />
                {formatTime(event.startTime)}
              </span>
            )}
          </div>

          {/* Action button - always links to venue or Google search */}
          <Button 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg h-8 sm:h-9 text-xs sm:text-sm" 
            size="sm" 
            asChild 
            onClick={(e) => e.stopPropagation()}
          >
            <a href={event.ticketUrl} target="_blank" rel="noopener noreferrer">
              <Ticket className="w-3.5 sm:w-4 h-3.5 sm:h-4 mr-1 sm:mr-1.5" />
              Get Tickets
              <ExternalLink className="w-2.5 sm:w-3 h-2.5 sm:h-3 ml-1 sm:ml-1.5" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}
