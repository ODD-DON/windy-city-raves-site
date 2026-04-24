"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { supabaseClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { 
  Star, 
  Search, 
  ChevronUp, 
  ChevronDown,
  Calendar,
  MapPin,
  Link2,
  Check,
  X,
  ExternalLink,
  Plus,
  Trash2,
  Upload,
  Globe
} from "lucide-react"
import { LocationSelector } from "@/components/location-selector"
import type { Location } from "@/app/api/locations/route"
import { Label } from "@/components/ui/label"
import type { TransformedEvent } from "@/app/api/events/route"
import { format } from "date-fns"

interface VenueOverride {
  venue_id: number
  venue_name: string
  custom_url: string | null
  uses_google: boolean
}

type AdminTab = "featured" | "venues" | "add-event"

interface CustomEventForm {
  headliner: string
  additionalArtists: string
  date: string
  startTime: string
  endTime: string
  venueName: string
  venueId: string
  venueAddress: string
  ages: string
  ticketUrl: string
  imageUrl: string
  isFestival: boolean
}

export default function AdminPage() {
  const router = useRouter()
  
  const [activeTab, setActiveTab] = useState<AdminTab>("featured")
  const [events, setEvents] = useState<TransformedEvent[]>([])
  const [featuredIds, setFeaturedIds] = useState<Map<number, { rank: number | null; style: string | null }>>(new Map())
  const [search, setSearch] = useState("")
  const [updating, setUpdating] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Location state - default to Chicago
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
  
  // Venue management state
  const [venueOverrides, setVenueOverrides] = useState<Map<number, VenueOverride>>(new Map())
  const [editingVenue, setEditingVenue] = useState<number | null>(null)
  const [editingUrl, setEditingUrl] = useState("")
  const [venueSearch, setVenueSearch] = useState("")
  
  // Add event state
  const [eventForm, setEventForm] = useState<CustomEventForm>({
    headliner: "",
    additionalArtists: "",
    date: "",
    startTime: "",
    endTime: "",
    venueName: "",
    venueId: "",
    venueAddress: "",
    ages: "21+",
    ticketUrl: "",
    imageUrl: "",
    isFestival: false,
  })
  const [savingEvent, setSavingEvent] = useState(false)
  const [eventSuccess, setEventSuccess] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // Get access token - try Supabase first, fallback to sessionStorage for sandboxed environments
  const getAccessToken = useCallback((): string | null => {
    // First try Supabase client
    const supabaseToken = supabaseClient.auth.getAccessToken()
    if (supabaseToken) return supabaseToken
    
    // Fallback to sessionStorage (for sandboxed iframes where cookies are blocked)
    try {
      return sessionStorage.getItem("wcr_admin_token")
    } catch {
      return null
    }
  }, [])

  // Check if user is authenticated
  useEffect(() => {
    const token = getAccessToken()
    if (!token) {
      // No auth token found, redirect to login
      router.push("/admin/login")
    }
  }, [getAccessToken, router])

  // Fetch events and featured status
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      // Fetch events from API
      const startDate = format(new Date(), "yyyy-MM-dd")
      const endDate = format(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), "yyyy-MM-dd")
      
      const eventsRes = await fetch(`/api/events?startDate=${startDate}&endDate=${endDate}&locationId=${currentLocation.id}`)
      const eventsData = await eventsRes.json()
      
      if (eventsData.success) {
        setEvents(eventsData.events)
      }
      
      // Fetch featured overrides using REST API
      const accessToken = getAccessToken()
      if (!accessToken) {
        router.push("/admin/login")
        return
      }
      
      const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      
      const overridesRes = await fetch(
        `${SUPABASE_URL}/rest/v1/wcr_event_calendar_event_admin_overrides?featured=eq.true&select=edmtrain_event_id,featured_rank,featured_style`,
        {
          headers: {
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": `Bearer ${accessToken}`,
          },
        }
      )
      
      const overrides = await overridesRes.json()
      
      if (Array.isArray(overrides)) {
        const map = new Map<number, { rank: number | null; style: string | null }>()
        overrides.forEach((o: any) => map.set(o.edmtrain_event_id, { 
          rank: o.featured_rank, 
          style: o.featured_style 
        }))
        setFeaturedIds(map)
      }
      
      // Fetch venue overrides
      const venueOverridesRes = await fetch(
        `${SUPABASE_URL}/rest/v1/wcr_event_calendar_venue_overrides?select=venue_id,venue_name,custom_url,uses_google`,
        {
          headers: {
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": `Bearer ${accessToken}`,
          },
        }
      )
      
      const venueData = await venueOverridesRes.json()
      if (Array.isArray(venueData)) {
        const venueMap = new Map<number, VenueOverride>()
        venueData.forEach((v: VenueOverride) => venueMap.set(v.venue_id, v))
        setVenueOverrides(venueMap)
      }
    } catch (err) {
      console.error("Error fetching data:", err)
    } finally {
      setLoading(false)
    }
  }, [currentLocation.id])

  useEffect(() => {
    fetchData()
  }, [fetchData])



  const toggleFeatured = async (eventId: number) => {
    setUpdating(eventId)
    const isFeatured = featuredIds.has(eventId)
    
    try {
      if (isFeatured) {
        // Remove from featured
        await supabaseClient.from("wcr_event_calendar_event_admin_overrides").delete().eq("edmtrain_event_id", eventId)
        
        const newMap = new Map(featuredIds)
        newMap.delete(eventId)
        setFeaturedIds(newMap)
      } else {
        // Add to featured
        const maxRank = Math.max(0, ...Array.from(featuredIds.values()).map(v => v.rank ?? 0))
        
        await supabaseClient.from("wcr_event_calendar_event_admin_overrides").upsert({
          edmtrain_event_id: eventId,
          featured: true,
          featured_rank: maxRank + 1,
          updated_at: new Date().toISOString()
        })
        
        const newMap = new Map(featuredIds)
        newMap.set(eventId, { rank: maxRank + 1, style: null })
        setFeaturedIds(newMap)
      }
    } catch (err) {
      console.error("Error toggling featured:", err)
    }
    
    setUpdating(null)
  }

  const updateRank = async (eventId: number, direction: "up" | "down") => {
    const current = featuredIds.get(eventId)
    if (!current) return
    
    const currentRank = current.rank ?? 999
    const newRank = direction === "up" ? Math.max(1, currentRank - 1) : currentRank + 1
    
    try {
      await supabaseClient
        .from("wcr_event_calendar_event_admin_overrides")
        .update({ featured_rank: newRank, updated_at: new Date().toISOString() })
        .eq("edmtrain_event_id", eventId)
      
      const newMap = new Map(featuredIds)
      newMap.set(eventId, { ...current, rank: newRank })
      setFeaturedIds(newMap)
    } catch (err) {
      console.error("Error updating rank:", err)
    }
  }

  // Venue management functions
  const saveVenueOverride = async (venueId: number, venueName: string, customUrl: string | null, usesGoogle: boolean) => {
    setUpdating(venueId)
    try {
      const accessToken = supabaseClient.auth.getAccessToken()
      const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      
      // Upsert venue override
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/wcr_event_calendar_venue_overrides?on_conflict=venue_id`,
        {
          method: "POST",
          headers: {
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "Prefer": "return=representation,resolution=merge-duplicates",
          },
          body: JSON.stringify({
            venue_id: venueId,
            venue_name: venueName,
            custom_url: customUrl || null,
            uses_google: usesGoogle,
            updated_at: new Date().toISOString(),
          }),
        }
      )
      
      const result = await res.json()
      console.log("[v0] Save venue override response:", res.status, result)
      
      const newMap = new Map(venueOverrides)
      newMap.set(venueId, { venue_id: venueId, venue_name: venueName, custom_url: customUrl, uses_google: usesGoogle })
      setVenueOverrides(newMap)
      setEditingVenue(null)
      setEditingUrl("")
    } catch (err) {
      console.error("Error saving venue override:", err)
    }
    setUpdating(null)
  }

  // Delete custom event
  const deleteCustomEvent = async (eventId: number) => {
    if (!confirm("Are you sure you want to delete this event? This cannot be undone.")) {
      return
    }
    
    setUpdating(eventId)
    
    try {
      const accessToken = supabaseClient.auth.getAccessToken()
      const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      
      // Delete the custom event
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/wcr_event_calendar_custom_events?event_id=eq.${eventId}`,
        {
          method: "DELETE",
          headers: {
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": `Bearer ${accessToken}`,
          },
        }
      )
      
      // Also delete any featured override for this event
      await fetch(
        `${SUPABASE_URL}/rest/v1/wcr_event_calendar_event_admin_overrides?edmtrain_event_id=eq.${eventId}`,
        {
          method: "DELETE",
          headers: {
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": `Bearer ${accessToken}`,
          },
        }
      )
      
      if (res.ok) {
        // Remove from local state
        setEvents(prev => prev.filter(e => e.id !== eventId))
        // Remove from featured map if present
        setFeaturedIds(prev => {
          const newMap = new Map(prev)
          newMap.delete(eventId)
          return newMap
        })
        setEventSuccess("Event deleted successfully")
        setTimeout(() => setEventSuccess(null), 3000)
      } else {
        const error = await res.json()
        console.error("Error deleting event:", error)
        alert("Failed to delete event")
      }
    } catch (err) {
      console.error("Error deleting custom event:", err)
      alert("Failed to delete event")
    }
    
    setUpdating(null)
  }

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      alert("Invalid file type. Allowed: jpg, png, webp, gif")
      return
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File too large. Max 5MB")
      return
    }
    
    setUploadingImage(true)
    
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("folder", "event-images")
      
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
      
      if (res.ok) {
        const data = await res.json()
        setEventForm({ ...eventForm, imageUrl: data.url })
        setImagePreview(data.url)
      } else {
        const error = await res.json()
        alert(error.error || "Failed to upload image")
      }
    } catch (err) {
      console.error("Error uploading image:", err)
      alert("Failed to upload image")
    }
    
    setUploadingImage(false)
  }

  // Save custom event
  const saveCustomEvent = async () => {
    if (!eventForm.headliner || !eventForm.date || !eventForm.venueName) {
      alert("Please fill in headliner, date, and venue name")
      return
    }
    
    setSavingEvent(true)
    setEventSuccess(null)
    
    try {
      const accessToken = supabaseClient.auth.getAccessToken()
      const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      
      // Parse additional artists
      const additionalArtists = eventForm.additionalArtists
        .split(",")
        .map(a => a.trim())
        .filter(a => a.length > 0)
        .map((name, i) => ({ id: -(i + 2), name }))
      
      const artists = [
        { id: -1, name: eventForm.headliner },
        ...additionalArtists
      ]
      
      // Use existing venue ID or generate a negative one
      const venueId = eventForm.venueId ? parseInt(eventForm.venueId) : -(Date.now() % 100000)
      
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/wcr_event_calendar_custom_events`,
        {
          method: "POST",
          headers: {
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "Prefer": "return=representation",
          },
          body: JSON.stringify({
            name: eventForm.headliner,
            headliner: eventForm.headliner,
            date: eventForm.date,
            start_time: eventForm.startTime || null,
            end_time: eventForm.endTime || null,
            ages: eventForm.ages || null,
            venue_id: venueId,
            venue_name: eventForm.venueName,
            venue_location: `${currentLocation.city}, ${currentLocation.stateCode}`,
            venue_address: eventForm.venueAddress || null,
            location_id: currentLocation.id,
            artists: artists,
            is_festival: eventForm.isFestival,
            is_electronic: true,
            ticket_url: eventForm.ticketUrl || null,
            image_url: eventForm.imageUrl || null,
          }),
        }
      )
      
      if (res.ok) {
        setEventSuccess(`Event "${eventForm.headliner}" added successfully!`)
        setEventForm({
          headliner: "",
          additionalArtists: "",
          date: "",
          startTime: "",
          endTime: "",
          venueName: "",
          venueId: "",
          venueAddress: "",
          ages: "21+",
          ticketUrl: "",
          imageUrl: "",
          isFestival: false,
        })
        setImagePreview(null)
        // Refresh events list
        fetchData()
      } else {
        const error = await res.json()
        console.error("Error saving event:", error)
        alert("Failed to save event")
      }
    } catch (err) {
      console.error("Error saving custom event:", err)
      alert("Failed to save event")
    }
    
    setSavingEvent(false)
  }

  // Get unique venues from events
  const uniqueVenues = useMemo(() => {
    const venueMap = new Map<number, { id: number; name: string; currentUrl: string }>()
    events.forEach(event => {
      if (!venueMap.has(event.venue.id)) {
        venueMap.set(event.venue.id, {
          id: event.venue.id,
          name: event.venue.name,
          currentUrl: event.ticketUrl
        })
      }
    })
    return Array.from(venueMap.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [events])

  // Filter venues by search
  const filteredVenues = useMemo(() => {
    if (!venueSearch) return uniqueVenues
    const searchLower = venueSearch.toLowerCase()
    return uniqueVenues.filter(v => v.name.toLowerCase().includes(searchLower))
  }, [uniqueVenues, venueSearch])

  // Filter events by search
  const filteredEvents = useMemo(() => {
    if (!search) return events
    const searchLower = search.toLowerCase()
    return events.filter(e => 
      e.headliner.toLowerCase().includes(searchLower) ||
      e.venue.name.toLowerCase().includes(searchLower) ||
      e.artists.some(a => a.name.toLowerCase().includes(searchLower))
    )
  }, [events, search])

  // Sort: featured first, then by date
  const sortedEvents = useMemo(() => {
    return [...filteredEvents].sort((a, b) => {
      const aFeatured = featuredIds.has(a.id)
      const bFeatured = featuredIds.has(b.id)
      if (aFeatured && !bFeatured) return -1
      if (!aFeatured && bFeatured) return 1
      if (aFeatured && bFeatured) {
        const aRank = featuredIds.get(a.id)?.rank ?? 999
        const bRank = featuredIds.get(b.id)?.rank ?? 999
        return aRank - bRank
      }
      return 0
    })
  }, [filteredEvents, featuredIds])

  if (loading) {
    return (
      <div className="bg-background flex items-center justify-center py-20">
        <Spinner className="w-8 h-8" />
      </div>
    )
  }

  return (
    <div className="pb-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Location Selector */}
        <div className="flex items-center justify-end mb-6">
          <LocationSelector 
            currentLocation={currentLocation}
            onLocationChange={setCurrentLocation}
          />
        </div>
        {/* Page Title & Stats */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Globe className="w-4 h-4" />
            <span>{currentLocation.city}, {currentLocation.stateCode}</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight mb-1">
            {activeTab === "featured" && "Featured Events"}
            {activeTab === "venues" && "Venue Links"}
            {activeTab === "add-event" && "Add New Event"}
          </h2>
          <p className="text-muted-foreground">
            {activeTab === "featured" && `Manage ${featuredIds.size} featured events from ${events.length} total in ${currentLocation.city}`}
            {activeTab === "venues" && `Configure ticket links for ${uniqueVenues.length} venues in ${currentLocation.city}`}
            {activeTab === "add-event" && `Create a custom event in ${currentLocation.city} that will appear on the calendar`}
          </p>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg w-fit mb-8">
          <button
            onClick={() => setActiveTab("featured")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "featured" 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Star className={`w-4 h-4 ${activeTab === "featured" ? "text-amber-500" : ""}`} />
            Featured
          </button>
          <button
            onClick={() => setActiveTab("venues")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "venues" 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Link2 className={`w-4 h-4 ${activeTab === "venues" ? "text-green-500" : ""}`} />
            Venues
          </button>
          <button
            onClick={() => setActiveTab("add-event")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === "add-event" 
                ? "bg-background text-foreground shadow-sm" 
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Plus className={`w-4 h-4 ${activeTab === "add-event" ? "text-cyan-500" : ""}`} />
            Add Event
          </button>
        </div>

        {/* Featured Events Tab */}
        {activeTab === "featured" && (
          <>
            {/* Search & Stats Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
              <div className="relative flex-1 max-w-md w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by artist, venue..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-muted/50 border-transparent focus:border-border focus:bg-background transition-colors"
                />
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-muted-foreground">{featuredIds.size} Featured</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/50" />
                  <span className="text-muted-foreground">{events.length - featuredIds.size} Regular</span>
                </div>
              </div>
            </div>

            {/* Events list */}
            <div className="rounded-xl border border-border overflow-hidden">
              {sortedEvents.map((event, index) => {
                const isFeatured = featuredIds.has(event.id)
                const rank = featuredIds.get(event.id)?.rank
                const eventDate = new Date(event.date + "T00:00:00")
                
                return (
                  <div 
                    key={event.id}
                    className={`flex items-center gap-4 p-4 transition-all group ${
                      index !== sortedEvents.length - 1 ? "border-b border-border" : ""
                    } ${
                      isFeatured 
                        ? "bg-amber-500/5" 
                        : "hover:bg-muted/50"
                    }`}
                  >
                    {/* Rank indicator / Image */}
                    <div className="relative flex-shrink-0">
                      {isFeatured && (
                        <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-8 bg-amber-500 rounded-r" />
                      )}
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden ring-1 ring-border">
                        <Image
                          src={event.imageUrl}
                          alt={event.headliner}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                    
                    {/* Event info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium truncate">{event.headliner}</h3>
                        {event.id < 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-cyan-500/10 text-cyan-500 ring-1 ring-inset ring-cyan-500/20">
                            Custom
                          </span>
                        )}
                        {isFeatured && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-500 ring-1 ring-inset ring-amber-500/20">
                            <Star className="w-2.5 h-2.5 fill-current" />
                            {rank === 1 ? "Primary" : `#${rank}`}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          {format(eventDate, "EEE, MMM d")}
                        </span>
                        <span className="flex items-center gap-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="truncate">{event.venue.name}</span>
                        </span>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {/* Rank controls (if featured) */}
                      {isFeatured && (
                        <div className="flex items-center gap-0.5 p-1 rounded-lg bg-muted/50">
                          <button 
                            onClick={() => updateRank(event.id, "up")}
                            className="p-1.5 rounded-md hover:bg-background transition-colors disabled:opacity-30"
                            disabled={rank === 1}
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <span className="w-6 text-center text-xs font-medium text-muted-foreground">{rank}</span>
                          <button 
                            onClick={() => updateRank(event.id, "down")}
                            className="p-1.5 rounded-md hover:bg-background transition-colors"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      
                      {/* Toggle button */}
                      <button
                        onClick={() => toggleFeatured(event.id)}
                        disabled={updating === event.id}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          isFeatured 
                            ? "bg-amber-500 text-black hover:bg-amber-400" 
                            : "bg-muted hover:bg-muted/80 text-foreground"
                        }`}
                      >
                        {updating === event.id ? (
                          <Spinner className="w-4 h-4" />
                        ) : (
                          <>
                            <Star className={`w-4 h-4 ${isFeatured ? "fill-current" : ""}`} />
                            <span className="hidden sm:inline">{isFeatured ? "Featured" : "Feature"}</span>
                          </>
                        )}
                      </button>
                      
                      {/* Delete button for custom events */}
                      {event.id < 0 && (
                        <button
                          onClick={() => deleteCustomEvent(event.id)}
                          disabled={updating === event.id}
                          className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          {updating === event.id ? (
                            <Spinner className="w-4 h-4" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
              
              {sortedEvents.length === 0 && (
                <div className="p-12 text-center text-muted-foreground">
                  <Search className="w-8 h-8 mx-auto mb-3 opacity-50" />
                  <p>No events found</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Venues Tab */}
        {activeTab === "venues" && (
          <>
            {/* Venue Search & Stats */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
              <div className="relative flex-1 max-w-md w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search venues..."
                  value={venueSearch}
                  onChange={(e) => setVenueSearch(e.target.value)}
                  className="pl-10 bg-muted/50 border-transparent focus:border-border focus:bg-background transition-colors"
                />
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-muted-foreground">{Array.from(venueOverrides.values()).filter(v => v.custom_url).length} Custom</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-muted-foreground">{uniqueVenues.filter(v => !venueOverrides.get(v.id)?.custom_url && v.currentUrl.includes("google.com")).length} Google</span>
                </div>
              </div>
            </div>

            {/* Venues list */}
            <div className="rounded-xl border border-border overflow-hidden">
              {filteredVenues.map((venue, index) => {
                const override = venueOverrides.get(venue.id)
                const isEditing = editingVenue === venue.id
                const usesGoogle = override?.uses_google ?? venue.currentUrl.includes("google.com/search")
                const displayUrl = override?.custom_url || venue.currentUrl
                
                return (
                  <div 
                    key={venue.id}
                    className={`p-4 transition-all ${
                      index !== filteredVenues.length - 1 ? "border-b border-border" : ""
                    } ${
                      override?.custom_url 
                        ? "bg-green-500/5" 
                        : usesGoogle
                        ? "bg-amber-500/5"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <h3 className="font-medium">{venue.name}</h3>
                          {override?.custom_url && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-500/10 text-green-500 ring-1 ring-inset ring-green-500/20">
                              Custom Link
                            </span>
                          )}
                          {usesGoogle && !override?.custom_url && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-500 ring-1 ring-inset ring-amber-500/20">
                              Google Search
                            </span>
                          )}
                        </div>
                        
                        {isEditing ? (
                          <div className="flex items-center gap-2 mt-3">
                            <Input
                              placeholder="https://venue-tickets.com/..."
                              value={editingUrl}
                              onChange={(e) => setEditingUrl(e.target.value)}
                              className="flex-1 h-9 text-sm bg-background"
                              autoFocus
                            />
                            <button
                              onClick={() => saveVenueOverride(venue.id, venue.name, editingUrl || null, false)}
                              disabled={updating === venue.id}
                              className="p-2 rounded-lg bg-green-500 text-white hover:bg-green-400 transition-colors disabled:opacity-50"
                            >
                              {updating === venue.id ? <Spinner className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => { setEditingVenue(null); setEditingUrl(""); }}
                              className="p-2 rounded-lg hover:bg-muted transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground ml-6">
                            <span className="truncate">{displayUrl}</span>
                            <a 
                              href={displayUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary/80 flex-shrink-0 transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        )}
                      </div>
                      
                      {!isEditing && (
                        <button
                          onClick={() => {
                            setEditingVenue(venue.id)
                            setEditingUrl(override?.custom_url || "")
                          }}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            override?.custom_url 
                              ? "bg-green-500 text-white hover:bg-green-400" 
                              : "bg-muted hover:bg-muted/80 text-foreground"
                          }`}
                        >
                          <Link2 className="w-4 h-4" />
                          <span className="hidden sm:inline">{override?.custom_url ? "Edit" : "Set Link"}</span>
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
              
              {filteredVenues.length === 0 && (
                <div className="p-12 text-center text-muted-foreground">
                  <MapPin className="w-8 h-8 mx-auto mb-3 opacity-50" />
                  <p>No venues found</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Add Event Tab */}
        {activeTab === "add-event" && (
          <div className="space-y-8">
            {eventSuccess && (
              <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="p-1 rounded-full bg-green-500/20">
                  <Check className="w-4 h-4" />
                </div>
                <span className="font-medium">{eventSuccess}</span>
              </div>
            )}
            
            {/* Form Card */}
            <div className="rounded-xl border border-border p-6 sm:p-8 bg-card/50">
              <div className="grid gap-6 sm:grid-cols-2">
              {/* Headliner */}
              <div className="space-y-2">
                <Label htmlFor="headliner" className="text-sm font-medium text-foreground">
                  Headliner <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="headliner"
                  placeholder="e.g. Skrillex"
                  value={eventForm.headliner}
                  onChange={(e) => setEventForm({ ...eventForm, headliner: e.target.value })}
                  className="bg-background"
                />
              </div>
              
              {/* Additional Artists */}
              <div className="space-y-2">
                <Label htmlFor="artists" className="text-sm font-medium text-foreground">
                  Additional Artists
                </Label>
                <Input
                  id="artists"
                  placeholder="e.g. Four Tet, Fred Again (comma separated)"
                  value={eventForm.additionalArtists}
                  onChange={(e) => setEventForm({ ...eventForm, additionalArtists: e.target.value })}
                  className="bg-background"
                />
              </div>
              
              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="date" className="text-sm font-medium text-foreground">
                  Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={eventForm.date}
                  onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
                  className="bg-background"
                />
              </div>
              
              {/* Start Time */}
              <div className="space-y-2">
                <Label htmlFor="startTime" className="text-sm font-medium text-foreground">
                  Start Time
                </Label>
                <Input
                  id="startTime"
                  type="time"
                  value={eventForm.startTime}
                  onChange={(e) => setEventForm({ ...eventForm, startTime: e.target.value })}
                  className="bg-background"
                />
              </div>
              
              {/* Venue Name */}
              <div className="space-y-2">
                <Label htmlFor="venue" className="text-sm font-medium text-foreground">
                  Venue Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="venue"
                  placeholder="e.g. Radius Chicago"
                  value={eventForm.venueName}
                  onChange={(e) => {
                    const value = e.target.value
                    setEventForm({ ...eventForm, venueName: value })
                    const match = uniqueVenues.find(v => v.name.toLowerCase() === value.toLowerCase())
                    if (match) {
                      setEventForm(prev => ({ ...prev, venueId: match.id.toString() }))
                    }
                  }}
                  list="venue-suggestions"
                  className="bg-background"
                />
                <datalist id="venue-suggestions">
                  {uniqueVenues.map(v => (
                    <option key={v.id} value={v.name} />
                  ))}
                </datalist>
              </div>
              
              {/* Venue Address */}
              <div className="space-y-2">
                <Label htmlFor="venueAddress" className="text-sm font-medium text-foreground">Venue Address</Label>
                <Input
                  id="venueAddress"
                  placeholder="e.g. 640 W Cermak Rd, Chicago, IL"
                  value={eventForm.venueAddress}
                  onChange={(e) => setEventForm({ ...eventForm, venueAddress: e.target.value })}
                  className="bg-background"
                />
              </div>
              
              {/* Ages */}
              <div className="space-y-2">
                <Label htmlFor="ages" className="text-sm font-medium text-foreground">Ages</Label>
                <Input
                  id="ages"
                  placeholder="e.g. 21+, 18+, All Ages"
                  value={eventForm.ages}
                  onChange={(e) => setEventForm({ ...eventForm, ages: e.target.value })}
                  className="bg-background"
                />
              </div>
              
              {/* Ticket URL */}
              <div className="space-y-2">
                <Label htmlFor="ticketUrl" className="text-sm font-medium text-foreground">
                  Ticket URL
                </Label>
                <Input
                  id="ticketUrl"
                  type="url"
                  placeholder="https://..."
                  value={eventForm.ticketUrl}
                  onChange={(e) => setEventForm({ ...eventForm, ticketUrl: e.target.value })}
                  className="bg-background"
                />
              </div>
              
              {/* Event Image Upload */}
              <div className="space-y-3 sm:col-span-2">
                <Label className="text-sm font-medium text-foreground">
                  Event Image
                </Label>
                <div className="flex items-start gap-4">
                  {imagePreview ? (
                    <div className="relative w-32 h-32 rounded-xl overflow-hidden ring-1 ring-border">
                      <Image
                        src={imagePreview}
                        alt="Event preview"
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null)
                          setEventForm({ ...eventForm, imageUrl: "" })
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur-sm rounded-full hover:bg-black/80 transition-colors"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-32 h-32 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/50 cursor-pointer transition-all group">
                      {uploadingImage ? (
                        <Spinner className="w-6 h-6" />
                      ) : (
                        <>
                          <div className="p-2 rounded-full bg-muted group-hover:bg-primary/10 transition-colors mb-2">
                            <Upload className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                          </div>
                          <span className="text-xs text-muted-foreground">Upload image</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="hidden"
                      />
                    </label>
                  )}
                  <div className="text-sm text-muted-foreground pt-2">
                    <p className="mb-1">Recommended: 1200x630px</p>
                    <p className="text-xs">JPG, PNG, WebP, GIF (max 5MB)</p>
                  </div>
                </div>
              </div>
              
              {/* Festival Toggle */}
              <div className="flex items-center gap-3 sm:col-span-2 pt-2">
                <button
                  type="button"
                  role="switch"
                  aria-checked={eventForm.isFestival}
                  onClick={() => setEventForm({ ...eventForm, isFestival: !eventForm.isFestival })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    eventForm.isFestival ? "bg-cyan-500" : "bg-muted"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      eventForm.isFestival ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
                <Label htmlFor="isFestival" className="text-sm cursor-pointer" onClick={() => setEventForm({ ...eventForm, isFestival: !eventForm.isFestival })}>
                  This is a festival
                </Label>
              </div>
            </div>
              
            {/* Submit Button */}
              <div className="flex items-center justify-between pt-6 border-t border-border mt-8">
                <p className="text-sm text-muted-foreground">
                  Fields marked with <span className="text-destructive">*</span> are required
                </p>
                <button
                  onClick={saveCustomEvent}
                  disabled={savingEvent || !eventForm.headliner || !eventForm.date || !eventForm.venueName}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-500 text-black font-medium hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingEvent ? (
                    <Spinner className="w-4 h-4" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  Add Event
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
