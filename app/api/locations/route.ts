import { NextResponse } from "next/server"

const API_KEY = "633eeac1-af73-453c-8773-81781e6829de"

export interface Location {
  id: number
  city: string | null
  state: string
  stateCode: string
  country: string
  countryCode: string
  latitude: number
  longitude: number
  link: string
}

// Popular US cities to highlight
const POPULAR_CITIES = [
  "Chicago", "Los Angeles", "New York", "Miami", "Las Vegas", 
  "Denver", "Austin", "Atlanta", "Phoenix", "Seattle", 
  "San Francisco", "Detroit", "Boston", "Dallas", "Houston"
]

export async function GET() {
  try {
    const response = await fetch(
      `https://edmtrain.com/api/locations?client=${API_KEY}`,
      { next: { revalidate: 86400 } } // Cache for 24 hours
    )

    if (!response.ok) {
      throw new Error(`EDMTrain API error: ${response.status}`)
    }

    const data = await response.json()
    const locations: Location[] = data.data || []

    // Filter to US and Canada locations with cities
    const filteredLocations = locations.filter(
      (loc) => (loc.countryCode === "US" || loc.countryCode === "CA") && loc.city
    )

    // Sort with popular cities first, then alphabetically
    filteredLocations.sort((a, b) => {
      const aPopular = POPULAR_CITIES.includes(a.city || "")
      const bPopular = POPULAR_CITIES.includes(b.city || "")
      
      if (aPopular && !bPopular) return -1
      if (!aPopular && bPopular) return 1
      
      // Within popular, sort by the order in POPULAR_CITIES
      if (aPopular && bPopular) {
        return POPULAR_CITIES.indexOf(a.city || "") - POPULAR_CITIES.indexOf(b.city || "")
      }
      
      // Otherwise alphabetical by city
      return (a.city || "").localeCompare(b.city || "")
    })

    return NextResponse.json({
      success: true,
      locations: filteredLocations,
      total: filteredLocations.length,
    })
  } catch (error: unknown) {
    console.error("Locations API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch locations",
        locations: [],
      },
      { status: 500 }
    )
  }
}
