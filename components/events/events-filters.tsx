"use client"

import { Search, X, CalendarDays, List, LayoutGrid, MapPin, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export type ViewMode = "calendar" | "grid" | "list"
export type TimeFilter = "all" | "today" | "tomorrow" | "weekend" | "week" | "month"

interface EventsFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  timeFilter: TimeFilter
  onTimeFilterChange: (value: TimeFilter) => void
  venueFilter: string
  onVenueFilterChange: (value: string) => void
  venues: string[]
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  dateRange: { from?: Date; to?: Date }
  onDateRangeChange: (range: { from?: Date; to?: Date }) => void
  activeFiltersCount: number
  onClearFilters: () => void
  citySelector?: React.ReactNode
}

export function EventsFilters({
  search,
  onSearchChange,
  timeFilter,
  onTimeFilterChange,
  venueFilter,
  onVenueFilterChange,
  venues,
  viewMode,
  onViewModeChange,
  dateRange,
  onDateRangeChange,
  activeFiltersCount,
  onClearFilters,
  citySelector,
}: EventsFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search DJs, venues, events..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-12 h-12 sm:h-14 text-base bg-card border-2 border-border focus:border-primary/50 rounded-xl shadow-sm"
        />
        {search && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* City selector - directly under search */}
      {citySelector}

      {/* View mode toggle */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center p-1.5 bg-muted rounded-xl border border-border flex-1 sm:flex-initial">
          <button
            onClick={() => onViewModeChange("calendar")}
            className={cn(
              "flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all",
              viewMode === "calendar" 
                ? "bg-background text-foreground shadow-md" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <CalendarDays className="w-4 h-4" />
            <span className="hidden sm:inline">Calendar</span>
          </button>
          <button
            onClick={() => onViewModeChange("grid")}
            className={cn(
              "flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all",
              viewMode === "grid" 
                ? "bg-background text-foreground shadow-md" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline">Grid</span>
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            className={cn(
              "flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all",
              viewMode === "list" 
                ? "bg-background text-foreground shadow-md" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">List</span>
          </button>
        </div>
      </div>

      {/* Time filters - full width, exciting buttons */}
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 sm:gap-3">
        {[
          { value: "all", label: "All", icon: null },
          { value: "today", label: "Today", icon: null },
          { value: "tomorrow", label: "Tomorrow", icon: null },
          { value: "weekend", label: "Weekend", icon: null },
          { value: "week", label: "Week", icon: null },
          { value: "month", label: "Month", icon: null },
        ].map((filter) => (
          <button
            key={filter.value}
            onClick={() => onTimeFilterChange(filter.value as TimeFilter)}
            className={cn(
              "py-3.5 sm:py-4 rounded-2xl text-sm sm:text-base font-bold transition-all border-2",
              timeFilter === filter.value 
                ? "bg-primary text-primary-foreground border-primary shadow-xl shadow-primary/30 scale-[1.02]" 
                : "bg-card text-foreground border-border hover:border-primary/40 hover:shadow-md hover:scale-[1.01] active:scale-[0.98]"
            )}
          >
            {filter.label}
          </button>
        ))}
        
        {/* Date picker as part of the grid */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              className={cn(
                "col-span-2 sm:col-span-1 py-3.5 sm:py-4 rounded-2xl text-sm sm:text-base font-bold transition-all border-2 flex items-center justify-center gap-2",
                dateRange.from 
                  ? "bg-secondary text-secondary-foreground border-secondary shadow-xl shadow-secondary/30 scale-[1.02]" 
                  : "bg-card text-foreground border-border hover:border-secondary/40 hover:shadow-md hover:scale-[1.01] active:scale-[0.98]"
              )}
            >
              <CalendarDays className="w-5 h-5" />
              <span>
                {dateRange.from ? (
                  dateRange.to ? (
                    <>{format(dateRange.from, "M/d")} - {format(dateRange.to, "M/d")}</>
                  ) : (
                    format(dateRange.from, "M/d")
                  )
                ) : (
                  "Pick Dates"
                )}
              </span>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="range"
              selected={{ from: dateRange.from, to: dateRange.to }}
              onSelect={(range) => onDateRangeChange({ from: range?.from, to: range?.to })}
              numberOfMonths={1}
              disabled={{ before: new Date() }}
            />
            {dateRange.from && (
              <div className="p-3 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => onDateRangeChange({})}
                >
                  Clear dates
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>

      {/* Secondary filters row */}
      <div className="flex items-center gap-3">
        {/* Venue filter */}
        <Select value={venueFilter} onValueChange={onVenueFilterChange}>
          <SelectTrigger className="w-full sm:w-[220px] h-11 rounded-xl border-2 font-medium">
            <SelectValue placeholder="All Venues" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Venues</SelectItem>
            {venues.map((venue) => (
              <SelectItem key={venue} value={venue}>
                {venue}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear filters */}
        {activeFiltersCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="gap-2 h-11 px-4 rounded-xl border-2 font-semibold text-muted-foreground hover:text-foreground hover:border-destructive/50"
          >
            <X className="w-4 h-4" />
            Clear ({activeFiltersCount})
          </Button>
        )}
      </div>
    </div>
  )
}
