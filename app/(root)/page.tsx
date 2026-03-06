import React from 'react'
import ExploreBtn from '@/components/ExploreBtn'
import EventCard from '@/components/EventCard'
import { upcomingEvents } from '@/lib/constants'
const page = () => {

  return (
    <section>
      <h1 className='text-center'>The Hub for Every Dev <br /> Event You Can't Miss</h1>
      <p className='text-center mt-5'>Hackathons, Meetups, and Conferences, All In One Place</p>
      
      <ExploreBtn />
      {/* Featured Events section */}
      <div className='mt-7 space-y-7'>
        <h3>Featured Events</h3>
        <ul>
          {upcomingEvents.map((event) => (
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
 