/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"

// EDMTrain API configuration
const API_KEY = "633eeac1-af73-453c-8773-81781e6829de"
const CHICAGO_LOCATION_ID = "71" // Default location

// Venue website database for ticket links
const VENUE_WEBSITES: Record<string, string> = {
  "Aragon Ballroom": "https://aragonballroom.com",
  "Byline Bank Aragon Ballroom": "https://aragonballroom.com",
  "Chicago Theatre": "https://msg.com/the-chicago-theatre",
  "Concord Music Hall": "https://concordmusichall.com",
  "Credit Union 1 Arena": "https://creditunion1arena.com",
  "Huntington Bank Pavilion": "https://huntingtonbankpavilion.com",
  "Northerly Island": "https://huntingtonbankpavilion.com",
  "House of Blues Chicago": "https://www.houseofblues.com/chicago",
  "Lollapalooza": "https://www.lollapalooza.com",
  "Grant Park": "https://www.lollapalooza.com",
  "Metro Chicago": "https://metrochicago.com",
  "Navy Pier": "https://navypier.org",
  "Park West": "https://www.jamusa.com/venues/park-west",
  "Portage Theater": "https://www.portagetheater.com",
  "Pritzker Pavilion": "https://www.cityofchicago.org/city/en/depts/dca/supp_info/millennium_park.html",
  "Radius Chicago": "https://radiuschicago.com",
  "Riviera Theatre": "https://rivieratheatre.com",
  "Salt Shed": "https://saltshedchicago.com",
  "The Salt Shed": "https://saltshedchicago.com",
  "Smart Bar": "https://smartbarchicago.com",
  "Soldier Field": "https://www.soldierfield.com",
  "Sound-Bar": "https://sound-bar.com",
  "Spybar": "https://www.spybarchicago.com",
  "Spy Bar": "https://www.spybarchicago.com",
  "Subterranean": "https://www.subt.net",
  "The Vic Theatre": "https://www.jamusa.com/venues/the-vic-theatre",
  "Vic Theatre": "https://www.jamusa.com/venues/the-vic-theatre",
  "United Center": "https://www.unitedcenter.com",
  "Wintrust Arena": "https://www.wintrustarena.com",
  "Wrigley Field": "https://www.mlb.com/cubs/ballpark",
  "Schubas Tavern": "https://lh-st.com",
  "Lincoln Hall": "https://lh-st.com",
  "Thalia Hall": "https://thaliahallchicago.com",
  "Bottom Lounge": "https://bottomlounge.com",
  "Chop Shop": "https://chopshop.com",
  "Empty Bottle": "https://emptybottle.com",
  "Sleeping Village": "https://sleeping-village.com",
  "Hideout": "https://hideoutchicago.com",
  "Kingston Mines": "https://kingstonmines.com",
  "Prysm Nightclub": "https://prysmchicago.com",
  "PRYSM": "https://prysmchicago.com",
}

interface EDMTrainEvent {
  id: number
  link?: string
  ticketLink?: string
  ages?: string
  name?: string
  date: string
  startTime?: string
  endTime?: string
  createdDate: string
  venue: {
    id: number
    name: string
    location: string
    address?: string
    state?: string
  }
  artistList: Array<{
    id: number
    name: string
    b2b?: boolean
  }>
  festivalInd: boolean
  electronicMusicInd: boolean
}

export interface TransformedEvent {
  id: number
  name: string
  date: string
  startTime?: string
  endTime?: string
  venue: {
    id: number
    name: string
    location: string
    address?: string
    state?: string
  }
  artists: Array<{
    id: number
    name: string
    b2b?: boolean
  }>
  headliner: string
  isFestival: boolean
  isElectronic: boolean
  ticketUrl: string
  ages?: string
  imageUrl: string
  featured?: boolean
  featuredStyle?: string | null
  featuredRank?: number | null
}

interface AdminOverride {
  edmtrain_event_id: number
  featured: boolean
  featured_style: string | null
  featured_rank: number | null
}

