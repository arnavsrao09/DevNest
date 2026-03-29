import Image from 'next/image';

const EventDetailsItem = ({icon,alt,label}:{icon: string, alt: string, label: string}) => {
  return (
    <div className='flex-row-gap-2'>
      <Image src={icon} alt={alt} width={17} height={17} />
      <p>{label}</p>
    </div>
  )
}

const EventAgenda = ({agendaItems}:{agendaItems: string[]}) => {
  return (
    <div className='agenda'>
      <h2>Agenda</h2>
      <ul>
        {agendaItems.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  )
}

const EventTags = ({tags}:{tags: string[]}) => {
  return (
    <div className='flex flex-row gap-1.5 flex-wrap'>
      {tags.map((tag) => (
        <div key={tag} className='pill'>{tag}</div>
        ))}
    </div>
  )
}
const EventDetailsPage = async({params} : { params: Promise<{slug: string}>}) => {
  const { slug } = await params;
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/events/${slug}`);
  const data = await response.json();
  const event = data.event;
  console.log(event);
  return (
    <section id="event">
      <div className="header">
        <h1>Event Description</h1>
        <p>{event.description}</p>
      </div>

      <div className="details">
        {/* Left Side Content*/}
        <div className='content'>
          <Image src={event.image} alt={event.title} width={700} height={7 00} className='banner' />

          <div className='flex-col-gap-2'>
            <h2>Overview</h2>
            <p>{event.overview}</p>
          </div>

          <section className='flex-col-gap-2'>
            <h2>Event Details</h2>
            <EventDetailsItem icon="/icons/calendar.svg" alt="date" label={event.date} />
            <EventDetailsItem icon="/icons/clock.svg" alt="time" label={event.time} />
            <EventDetailsItem icon="/icons/pin.svg" alt="location" label={event.location} />
            <EventDetailsItem icon="/icons/audience.svg" alt="audience" label={event.audience} />
            <EventDetailsItem icon="/icons/mode.svg" alt="mode" label={event.mode} />
            <EventDetailsItem icon="/icons/audience.svg" alt="organizer" label={event.organizer} />
          </section>

          <EventAgenda agendaItems={JSON.parse(event.agenda)} />

          <section className='flex-col-gap-2'>
            <h2>About the Organizer</h2>
            <p>{event.organizer}</p>
          </section>

          <EventTags tags={JSON.parse(event.tags)} />
        </div>
        
        {/* Right Side Content*/}
        <aside className='booking'>
          <p className='text-lg font-semibold'>Book Event</p>
        </aside>
      </div>
    </section>
  )
}

export default EventDetailsPage
