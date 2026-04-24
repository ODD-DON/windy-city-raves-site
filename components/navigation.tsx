"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu, X, Search, User, ShoppingCart } from "lucide-react"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Event Calendar" },
  { href: "/promote", label: "Promote" },
  { href: "/apply", label: "Apply" },
]

export function Navigation() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Don't show nav on admin pages (they have their own nav)
  if (pathname?.startsWith("/admin")) {
    return null
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="relative w-[120px] h-[40px]">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/New%20Logo-tGlIj5rYBWQGemKw5Ce0TbbPJg5oJJ.png"
                alt="Windy City Raves"
                fill
                className="object-contain"
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || 
                (link.href !== "/" && pathname?.startsWith(link.href))
              
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-4 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "text-gray-900 underline underline-offset-4"
                      : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
            {/* More dropdown placeholder */}
            <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1">
              More
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Right side icons */}
          <div className="flex items-center gap-3">
            <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors" aria-label="Search">
              <Search className="w-5 h-5" />
            </button>
            <Link href="/admin" className="p-2 text-gray-600 hover:text-gray-900 transition-colors" aria-label="Account">
              <User className="w-5 h-5" />
            </Link>
            <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors" aria-label="Cart">
              <ShoppingCart className="w-5 h-5" />
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || 
                  (link.href !== "/" && pathname?.startsWith(link.href))
                
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "px-4 py-3 text-sm font-medium transition-colors",
                      isActive
                        ? "text-gray-900 bg-gray-50"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    )}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