interface VenueOverride {
  venue_id: number
  venue_name: string
  custom_url: string | null
  uses_google: boolean
}

interface CustomEvent {
  id: number
  event_id: number
  name: string
  headliner: string
  date: string
  start_time: string | null
  end_time: string | null
  ages: string | null
  venue_id: number
  venue_name: string
  venue_location: string
  venue_address: string | null
  artists: Array<{ id: number; name: string; b2b?: boolean }>
  is_festival: boolean
  is_electronic: boolean
  ticket_url: string | null
  image_url: string | null
}

function getTicketUrl(event: EDMTrainEvent, venueOverrideMap?: Map<number, VenueOverride>): string {
  // First check if there's a database override for this venue
  if (venueOverrideMap && venueOverrideMap instanceof Map && event.venue?.id) {
    const override = venueOverrideMap.get(event.venue.id)
    if (override?.custom_url) {
      console.log(`[v0] Using custom URL for venue ${event.venue.name}: ${override.custom_url}`)
      return override.custom_url
    }
  }
  
  // Use event's ticket link if available
  if (event.ticketLink) return event.ticketLink
  
  // Check hardcoded venue websites
  const venueName = event.venue?.name?.toLowerCase() || ""
  for (const [venue, url] of Object.entries(VENUE_WEBSITES)) {
    if (venueName.includes(venue.toLowerCase())) {
      return url
    }
  }
  
  // Fall back to Google search
  const googleSearch = `https://www.google.com/search?q=${encodeURIComponent(`${event.venue?.name || "Chicago"} tickets ${event.artistList?.[0]?.name || ""}`)}`
  return googleSearch
}

function transformEvent(event: EDMTrainEvent, venueOverrides?: Map<number, VenueOverride>): TransformedEvent {
  const headliner = event.artistList?.[0]?.name || "TBA"
  const imageUrl = `https://d2po6uops3e7id.cloudfront.net/img/event/${event.id}-large.webp`
  return {
    id: event.id,
    name: event.name || headliner,
    date: event.date,
    startTime: event.startTime,
    endTime: event.endTime,
    venue: event.venue,
    artists: event.artistList || [],
    headliner,
    isFestival: event.festivalInd || false,
    isElectronic: event.electronicMusicInd !== false,
    ticketUrl: getTicketUrl(event, venueOverrides),
    ages: event.ages,
    imageUrl,
    featured: false,
    featuredStyle: null,
    featuredRank: null,
  }
}

