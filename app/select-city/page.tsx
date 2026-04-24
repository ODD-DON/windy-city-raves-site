"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MapPin, Search, X, ArrowLeft, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import type { Location } from "@/app/api/locations/route"

const POPULAR_CITIES = [
  { id: 71, city: "Chicago", stateCode: "IL" },
  { id: 60, city: "Los Angeles", stateCode: "CA" },
  { id: 75, city: "New York", stateCode: "NY" },
  { id: 73, city: "Miami", stateCode: "FL" },
  { id: 59, city: "Las Vegas", stateCode: "NV" },
  { id: 86, city: "Denver", stateCode: "CO" },
  { id: 107, city: "San Francisco", stateCode: "CA" },
  { id: 82, city: "Atlanta", stateCode: "GA" },
  { id: 92, city: "Seattle", stateCode: "WA" },
  { id: 84, city: "Austin", stateCode: "TX" },
  { id: 115, city: "San Diego", stateCode: "CA" },
  { id: 99, city: "Phoenix", stateCode: "AZ" },
]

export default function SelectCityPage() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [currentLocationId, setCurrentLocationId] = useState<number | null>(null)

  useEffect(() => {
    // Get current location from localStorage
    const stored = localStorage.getItem("selectedLocation")
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setCurrentLocationId(parsed.id)
      } catch {
        setCurrentLocationId(71) // Default to Chicago
      }
    } else {
      setCurrentLocationId(71)
    }

    // Fetch all locations
    const fetchLocations = async () => {
      try {
        const res = await fetch("/api/locations")
        const data = await res.json()
        if (data.success) {
          setLocations(data.locations)
        }
      } catch (err) {
        console.error("Failed to fetch locations:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchLocations()
  }, [])

  const filteredLocations = locations.filter(
    (loc) =>
      loc.city.toLowerCase().includes(search.toLowerCase()) ||
      loc.state?.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = (location: Location) => {
    localStorage.setItem("selectedLocation", JSON.stringify(location))
    // Force a full page reload to ensure the homepage picks up the new location
    window.location.href = "/"
  }

  const handleSelectPopular = (popular: typeof POPULAR_CITIES[0]) => {
    const fullLocation = locations.find(l => l.id === popular.id)
    if (fullLocation) {
      handleSelect(fullLocation)
    } else {
      // Use partial data if full location not loaded yet
      const partialLocation: Location = {
        id: popular.id,
        city: popular.city,
        state: "",
        stateCode: popular.stateCode,
        country: "United States",
        countryCode: "US",
        latitude: 0,
        longitude: 0,
        link: ""
      }
      handleSelect(partialLocation)
    }
  }

  return (
    <div className="bg-background pb-8">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="flex items-center gap-4 px-4 py-4">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-full hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold">Select City</h1>
        </div>
        
        {/* Search */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search cities..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 pr-12 h-12 text-base rounded-xl bg-muted border-0"
              autoFocus
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content - no nested scroll container */}
      <div className="px-4 py-4">
          {/* Popular Cities */}
          {!search && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Popular Cities
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {POPULAR_CITIES.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => handleSelectPopular(city)}
                    className={`flex items-center justify-between p-4 rounded-xl transition-colors text-left ${
                      currentLocationId === city.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    <div>
                      <p className="font-semibold">{city.city}</p>
                      <p className={`text-sm ${currentLocationId === city.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {city.stateCode}
                      </p>
                    </div>
                    {currentLocationId === city.id && (
                      <Check className="w-5 h-5" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* All Cities */}
          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              {search ? "Search Results" : "All Cities"}
            </h2>
            
            {loading ? (
              <div className="space-y-2">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
                ))}
              </div>
            ) : filteredLocations.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No cities found for &quot;{search}&quot;
              </p>
            ) : (
              <div className="space-y-2">
                {filteredLocations.map((location) => (
                  <button
                    key={location.id}
                    onClick={() => handleSelect(location)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl transition-colors text-left ${
                      currentLocationId === location.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    <MapPin className={`w-5 h-5 flex-shrink-0 ${
                      currentLocationId === location.id ? "text-primary-foreground" : "text-muted-foreground"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold">{location.city}</p>
                      <p className={`text-sm ${currentLocationId === location.id ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {location.state}, {location.countryCode}
                      </p>
                    </div>
                    {currentLocationId === location.id && (
                      <Check className="w-5 h-5 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
    </div>
  )
}
