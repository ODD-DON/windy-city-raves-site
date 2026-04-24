import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Chicago EDM Events Calendar | Raves Tonight & This Weekend | Windy City Raves',
  description: 'Find EDM events, raves, and electronic music shows in Chicago. Browse tonight\'s events, this weekend\'s shows, house music, techno, bass, and more. Updated daily.',
  keywords: [
    'Chicago EDM events', 'Chicago raves tonight', 'Chicago electronic music',
    'Chicago house music events', 'Chicago techno events', 'Chicago bass music',
    'Chicago nightlife tonight', 'Chicago DJ events', 'Chicago club events',
    'raves near me', 'EDM tonight Chicago', 'Chicago music events this weekend',
    'Sound-Bar events', 'Prysm events', 'Radius Chicago events', 'Smartbar events',
    'Chicago rave calendar', 'Chicago electronic music calendar'
  ],
  openGraph: {
    title: 'Chicago EDM Events Calendar | Windy City Raves',
    description: 'Find raves, electronic music shows, and nightlife events in Chicago tonight and this weekend.',
    type: 'website',
  },
  alternates: {
    canonical: 'https://windycityraves.com/events',
  },
}

// JSON-LD for events page
const eventsJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Chicago EDM Events',
  description: 'Electronic dance music events in Chicago',
  itemListElement: [],
  numberOfItems: 0,
}

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventsJsonLd) }}
      />
      {children}
    </>
  )
}