function transformCustomEvent(event: CustomEvent, venueOverrides?: Map<number, VenueOverride>): TransformedEvent {
  // Custom events use their event_id (negative number to avoid collision)
  const venueOverride = venueOverrides?.get(event.venue_id)
  const ticketUrl = venueOverride?.custom_url || event.ticket_url || 
    `https://www.google.com/search?q=${encodeURIComponent(`${event.venue_name} tickets ${event.headliner}`)}`
  
  // Default image or custom uploaded image
  const imageUrl = event.image_url || "/images/default-event.jpg"
  
  return {
    id: event.event_id,
    name: event.name,
    date: event.date,
    startTime: event.start_time || undefined,
    endTime: event.end_time || undefined,
    venue: {
      id: event.venue_id,
      name: event.venue_name,
      location: event.venue_location,
      address: event.venue_address || undefined,
    },
    artists: event.artists || [],
    headliner: event.headliner,
    isFestival: event.is_festival,
    isElectronic: event.is_electronic,
    ticketUrl,
    ages: event.ages || undefined,
    imageUrl,
    featured: false,
    featuredStyle: null,
    featuredRank: null,
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const locationId = searchParams.get("locationId") || CHICAGO_LOCATION_ID

    let url = `https://edmtrain.com/api/events?locationIds=${locationId}&client=${API_KEY}`
    if (startDate) url += `&startDate=${startDate}`
    if (endDate) url += `&endDate=${endDate}`

    const response = await fetch(url, {
      next: { revalidate: 300 },
    })

    if (!response.ok) {
      throw new Error(`EDMTrain API error: ${response.status}`)
    }

    const data = await response.json()
    const events: EDMTrainEvent[] = data.data || []
    
    // Fetch venue overrides first so we can use them in transformation
    let venueOverrideMap: Map<number, VenueOverride> | undefined
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (supabaseUrl && supabaseKey) {
      try {
        const venueOverridesRes = await fetch(
          `${supabaseUrl}/rest/v1/wcr_event_calendar_venue_overrides?select=venue_id,venue_name,custom_url,uses_google`,
          {
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
            },
            next: { revalidate: 60 },
          }
        )
        
        if (venueOverridesRes.ok) {
          const venueOverrides: VenueOverride[] = await venueOverridesRes.json()
          console.log(`[v0] Fetched ${venueOverrides.length} venue overrides:`, venueOverrides)
          if (venueOverrides.length > 0) {
            venueOverrideMap = new Map()
            venueOverrides.forEach(v => venueOverrideMap!.set(v.venue_id, v))
            console.log(`[v0] Venue override map created with ${venueOverrideMap.size} entries`)
          }
        } else {
          console.error(`[v0] Failed to fetch venue overrides: ${venueOverridesRes.status}`)
        }
      } catch (err) {
        console.error("[v0] Error fetching venue overrides:", err)
      }
    }
    
    let transformedEvents = events.map(e => transformEvent(e, venueOverrideMap))

    // Fetch custom events from Supabase and merge them
    if (supabaseUrl && supabaseKey) {
      try {
        // Build date filter for custom events
        let customEventsUrl = `${supabaseUrl}/rest/v1/wcr_event_calendar_custom_events?select=*`
        if (startDate) customEventsUrl += `&date=gte.${startDate}`
        if (endDate) customEventsUrl += `&date=lte.${endDate}`
        customEventsUrl += `&order=date.asc`
        
        const customEventsRes = await fetch(customEventsUrl, {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
          cache: "no-store",
        })
        
        if (customEventsRes.ok) {
          const customEvents: CustomEvent[] = await customEventsRes.json()
          if (customEvents.length > 0) {
            const transformedCustom = customEvents.map(e => transformCustomEvent(e, venueOverrideMap))
            transformedEvents = [...transformedEvents, ...transformedCustom]
            // Re-sort by date
            transformedEvents.sort((a, b) => a.date.localeCompare(b.date))
          }
        }
      } catch (err) {
        console.error("Error fetching custom events:", err)
      }
    }

    // Fetch admin overrides from Supabase using REST API
    try {
      if (supabaseUrl && supabaseKey) {
        const overridesRes = await fetch(
          `${supabaseUrl}/rest/v1/wcr_event_calendar_event_admin_overrides?featured=eq.true&select=edmtrain_event_id,featured,featured_style,featured_rank`,
          {
            headers: {
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
            },
            cache: "no-store",
          }
        )

        if (overridesRes.ok) {
          const overrides: AdminOverride[] = await overridesRes.json()

          if (overrides.length > 0) {
            const overrideMap = new Map<number, AdminOverride>()
            overrides.forEach((o) => overrideMap.set(o.edmtrain_event_id, o))

            transformedEvents = transformedEvents.map((event) => {
              const override = overrideMap.get(event.id)
              if (override) {
                return {
                  ...event,
                  featured: override.featured,
                  featuredStyle: override.featured_style,
                  featuredRank: override.featured_rank,
                }
              }
              return event
            })

            transformedEvents.sort((a, b) => {
              if (a.featured && !b.featured) return -1
              if (!a.featured && b.featured) return 1
              if (a.featured && b.featured) {
                return (a.featuredRank ?? 999) - (b.featuredRank ?? 999)
              }
              return 0
            })
          }
        }
      }
    } catch (err) {
      console.error("Error fetching admin overrides:", err)
    }

    return NextResponse.json({
      success: true,
      events: transformedEvents,
      total: transformedEvents.length,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("Events API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch events",
        events: [],
      },
      { status: 500 }
    )
  }
}
