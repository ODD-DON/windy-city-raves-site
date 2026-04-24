"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu, X, Shield } from "lucide-react"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
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
    <nav className="sticky top-0 z-50 w-full border-b border-purple-900/30 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="relative w-8 h-8">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/New%20Logo-tGlIj5rYBWQGemKw5Ce0TbbPJg5oJJ.png"
                alt="Windy City Raves"
                fill
                className="object-contain"
              />
            </div>
            <span className="font-bold text-white text-lg hidden sm:block">
              Windy City Raves
            </span>
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
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-purple-600/20 text-purple-400"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>

          {/* Admin Link & Mobile Toggle */}
          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-400 transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              Admin
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors"
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
          <div className="md:hidden py-4 border-t border-purple-900/30">
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
                      "px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-purple-600/20 text-purple-400"
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                    )}
                  >
                    {link.label}
                  </Link>
                )
              })}
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-3 text-sm text-zinc-500 hover:text-zinc-400 transition-colors"
              >
                <Shield className="w-4 h-4" />
                Admin
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
