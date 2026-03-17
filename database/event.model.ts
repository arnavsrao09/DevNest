import mongoose, { Document, Model, Schema } from 'mongoose'

export type EventMode = 'online' | 'offline' | 'hybrid' | (string & {})

export interface EventDocument extends Document {
  title: string
  slug: string
  description: string
  overview: string
  image: string
  venue: string
  location: string
  date: string
  time: string
  mode: EventMode
  audience: string
  agenda: string[]
  organizer: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export type EventModel = Model<EventDocument>

function assertNonEmpty(value: unknown, field: string): asserts value is string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${field} is required`)
  }
}

function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function normalizeIsoDate(input: string): string {
  // Store as ISO date (YYYY-MM-DD) for consistency across locales/timezones.
  const d = new Date(input)
  if (Number.isNaN(d.getTime())) throw new Error('date must be a valid date')
  return d.toISOString().slice(0, 10)
}

function normalizeTime(input: string): string {
  // Normalize to 24h "HH:mm" to keep comparisons/sorting consistent.
  const raw = input.trim().toLowerCase()
  const ampmMatch = raw.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/)
  if (ampmMatch) {
    let hours = Number(ampmMatch[1])
    const minutes = Number(ampmMatch[2] ?? '00')
    const meridiem = ampmMatch[3]
    if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) {
      throw new Error('time must be a valid time')
    }
    if (meridiem === 'pm' && hours !== 12) hours += 12
    if (meridiem === 'am' && hours === 12) hours = 0
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
  }

  const hhmmMatch = raw.match(/^(\d{1,2}):(\d{2})$/)
  if (!hhmmMatch) throw new Error('time must be in HH:mm format')
  const hours = Number(hhmmMatch[1])
  const minutes = Number(hhmmMatch[2])
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    throw new Error('time must be a valid time')
  }
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

const EventSchema = new Schema<EventDocument>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, unique: true },
    description: { type: String, required: true, trim: true },
    overview: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    venue: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    date: { type: String, required: true, trim: true },
    time: { type: String, required: true, trim: true },
    mode: { type: String, required: true, trim: true },
    audience: { type: String, required: true, trim: true },
    agenda: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length > 0 && v.every((s) => s.trim().length > 0),
        message: 'agenda must be a non-empty array of non-empty strings',
      },
    },
    organizer: { type: String, required: true, trim: true },
    tags: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => Array.isArray(v) && v.length > 0 && v.every((s) => s.trim().length > 0),
        message: 'tags must be a non-empty array of non-empty strings',
      },
    },
  },
  { timestamps: true, strict: true },
)

// Unique index for fast slug lookups and to enforce uniqueness at DB level.
EventSchema.index({ slug: 1 }, { unique: true })

EventSchema.pre('save', async function preSave() {
  // Validate required string fields are present and not just whitespace.
  assertNonEmpty(this.title, 'title')
  assertNonEmpty(this.description, 'description')
  assertNonEmpty(this.overview, 'overview')
  assertNonEmpty(this.image, 'image')
  assertNonEmpty(this.venue, 'venue')
  assertNonEmpty(this.location, 'location')
  assertNonEmpty(this.date, 'date')
  assertNonEmpty(this.time, 'time')
  assertNonEmpty(this.mode, 'mode')
  assertNonEmpty(this.audience, 'audience')
  assertNonEmpty(this.organizer, 'organizer')

  // Only regenerate slug when the title changes.
  if (this.isModified('title')) {
    this.slug = slugifyTitle(this.title)
  }

  // Normalize date/time to consistent formats before persisting.
  this.date = normalizeIsoDate(this.date)
  this.time = normalizeTime(this.time)
})

export const Event: EventModel =
  (mongoose.models.Event as EventModel | undefined) ??
  mongoose.model<EventDocument, EventModel>('Event', EventSchema)

