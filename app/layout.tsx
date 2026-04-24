import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Navigation } from '@/components/navigation'
import './globals.css'

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter'
});

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  variable: '--font-space'
});

export const viewport: Viewport = {
  themeColor: '#E63946',
  width: 'device-width',
  initialScale: 1,
}

// Comprehensive SEO metadata for Chicago EDM events
export const metadata: Metadata = {
  title: 'Chicago EDM Events Calendar 2026 | Windy City Raves - Concerts, Festivals & Club Nights',
  description: 'Find every Chicago EDM event, rave, electronic music concert, house music show, techno party, and festival happening in Chicago. Live calendar with Radius, Concord Music Hall, Prysm, Salt Shed events. Your ultimate guide to Chicago nightlife and electronic dance music.',
  
  // Comprehensive keywords for search engines
  keywords: [
    'Chicago EDM events',
    'Chicago raves',
    'Chicago electronic music',
    'Chicago EDM concerts',
    'Chicago house music',
    'Chicago techno events',
    'Chicago DJ events',
    'Chicago dance music',
    'Chicago club events',
    'Chicago nightlife',
    'Chicago music festivals',
    'EDM Chicago 2026',
    'Chicago EDM calendar',
    'Chicago rave calendar',
    'Chicago electronic concerts',
    'Radius Chicago events',
    'Concord Music Hall Chicago',
    'Prysm Chicago',
    'Salt Shed Chicago',
    'Aragon Ballroom Chicago',
    'Chicago bass music',
    'Chicago dubstep',
    'Chicago trance',
    'Chicago drum and bass',
    'Windy City raves',
    'Chicago EDM scene',
    'Chicago underground music',
    'Illinois EDM events',
    'Chicago area concerts',
    'Chicago electronic festivals',
    'Chicago music shows tonight',
    'Chicago events this weekend',
    'best Chicago clubs',
    'Chicago DJ shows',
    'live electronic music Chicago',
  ],
  
  // Open Graph for social sharing
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://windycityraves.com',
    siteName: 'Windy City Raves',
    title: 'Chicago EDM Events Calendar | Every Rave, Concert & Festival in Chicago',
    description: 'The complete guide to Chicago electronic music. Find EDM events, raves, house music shows, techno parties, and festivals at Radius, Concord, Prysm, Salt Shed and more. Updated daily with live event data.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Chicago EDM Events Calendar - Windy City Raves',
      },
    ],
  },
  
  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'Chicago EDM Events Calendar 2026 | Windy City Raves',
    description: 'Find every EDM event, rave, house music show, and electronic concert in Chicago. Live calendar updated daily.',
    images: ['/og-image.png'],
    creator: '@windycityraves',
  },
  
  // Additional SEO settings
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Verification for search consoles
  verification: {
    google: 'your-google-verification-code',
  },
  
  // Alternates for canonical URL
  alternates: {
    canonical: 'https://windycityraves.com',
  },
  
  // Category
  category: 'entertainment',
  
  // Authors
  authors: [{ name: 'Windy City Raves' }],
  
  // Creator
  creator: 'Windy City Raves',
  
  // Publisher
  publisher: 'Windy City Raves',
  
  generator: 'v0.app',
  
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

// JSON-LD Structured Data for rich search results
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Windy City Raves',
  alternateName: ['Chicago EDM Events', 'Chicago Rave Calendar', 'Chicago Electronic Music'],
  url: 'https://windycityraves.com',
  description: 'The complete guide to Chicago EDM events, raves, electronic music concerts, and festivals',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://windycityraves.com/?search={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
  publisher: {
    '@type': 'Organization',
    name: 'Windy City Raves',
    logo: {
      '@type': 'ImageObject',
      url: 'https://windycityraves.com/logo.png',
    },
  },
  about: {
    '@type': 'Thing',
    name: 'Electronic Dance Music Events in Chicago',
    description: 'EDM concerts, raves, house music shows, techno parties, and electronic music festivals in Chicago, Illinois',
  },
  audience: {
    '@type': 'Audience',
    audienceType: 'Electronic music fans in Chicago',
    geographicArea: {
      '@type': 'City',
      name: 'Chicago',
      containedInPlace: {
        '@type': 'State',
        name: 'Illinois',
      },
    },
  },
}

// Local Business JSON-LD for local SEO
const localBusinessJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'EntertainmentBusiness',
  name: 'Windy City Raves - Chicago EDM Events',
  description: 'Your complete guide to electronic music events, raves, and festivals in Chicago',
  url: 'https://windycityraves.com',
  areaServed: {
    '@type': 'City',
    name: 'Chicago',
    containedInPlace: {
      '@type': 'State',
      name: 'Illinois',
      containedInPlace: {
        '@type': 'Country',
        name: 'United States',
      },
    },
  },
  serviceType: 'Event Calendar and Listings',
  priceRange: 'Free',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark w-full max-w-full bg-background" data-scroll-behavior="smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased w-full max-w-full bg-background text-foreground`}>
        <Navigation />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
