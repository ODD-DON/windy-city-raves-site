"use client"

import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import {
  Calendar,
  Users,
  LogOut,
  Home,
  Star,
  MapPin,
  Plus,
} from "lucide-react"
import { supabaseClient } from "@/lib/supabase/client"

const adminNavItems = [
  {
    label: "Featured Events",
    href: "/admin",
    icon: Star,
    description: "Manage featured events",
  },
  {
    label: "Applicants",
    href: "/admin/applicants",
    icon: Users,
    description: "Review talent applications",
  },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  
  // Don't show admin nav on login page
  const isLoginPage = pathname === "/admin/login"
  
  const handleLogout = async () => {
    await supabaseClient.auth.signOut()
    try {
      sessionStorage.removeItem("wcr_admin_token")
      sessionStorage.removeItem("wcr_admin_user")
    } catch {}
    router.push("/")
    router.refresh()
  }

  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Admin Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-purple-900/30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Left: Back to site + Title */}
            <div className="flex items-center gap-4">
              <Link 
                href="/"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Home className="w-4 h-4" />
                <span className="text-sm font-medium hidden sm:inline">Back to Site</span>
              </Link>
              <div className="h-4 w-px bg-purple-900/30" />
              <h1 className="text-sm font-bold text-purple-400">WCR Admin</h1>
            </div>
            
            {/* Center: Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1">
              {adminNavItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || 
                  (item.href !== "/admin" && pathname.startsWith(item.href))
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                      isActive 
                        ? "bg-purple-500/20 text-purple-300" 
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
            
            {/* Right: Logout */}
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-purple-900/20 px-4 py-2">
          <nav className="flex items-center gap-2 overflow-x-auto">
            {adminNavItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || 
                (item.href !== "/admin" && pathname.startsWith(item.href))
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all",
                    isActive 
                      ? "bg-purple-500/20 text-purple-300" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-8">
        {children}
      </main>
    </div>
  )
}
