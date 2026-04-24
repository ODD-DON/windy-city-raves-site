"use client"

/**
 * AppShell - Consistent layout wrapper for iframe compatibility
 * 
 * This component ensures all pages have consistent scroll behavior
 * when embedded in iframes (like Shopify). Key principles:
 * - No nested scroll containers
 * - No fixed heights (h-screen, min-h-screen)
 * - Single scroll context at the page level
 * - Flexible layout that grows naturally
 */

interface AppShellProps {
  children: React.ReactNode
  className?: string
}

export function AppShell({ children, className = "" }: AppShellProps) {
  return (
    <div className={`flex flex-col w-full ${className}`}>
      {children}
    </div>
  )
}
