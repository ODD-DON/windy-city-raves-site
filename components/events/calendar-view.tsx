"use client"

import { useState, useMemo, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { TransformedEvent } from "@/app/api/events/route"

// Generate a consistent color based on venue name
function getVenueColor(venueName: string): string {
  const colors = [
    "bg-rose-500",
    "bg-cyan-500",
    "bg-violet-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-fuchsia-500",
  ]
  
  let hash = 0
  for (let i = 0; i < venueName.length; i++) {
    hash = venueName.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  return colors[Math.abs(hash) % colors.length]
}

interface CalendarViewProps {
  events: TransformedEvent[]
  onSelectEvent: (event: TransformedEvent) => void
  onSelectDate: (date: Date) => void
}

export function CalendarView({ events, onSelectEvent, onSelectDate }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile on client
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, TransformedEvent[]> = {}
    events.forEach((event) => {
      const dateKey = event.date
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(event)
    })
    return grouped
  }, [events])

  // Get week days for mobile view
  const weekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate)
    const day = startOfWeek.getDay()
    startOfWeek.setDate(startOfWeek.getDate() - day)
    
    const days = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      const dateKey = date.toISOString().split("T")[0]
      days.push({
        date,
        day: date.getDate(),
        dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
        events: eventsByDate[dateKey] || [],
      })
    }
    return days
  }, [currentDate, eventsByDate])

  // Get month days for desktop view
  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDayOfMonth = new Date(year, month, 1).getDay()
    
    const result = []
    
    // Previous month padding
    const prevMonth = month === 0 ? 11 : month - 1
    const prevYear = month === 0 ? year - 1 : year
    const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate()
    
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i
      result.push({
        day,
        date: new Date(prevYear, prevMonth, day),
        isCurrentMonth: false,
        events: [],
      })
    }

    // Current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dateKey = date.toISOString().split("T")[0]
      result.push({
        day,
        date,
        isCurrentMonth: true,
        events: eventsByDate[dateKey] || [],
      })
    }

    // Next month padding
    const remainingDays = 42 - result.length
    for (let day = 1; day <= remainingDays; day++) {
      const nextMonth = month === 11 ? 0 : month + 1
      const nextYear = month === 11 ? year + 1 : year
      result.push({
        day,
        date: new Date(nextYear, nextMonth, day),
        isCurrentMonth: false,
        events: [],
      })
    }

    return result
  }, [currentDate, eventsByDate])

  const goToPrevious = () => {
    if (isMobile) {
      // Go to previous week
      const newDate = new Date(currentDate)
      newDate.setDate(newDate.getDate() - 7)
      setCurrentDate(newDate)
    } else {
      // Go to previous month
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
    }
  }

  const goToNext = () => {
    if (isMobile) {
      // Go to next week
      const newDate = new Date(currentDate)
      newDate.setDate(newDate.getDate() + 7)
      setCurrentDate(newDate)
    } else {
      // Go to next month
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    }
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const isToday = (date: Date) => {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    return d.getTime() === today.getTime()
  }

  // Format header based on view
  const headerText = isMobile
    ? `${weekDays[0].date.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${weekDays[6].date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
    : currentDate.toLocaleString("default", { month: "long", year: "numeric" })

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Calendar header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border">
        <div className="flex items-center gap-1 sm:gap-2">
          <Button variant="outline" size="icon" onClick={goToPrevious} className="h-8 w-8 sm:h-9 sm:w-9">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={goToNext} className="h-8 w-8 sm:h-9 sm:w-9">
            <ChevronRight className="w-4 h-4" />
          </Button>
          <h2 className="text-sm sm:text-lg font-semibold ml-1 sm:ml-2">{headerText}</h2>
        </div>
        <Button variant="outline" size="sm" onClick={goToToday} className="h-8 text-xs sm:text-sm">
          Today
        </Button>
      </div>

      {/* Mobile: Week View */}
      <div className="sm:hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-border bg-muted/50">
          {weekDays.map((dayInfo, idx) => (
            <div
              key={idx}
              className={cn(
                "py-2 text-center",
                isToday(dayInfo.date) && "bg-primary/10"
              )}
            >
              <div className="text-[10px] font-medium text-muted-foreground uppercase">
                {dayInfo.dayName}
              </div>
              <div className={cn(
                "text-sm font-semibold mt-0.5",
                isToday(dayInfo.date) ? "text-primary" : "text-foreground"
              )}>
                {dayInfo.day}
              </div>
            </div>
          ))}
        </div>

        {/* Events list for the week */}
        <div className="divide-y divide-border">
          {weekDays.map((dayInfo, dayIdx) => {
            if (dayInfo.events.length === 0) return null
            return (
              <div key={dayIdx} className="p-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className={cn(
                    "text-xs font-semibold px-2 py-0.5 rounded",
                    isToday(dayInfo.date) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}>
                    {dayInfo.date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                  </span>
                  <Badge variant="secondary" className="text-[10px]">
                    {dayInfo.events.length} event{dayInfo.events.length > 1 ? "s" : ""}
                  </Badge>
                </div>
                <div className="space-y-2">
                  {dayInfo.events.map((event) => {
                    const venueColor = getVenueColor(event.venue.name)
                    return (
                      <button
                        key={event.id}
                        onClick={() => onSelectEvent(event)}
                        className="w-full text-left flex items-center gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <span className={cn("w-2 h-2 rounded-full flex-shrink-0", venueColor)} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {event.headliner}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {event.venue.name}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
          {weekDays.every(d => d.events.length === 0) && (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No events this week
            </div>
          )}
        </div>
      </div>

      {/* Desktop: Month View */}
      <div className="hidden sm:block">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-border bg-muted/50">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="py-2 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {monthDays.map((dayInfo, index) => {
            const hasEvents = dayInfo.events.length > 0
            const isPast = dayInfo.date < today && !isToday(dayInfo.date)

            return (
              <div
                key={index}
                className={cn(
                  "min-h-[120px] p-1.5 border-b border-r border-border last:border-r-0 [&:nth-child(7n)]:border-r-0 transition-colors",
                  !dayInfo.isCurrentMonth && "bg-muted/30",
                  hasEvents && dayInfo.isCurrentMonth && "hover:bg-muted/50 cursor-pointer",
                  isToday(dayInfo.date) && "bg-primary/5"
                )}
                onClick={() => {
                  if (hasEvents) {
                    onSelectDate(dayInfo.date)
                  }
                }}
              >
                <div className="flex items-start justify-between mb-1">
                  <span
                    className={cn(
                      "inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-medium",
                      !dayInfo.isCurrentMonth && "text-muted-foreground/50",
                      isPast && dayInfo.isCurrentMonth && "text-muted-foreground",
                      isToday(dayInfo.date) && "bg-primary text-primary-foreground"
                    )}
                  >
                    {dayInfo.day}
                  </span>
                  {hasEvents && (
                    <Badge 
                      variant="secondary" 
                      className="text-[10px] px-1.5 h-5 bg-primary/10 text-primary"
                    >
                      {dayInfo.events.length}
                    </Badge>
                  )}
                </div>

                {/* Events preview */}
                <div className="space-y-0.5">
                  {dayInfo.events.slice(0, 3).map((event) => {
                    const venueColor = getVenueColor(event.venue.name)
                    return (
                      <button
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          onSelectEvent(event)
                        }}
                        className="w-full text-left flex items-center gap-1 px-1 py-0.5 rounded hover:bg-muted/50 transition-colors group"
                      >
                        <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", venueColor)} />
                        <span className="text-xs truncate text-foreground group-hover:text-primary transition-colors">
                          {event.headliner}
                        </span>
                      </button>
                    )
                  })}
                  {dayInfo.events.length > 3 && (
                    <span className="text-[10px] text-muted-foreground px-1.5 font-medium">
                      +{dayInfo.events.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend - desktop only */}
      <div className="hidden sm:flex items-center justify-center gap-6 p-3 border-t border-border bg-muted/30">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span>Today</span>
        </div>
      </div>
    </div>
  )
}
