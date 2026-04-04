import Image from 'next/image'
import { notFound } from 'next/navigation'

import { getEventBySlug } from '@/lib/actions/event.actions'
import { parseStringArrayField } from '@/lib/utils'

export const dynamic = 'force-dynamic'

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
  return (
    <div className="agenda">
      <h2>Agenda</h2>
      <ul>
        {agendaItems.map((item, index) => (
          <li key={`${item}-${index}`}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

const EventTags = ({ tags }: { tags: string[] }) => {
  return (
    <div className="flex flex-row gap-1.5 flex-wrap">
      {tags.map((tag, index) => (
        <div key={`${tag}-${index}`} className="pill">
          {tag}
        </div>
      ))}
    </div>
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
          <p className="text-lg font-semibold">Book Event</p>
        </aside>
      </div>
    </section>
  )
}

export default EventDetailsPage
