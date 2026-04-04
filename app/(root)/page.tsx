import React from 'react'

import ExploreBtn from '@/components/ExploreBtn'
import EventCard from '@/components/EventCard'
import { getEvents, type LeanEvent } from '@/lib/actions/event.actions'

export const dynamic = 'force-dynamic'

async function HomePage() {
  const { events } = await getEvents({ page: 1, limit: 50 })

  return (
    <section>
      <h1 className="text-center">
        The Hub for Every Dev <br /> Event You Can&apos;t Miss
      </h1>
      <p className="text-center mt-5">
        Hackathons, Meetups, and Conferences, All In One Place
      </p>

      <ExploreBtn />
      {/* Featured Events section */}
      <div id="events" className="mt-7 space-y-7">
        <h3>Featured Events</h3>
        <ul className="flex list-none gap-x-6">
          {events &&
            events.length > 0 &&
            events.map((event: LeanEvent) => (
              <li key={String(event._id)}>
                <EventCard {...event} />
              </li>
            ))}
        </ul>
      </div>
    </section>
  )
}

export default HomePage
