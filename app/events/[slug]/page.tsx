import Image from 'next/image';

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
        <p className='mt-2'>{event.description}</p>
      </div>
      <div className="details">
        {/* Left Side Content*/}

        {/* Right Side Content*/}
        <aside className='booking'>

        </aside>
      </div>
    </section>
  )
}

export default EventDetailsPage
