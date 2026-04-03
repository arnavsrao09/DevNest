import Link from 'next/link'

import EventCard from '@/components/EventCard'
import { getEvents, type LeanEvent } from '@/lib/actions/event.actions'

export const dynamic = 'force-dynamic'

export default async function EventsPage() {
  const { events, page, totalPages } = await getEvents({ page: 1, limit: 24 })

  return (
    <section className="space-y-6">
      <h1>Events</h1>
      <ul className="flex list-none flex-wrap gap-x-6 gap-y-6">
        {events.length > 0 ? (
          events.map((event: LeanEvent) => (
            <li key={String(event._id)}>
              <EventCard {...event} />
            </li>
          ))
        ) : (
          <li>No events yet.</li>
        )}
      </ul>
      {totalPages > 1 && (
        <p className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </p>
      )}
      <p>
        <Link href="/events/create">Create an event</Link>
      </p>
    </section>
  )
}
