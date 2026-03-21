import React from 'react'
import ExploreBtn from '@/components/ExploreBtn'
import EventCard from '@/components/EventCard'
import { EventDocument } from '@/database/event.model'
// import { upcomingEvents } from '@/lib/constants'
const page = async () => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/events`);
  const data = await response.json();
  const events = data.events;
  console.log(events);
  return (
    <section>
      <h1 className='text-center'>The Hub for Every Dev <br /> Event You Can't Miss</h1>
      <p className='text-center mt-5'>Hackathons, Meetups, and Conferences, All In One Place</p>
      
      <ExploreBtn />
      {/* Featured Events section */}
      <div className='mt-7 space-y-7'>
        <h3>Featured Events</h3>
        <ul className='flex list-none gap-x-6'>
          {events && events.length > 0 && events.map((event: EventDocument) => (
            <li key={event.title}>
              <EventCard {...event} />
            </li>
          ))}
        </ul>
      </div>

    </section>
  )
}

export default page
 