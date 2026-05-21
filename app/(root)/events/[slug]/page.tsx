import Image from 'next/image'
import { notFound } from 'next/navigation'

import getSimilarEventsBySlug, { getEventBySlug } from '@/lib/actions/event.actions'
import { parseStringArrayField } from '@/lib/utils'
import BookEvent from '@/components/BookEvent'
import EventCard from '@/components/EventCard'

const EventDetailsItem = ({
  icon,
  alt,
  label,
}: {
  icon: string
  alt: string
  label: string
}) => {
  return (
    <div className="flex flex-row gap-2">
      <Image src={icon} alt={alt} width={17} height={17} />
      <p>{label}</p>
    </div>
  )
}

const EventAgenda = ({ agendaItems }: { agendaItems: string[] }) => {
  if (agendaItems.length === 0) return null
  return (
    <div className="agenda">
      <h2>Agenda</h2>
      <ul>
        {agendaItems.map((item, index) => (
          <li key={`${index}-${item.slice(0, 48)}`}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

const EventTags = ({ tags }: { tags: string[] }) => {
  if (tags.length === 0) return null
  return (
    <section className="flex flex-col gap-2">
      <h2>Tags</h2>
      <div className="event-tags-pills" role="list">
        {tags.map((tag, index) => (
          <span key={`${index}-${tag.slice(0, 48)}`} className="event-tag-pill" role="listitem">
            {tag}
          </span>
        ))}
      </div>
    </section>
  )
}

const EventDetailsPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>
}) => {
  const { slug } = await params
  const event = await getEventBySlug(slug)

  if (!event) {
    notFound()
  }

  const agendaItems = parseStringArrayField(event.agenda, [])
  const tags = parseStringArrayField(event.tags, [])

  const bookings = 10

  const similarEvents = await getSimilarEventsBySlug(slug)
  console.log("similarEvents", similarEvents)

  return (
    <section id="event">
      <div className="header">
        <h1>Event Description</h1>
        <p>{event.description}</p>
      </div>

      <div className="details">
        {/* Left Side Content*/}
        <div className="content">
          <Image
            src={event.image}
            alt={event.title}
            width={700}
            height={700}
            className="banner"
          />

          <div className="flex flex-col gap-2">
            <h2>Overview</h2>
            <p>{event.overview}</p>
          </div>

          <section className="flex flex-col gap-2">
            <h2>Event Details</h2>
            <EventDetailsItem
              icon="/icons/calendar.svg"
              alt="date"
              label={event.date}
            />
            <EventDetailsItem
              icon="/icons/clock.svg"
              alt="time"
              label={event.time}
            />
            <EventDetailsItem
              icon="/icons/pin.svg"
              alt="location"
              label={event.location}
            />
            <EventDetailsItem
              icon="/icons/audience.svg"
              alt="audience"
              label={event.audience}
            />
            <EventDetailsItem
              icon="/icons/mode.svg"
              alt="mode"
              label={event.mode}
            />
            <EventDetailsItem
              icon="/icons/audience.svg"
              alt="organizer"
              label={event.organizer}
            />
          </section>

          <EventAgenda agendaItems={agendaItems} />

          <section className="flex flex-col gap-2">
            <h2>About the Organizer</h2>
            <p>{event.organizer}</p>
          </section>

          <EventTags tags={tags} />
        </div>

        {/* Right Side Content*/}
        <aside className="booking">
          <div className="signup-card">
            <h2>Book Your Spot</h2>
            {bookings > 0 ?
            (
            <p className="text-sm">Join {bookings} people who have already booked their spot!</p>
            )
            :
            (<p className="text-sm">Be the first to book your spot!</p>)
          }
          <BookEvent/>
          </div>
        </aside>
      </div>
      <div className="flex w-full flex-col gap-4 pt-20">
        <h2>Similar Events</h2>
        <div className="events">
          {
            similarEvents.length > 0 ? (
              similarEvents.map((event) => (
                <EventCard key={String(event._id)} {...event} />
              ))
            ) : (
              <p>No similar events found</p>
            )
          }
        </div>
      </div>
    </section>
  )
}

export default EventDetailsPage
