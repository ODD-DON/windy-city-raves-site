"use client"

import Image from "next/image"
import Link from "next/link"
import { Instagram, Music } from "lucide-react"

export function Footer() {
  return (
    <footer className="py-12 border-t border-purple-900/30 overflow-x-clip w-full max-w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <a href="https://windycityraves.com/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4">
            <div className="relative w-24 h-8">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/New%20Logo-tGlIj5rYBWQGemKw5Ce0TbbPJg5oJJ.png"
                alt="Windy City Raves"
                fill
                className="opacity-80 object-contain hover:opacity-100 transition-opacity"
              />
            </div>
          </a>

          {/* Links */}
          <nav className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="/" className="hover:text-foreground transition-colors">
              Home
            </a>
            <a href="/events" className="hover:text-foreground transition-colors">
              Events
            </a>
            <a href="/promote" className="hover:text-foreground transition-colors">
              Promote
            </a>
            <a href="/apply" className="hover:text-foreground transition-colors">
              Apply
            </a>
          </nav>

          {/* Social */}
          <div className="flex items-center gap-3">
            <a
              href="https://instagram.com/windycityraves"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <Link
              href="/admin"
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground/50 hover:text-muted-foreground transition-colors"
              aria-label="Music"
            >
              <Music className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            &copy; 2026 Windy City Raves. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground/60 mt-2">
            Chicago EDM Discovery Platform
          </p>
        </div>
      </div>
    </footer>
  )
}
