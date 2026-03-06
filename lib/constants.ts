export interface Event {
  title: string
  image: string
  slug: string
  date: string
  time: string
  location: string
}

export const upcomingEvents: Event[] = [
  {
    title: 'DevNest Hackathon 2026',
    image: '/images/event1.png',
    slug: 'devnest-hackathon-2026',
    date: '2026-04-18',
    time: '09:00',
    location: 'Bengaluru, India',
  },
  {
    title: 'Frontend Guild Meetup',
    image: '/images/event2.png',
    slug: 'frontend-guild-meetup',
    date: '2026-05-02',
    time: '18:30',
    location: 'San Francisco, CA',
  },
  {
    title: 'Cloud Native Dev Summit',
    image: '/images/event3.png',
    slug: 'cloud-native-dev-summit',
    date: '2026-06-10',
    time: '10:00',
    location: 'Berlin, Germany',
  },
]

