"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { EventsFilters, type ViewMode, type TimeFilter } from "@/components/events/events-filters"
import { EventCard } from "@/components/events/event-card"
import { EventsGrid } from "@/components/events/events-grid"
import { CalendarView } from "@/components/events/calendar-view"
import { LocationSelector } from "@/components/location-selector"
import { Footer } from "@/components/footer"
import type { Location } from "@/app/api/locations/route"
import { Spinner } from "@/components/ui/spinner"
import { Empty } from "@/components/ui/empty"
import { Badge } from "@/components/ui/badge"
import { Calendar, Music, MapPin, Sparkles, AlertCircle } from "lucide-react"
import type { TransformedEvent } from "@/app/api/events/route"
import { format, isToday, isTomorrow, isThisWeek, isThisMonth, startOfDay, endOfDay } from "date-fns"

export default function Home() {
  const router = useRouter()
  const [events, setEvents] = useState<TransformedEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>("")

  // City flag colors for gradient animation (no white - uses main flag colors only)
  const cityFlagColors: Record<string, string[]> = {
    "Chicago": ["#B3DDF2", "#CF142B", "#B3DDF2", "#CF142B", "#B3DDF2"], // Light blue & red
    "Los Angeles": ["#00A651", "#FFD700", "#004990", "#FFD700", "#00A651"], // Green, gold, blue
    "New York": ["#FF6319", "#002868", "#FF6319", "#002868", "#FF6319"], // Orange & blue
    "Miami": ["#FF6B35", "#00CED1", "#FF1493", "#00CED1", "#FF6B35"], // Tropical vibes
    "Las Vegas": ["#FFD700", "#C41E3A", "#FFD700", "#C41E3A", "#FFD700"], // Gold & red
    "Denver": ["#002868", "#FFD700", "#002868", "#FFD700", "#002868"], // Blue & gold
    "Atlanta": ["#CE1126", "#002868", "#CE1126", "#002868", "#CE1126"], // Red & blue
    "San Francisco": ["#FFD700", "#AA0000", "#FFD700", "#AA0000", "#FFD700"], // Gold & red
    "Seattle": ["#00539B", "#046A38", "#00539B", "#046A38", "#00539B"], // Blue & green
    "Austin": ["#003366", "#FF6600", "#003366", "#FF6600", "#003366"], // Blue & orange
    "Detroit": ["#003DA5", "#CE1126", "#003DA5", "#CE1126", "#003DA5"], // Blue & red
    "Phoenix": ["#800020", "#FFD700", "#003366", "#FFD700", "#800020"], // Burgundy, gold, blue
    "Minneapolis": ["#003DA5", "#00843D", "#003DA5", "#00843D", "#003DA5"], // Blue & green
    "Portland": ["#003B5C", "#6CC24A", "#003B5C", "#6CC24A", "#003B5C"], // Blue & green
    "Boston": ["#003DA5", "#FFD700", "#003DA5", "#FFD700", "#003DA5"], // Blue & gold
  }

  // Get CSS gradient for current city
  const getCityGradient = (city: string): string => {
    const colors = cityFlagColors[city] || ["#ef4444", "#f97316", "#60a5fa", "#06b6d4", "#ef4444"]
    return `linear-gradient(90deg, ${colors.join(", ")})`
  }

  // Default to Chicago
  const [currentLocation, setCurrentLocation] = useState<Location>({
    id: 71,
    city: "Chicago",
    state: "Illinois",
    stateCode: "IL",
    country: "United States",
    countryCode: "US",
    latitude: 41.878,
    longitude: -87.63,
    link: "https://edmtrain.com/chicago-il"
  })
  const [locationLoaded, setLocationLoaded] = useState(false)
  
  // Filters state
  const [search, setSearch] = useState("")
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all")
  const [venueFilter, setVenueFilter] = useState("all")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({})
  
  // Load location from localStorage FIRST before anything else
  useEffect(() => {
    const stored = localStorage.getItem("selectedLocation")
    if (stored) {
      try {
        const location = JSON.parse(stored)
        if (location.id && location.city) {
          setCurrentLocation(location)
        }
      } catch {
        // Ignore parse errors
      }
    }
    setLocationLoaded(true)
    setLastUpdated(format(new Date(), "MMM d"))
  }, [])

  // Fetch events when location changes (but only after location is loaded from localStorage)
  useEffect(() => {
    if (!locationLoaded) return
    
    const fetchEvents = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Get events for the next 3 months
        const startDate = format(new Date(), "yyyy-MM-dd")
        const endDate = format(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), "yyyy-MM-dd")
        
        const response = await fetch(`/api/events?startDate=${startDate}&endDate=${endDate}&locationId=${currentLocation.id}`)
        const data = await response.json()
        
        if (data.success) {
          setEvents(data.events)
        } else {
          setError(data.error || "Failed to load events")
        }
      } catch (err) {
        setError("Failed to connect to server")
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [currentLocation.id, locationLoaded])

  // Get unique venues for filter
  const venues = useMemo(() => {
    const venueSet = new Set(events.map((e) => e.venue.name))
    return Array.from(venueSet).sort()
  }, [events])

  // Separate featured events
  const { primaryFeatured, secondaryFeatured } = useMemo(() => {
    const featured = events.filter(e => e.featured)
    featured.sort((a, b) => (a.featuredRank ?? 999) - (b.featuredRank ?? 999))
    return {
      primaryFeatured: featured.find(e => e.featuredStyle === "primary") || featured[0] || null,
      secondaryFeatured: featured.filter(e => e !== (featured.find(f => f.featuredStyle === "primary") || featured[0])),
    }
  }, [events])

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const eventDate = new Date(event.date + "T00:00:00")

      // Search filter
      if (search) {
        const searchLower = search.toLowerCase()
        const matchesSearch =
          event.headliner.toLowerCase().includes(searchLower) ||
          event.venue.name.toLowerCase().includes(searchLower) ||
          event.artists.some((a) => a.name.toLowerCase().includes(searchLower)) ||
          event.name.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      // Venue filter
      if (venueFilter !== "all" && event.venue.name !== venueFilter) {
        return false
      }

      // Date range filter
      if (dateRange.from) {
        if (eventDate < startOfDay(dateRange.from)) return false
        if (dateRange.to && eventDate > endOfDay(dateRange.to)) return false
      }

      // Time filter
      switch (timeFilter) {
        case "today":
          if (!isToday(eventDate)) return false
          break
        case "tomorrow":
          if (!isTomorrow(eventDate)) return false
          break
        case "weekend":
          const now = new Date()
          const dayOfWeek = now.getDay()
          const friday = new Date(now)
          friday.setDate(now.getDate() + (5 - dayOfWeek + 7) % 7)
          const sunday = new Date(friday)
          sunday.setDate(friday.getDate() + 2)
          if (eventDate < startOfDay(friday) || eventDate > endOfDay(sunday)) return false
          break
        case "week":
          if (!isThisWeek(eventDate)) return false
          break
        case "month":
          if (!isThisMonth(eventDate)) return false
          break
      }

      return true
    })
  }, [events, search, venueFilter, timeFilter, dateRange])

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (search) count++
    if (timeFilter !== "all") count++
    if (venueFilter !== "all") count++
    if (dateRange.from) count++
    return count
  }, [search, timeFilter, venueFilter, dateRange])

  const clearFilters = useCallback(() => {
    setSearch("")
    setTimeFilter("all")
    setVenueFilter("all")
    setDateRange({})
  }, [])

  const handleSelectEvent = useCallback((event: TransformedEvent) => {
    router.push(`/event/${event.id}`)
  }, [router])

  const handleSelectDate = useCallback((date: Date) => {
    const dateKey = format(date, "yyyy-MM-dd")
    const dayEvents = events.filter(e => e.date === dateKey)
    if (dayEvents.length === 1) {
      handleSelectEvent(dayEvents[0])
    } else if (dayEvents.length > 1) {
      // Show all events for that day
      setDateRange({ from: date, to: date })
      setTimeFilter("all")
      setViewMode("list")
    }
  }, [events, handleSelectEvent])

  // Stats
  const stats = useMemo(() => {
    const todayEvents = events.filter(e => isToday(new Date(e.date + "T00:00:00"))).length
    const weekEvents = events.filter(e => isThisWeek(new Date(e.date + "T00:00:00"))).length
    const festivalCount = events.filter(e => e.isFestival).length
    return { todayEvents, weekEvents, festivalCount, totalVenues: venues.length }
  }, [events, venues])

  // Group events by date for list view
  const groupedEvents = useMemo(() => {
    const groups: Record<string, TransformedEvent[]> = {}
    filteredEvents.forEach((event) => {
      if (!groups[event.date]) {
        groups[event.date] = []
      }
      groups[event.date].push(event)
    })
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
  }, [filteredEvents])

  return (
    <div className="bg-white pb-8">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Hero section - Clean & Bold */}
        <header className="mb-8 sm:mb-10 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-3 sm:mb-4 tracking-tight">
            <span 
              className="city-gradient-animated"
              style={{
                backgroundImage: getCityGradient(currentLocation.city),
              }}
            >
              {currentLocation.city}
            </span>
            <span className="text-gray-900"> EDM Events</span>
          </h1>
          
          <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-900 mb-3">
            {"What's happening tonight & this weekend"}
          </p>
          
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto">
            Find the best raves, shows, and electronic events near you
          </p>
        </header>
        
        {/* Hidden SEO content for search engines */}
        <div className="sr-only">
          <h2>Chicago EDM Event Calendar 2026</h2>
          <p>
            Windy City Raves is your ultimate source for Chicago EDM events, electronic dance music concerts, 
            Chicago raves, house music shows, techno events, and music festivals. We list every DJ event, 
            club night, and electronic concert happening in Chicago and the greater Illinois area. 
            Browse upcoming events at top Chicago venues including Radius Chicago, Concord Music Hall, 
            Prysm Nightclub, The Salt Shed, Aragon Ballroom, Metro Chicago, and more. 
            Find bass music, dubstep, trance, drum and bass, and underground electronic music events. 
            Never miss a Chicago EDM show again with our live, daily-updated event calendar.
          </p>
          <h3>Popular Chicago EDM Venues</h3>
          <ul>
            <li>Radius Chicago - Premier electronic music venue</li>
            <li>Concord Music Hall - Historic Chicago concert venue</li>
            <li>Prysm Nightclub - Top Chicago nightclub</li>
            <li>The Salt Shed - Indoor/outdoor Chicago venue</li>
            <li>Aragon Ballroom - Iconic Chicago entertainment venue</li>
            <li>Metro Chicago - Legendary Chicago music venue</li>
            <li>Sound-Bar - Chicago house music club</li>
            <li>Spybar - Chicago techno and house venue</li>
          </ul>
          <h3>Chicago EDM Event Types</h3>
          <ul>
            <li>Chicago EDM concerts and shows</li>
            <li>Chicago raves and dance parties</li>
            <li>Chicago house music events</li>
            <li>Chicago techno nights</li>
            <li>Chicago bass music events</li>
            <li>Chicago music festivals</li>
            <li>Chicago DJ events</li>
            <li>Chicago club nights</li>
            <li>Chicago electronic music festivals</li>
            <li>Chicago underground music events</li>
          </ul>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <EventsFilters
            search={search}
            onSearchChange={setSearch}
            timeFilter={timeFilter}
            onTimeFilterChange={setTimeFilter}
            venueFilter={venueFilter}
            onVenueFilterChange={setVenueFilter}
            venues={venues}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            activeFiltersCount={activeFiltersCount}
            onClearFilters={clearFilters}
            citySelector={
              <LocationSelector 
                currentLocation={currentLocation}
                onLocationChange={setCurrentLocation}
              />
            }
          />
        </div>

        {/* Results count */}
        {!loading && (
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-medium text-foreground">{filteredEvents.length}</span> events
              {activeFiltersCount > 0 && (
                <span> matching your filters</span>
              )}
            </p>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Spinner className="w-8 h-8 text-primary mb-4" />
            <p className="text-muted-foreground">Loading {currentLocation.city} events...</p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="w-12 h-12 text-destructive mb-4" />
            <p className="text-lg font-medium text-foreground mb-2">Failed to load events</p>
            <p className="text-muted-foreground">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filteredEvents.length === 0 && (
          <Empty 
            icon={Calendar}
            title="No events found"
            description={
              activeFiltersCount > 0
                ? "Try adjusting your filters to find more events"
                : "Check back soon for upcoming events"
            }
          />
        )}

        {/* Events display */}
        {!loading && !error && filteredEvents.length > 0 && (
          <>
            {/* Calendar View */}
            {viewMode === "calendar" && (
              <CalendarView
                events={filteredEvents}
                onSelectEvent={handleSelectEvent}
                onSelectDate={handleSelectDate}
              />
            )}

            {/* Grid View */}
            {viewMode === "grid" && (
              <div className="space-y-4 sm:space-y-6">
                {/* Primary Featured Event - Full Width Banner */}
                {primaryFeatured && filteredEvents.some(e => e.id === primaryFeatured.id) && (
                  <EventCard
                    key={`featured-${primaryFeatured.id}`}
                    event={primaryFeatured}
                    variant="featured"
                    onSelect={handleSelectEvent}
                    priority={true}
                  />
                )}
                
                {/* Grid of Secondary Featured + Regular Events - with preloading */}
                <EventsGrid
                  events={filteredEvents}
                  secondaryFeatured={secondaryFeatured}
                  onSelectEvent={handleSelectEvent}
                />
              </div>
            )}

            {/* List View */}
            {viewMode === "list" && (
              <div className="space-y-6">
                {groupedEvents.map(([date, dayEvents]) => {
                  const eventDate = new Date(date + "T00:00:00")
                  const dayLabel = isToday(eventDate)
                    ? "Today"
                    : isTomorrow(eventDate)
                    ? "Tomorrow"
                    : format(eventDate, "EEEE, MMMM d")

                  return (
                    <div key={date}>
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="font-semibold text-foreground">{dayLabel}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {dayEvents.length} event{dayEvents.length !== 1 ? "s" : ""}
                        </Badge>
                        <div className="flex-1 h-px bg-border" />
                      </div>
                      <div className="space-y-2">
                        {dayEvents.map((event, index) => (
                          <EventCard
                            key={event.id}
                            event={event}
                            variant="list"
                            onSelect={handleSelectEvent}
                            index={index}
                          />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}
