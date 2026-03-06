import Link from 'next/link'
import Image from 'next/image'
import React from 'react'

interface Props {
  title: string
  image: string
  slug: string
  date: string
  time: string
  location: string
}
const EventCard = ({ title, image }: Props) => {
  return (
    <Link href={`/events`} id='event-card'>
        <Image src={image} alt={title} width={410} height={300} />

        <p className='title'>{title}</p>
    </Link>
  )
}

export default EventCard
