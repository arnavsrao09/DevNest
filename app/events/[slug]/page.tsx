import React from 'react'

const EventDetailsPage = async({params} : { params: Promise<{slug: string}>}) => {
  const { slug } = await params;
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/events/${slug}`);
  const data = await response.json();
  const event = data.event;
  console.log(event);
  return (
    <div>
      
    </div>
  )
}

export default EventDetailsPage
