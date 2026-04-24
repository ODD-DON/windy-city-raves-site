"use client"

import { useState, useEffect } from "react"
import { MapPin, ChevronDown, Search, X, Check } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import type { Location } from "@/app/api/locations/route"

interface LocationSelectorProps {
  currentLocation: Location | null
  onLocationChange: (location: Location) => void
}

// Popular cities to show at the top
const POPULAR_CITIES = ["Chicago", "Los Angeles", "New York", "Miami", "Las Vegas", "Denver", "Atlanta", "San Francisco", "Seattle", "Austin"]

export function LocationSelector({ currentLocation, onLocationChange }: LocationSelectorProps) {
  const [open, setOpen] = useState(false)
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")

  // Store current location in localStorage whenever it changes
  useEffect(() => {
    if (currentLocation) {
      localStorage.setItem("selectedLocation", JSON.stringify(currentLocation))
    }
  }, [currentLocation])

  useEffect(() => {
    if (open && locations.length === 0) {
      setLoading(true)
      fetch("/api/locations")
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setLocations(data.locations)
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [open, locations.length])

  // Sort locations: popular cities first, then alphabetically
  const sortedLocations = [...locations].sort((a, b) => {
    const aPopIndex = POPULAR_CITIES.indexOf(a.city)
    const bPopIndex = POPULAR_CITIES.indexOf(b.city)
    
    if (aPopIndex !== -1 && bPopIndex !== -1) return aPopIndex - bPopIndex
    if (aPopIndex !== -1) return -1
    if (bPopIndex !== -1) return 1
    return a.city.localeCompare(b.city)
  })

  const filteredLocations = sortedLocations.filter(loc => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return (
      loc.city?.toLowerCase().includes(searchLower) ||
      loc.state.toLowerCase().includes(searchLower) ||
      loc.stateCode.toLowerCase().includes(searchLower)
    )
  })

  // Separate popular from other cities when not searching
  const popularLocations = !search ? filteredLocations.filter(loc => POPULAR_CITIES.includes(loc.city)) : []
  const otherLocations = !search ? filteredLocations.filter(loc => !POPULAR_CITIES.includes(loc.city)) : filteredLocations

  const handleSelect = (location: Location) => {
    onLocationChange(location)
    setOpen(false)
    setSearch("")
  }

  // Use same dialog for both mobile and desktop - this ensures onLocationChange is called directly
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button 
          className="w-full flex items-center justify-between gap-3 bg-card border-2 border-border hover:border-primary/50 hover:bg-primary/5 px-4 sm:px-5 py-3.5 sm:py-4 rounded-2xl shadow-sm hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="text-xs text-muted-foreground font-medium">Browsing events in</p>
              <p className="font-bold text-base sm:text-lg text-foreground">
                {currentLocation?.city}, {currentLocation?.stateCode}
              </p>
            </div>
          </div>
          <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-lg p-0 gap-0 overflow-hidden rounded-2xl max-h-[85vh]">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-2xl font-black">Select City</DialogTitle>
          <DialogDescription>
            Choose a city to browse EDM events
          </DialogDescription>
        </DialogHeader>
        
        {/* Search */}
        <div className="relative px-6 pb-4">
          <Search className="absolute left-10 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search cities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 pr-12 h-12 text-base rounded-xl border-2"
            autoFocus
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-10 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-2"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* List */}
        <div className="max-h-[50vh] overflow-y-auto px-6 pb-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredLocations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No cities found for &quot;{search}&quot;
            </div>
          ) : (
            <div className="space-y-4">
              {/* Popular Cities Section */}
              {popularLocations.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">Popular Cities</p>
                  <div className="grid grid-cols-2 gap-2">
                    {popularLocations.map((location) => (
                      <button
                        key={location.id}
                        onClick={() => handleSelect(location)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                          currentLocation?.id === location.id
                            ? "bg-primary text-primary-foreground shadow-lg"
                            : "bg-muted/50 hover:bg-muted border border-border"
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-bold truncate">{location.city}</p>
                          <p className={`text-xs truncate ${currentLocation?.id === location.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                            {location.stateCode}
                          </p>
                        </div>
                        {currentLocation?.id === location.id && (
                          <Check className="w-5 h-5 flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* All Cities Section */}
              {otherLocations.length > 0 && (
                <div>
                  {!search && <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">All Cities</p>}
                  <div className="space-y-1">
                    {otherLocations.map((location) => (
                      <button
                        key={location.id}
                        onClick={() => handleSelect(location)}
                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all text-left ${
                          currentLocation?.id === location.id
                            ? "bg-primary text-primary-foreground shadow-lg"
                            : "hover:bg-muted"
                        }`}
                      >
                        <MapPin className={`w-5 h-5 flex-shrink-0 ${
                          currentLocation?.id === location.id ? "text-primary-foreground" : "text-muted-foreground"
                        }`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold truncate">{location.city}</p>
                          <p className={`text-sm truncate ${currentLocation?.id === location.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                            {location.state}, {location.countryCode}
                          </p>
                        </div>
                        {currentLocation?.id === location.id && (
                          <Check className="w-5 h-5 flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
