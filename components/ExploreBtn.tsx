'use client'

import React from 'react'
import Image from 'next/image'

const ExploreBtn = () => {
  const scrollToEvents = () => {
    const el = document.getElementById('events')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    } else {
      window.location.hash = 'events'
    }
  }

  return (
    <button
      type="button"
      id="explore-btn"
      className="mt-7 mx-auto flex flex-col items-center gap-1"
      aria-label="Explore events — scroll to the events section"
      onClick={scrollToEvents}
    >
      Explore Events
      <Image
        src="/icons/arrow-down.svg"
        alt=""
        width={20}
        height={20}
        aria-hidden
      />
    </button>
  )
}

export default ExploreBtn
