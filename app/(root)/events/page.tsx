import Link from 'next/link'

import EventCard from '@/components/EventCard'
import { getEvents, type LeanEvent } from '@/lib/actions/event.actions'

function parsePageParam(raw: string | undefined, fallback: number): number {
  if (raw === undefined) return fallback
  const n = Number.parseInt(raw, 10)
  if (!Number.isFinite(n) || n < 1) return fallback
  return n
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const resolved = await searchParams
  const requestedPage = parsePageParam(resolved.page, 1)
  const { events, page, totalPages } = await getEvents({
    page: requestedPage,
    limit: 24,
  })

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
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span>
            Page {page} of {totalPages}
          </span>
          <nav className="flex gap-3" aria-label="Events pagination">
            {page > 1 ? (
              <Link href={`/events?page=${page - 1}`}>Previous</Link>
            ) : null}
            {page < totalPages ? (
              <Link href={`/events?page=${page + 1}`}>Next</Link>
            ) : null}
          </nav>
        </div>
      )}
      <p>
        <Link href="/events/create">Create an event</Link>
      </p>
    </section>
  )
}
