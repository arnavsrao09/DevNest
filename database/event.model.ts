import mongoose, { Document, Model, Schema, Types } from 'mongoose'

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

EventSchema.pre('validate', function preValidate() {
  // Ensure slug exists before required validation runs.
  // Generate it for new docs, and regenerate only when title changes.
  if (!this.slug || this.isModified('title')) {
    assertNonEmpty(this.title, 'title')
    const nextSlug = slugifyTitle(this.title)
    if (nextSlug.length === 0) throw new Error('slug is required')
    this.slug = nextSlug
  }
})

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

  // Normalize date/time to consistent formats before persisting.
  this.date = normalizeIsoDate(this.date)
  this.time = normalizeTime(this.time)
})

/** Stash event _id(s) on Query between pre/post middleware for booking cascade. */
const CASCADE_EVENT_IDS = Symbol('devnest.cascadeEventIds')
const CASCADE_SINGLE_EVENT_ID = Symbol('devnest.cascadeSingleEventId')

type QueryWithCascade = mongoose.Query<unknown, EventDocument> & {
  [CASCADE_EVENT_IDS]?: Types.ObjectId[]
  [CASCADE_SINGLE_EVENT_ID]?: Types.ObjectId
}

/**
 * Booking cascade runs after the Event is removed from the DB (post hooks).
 * If Booking.deleteMany fails afterward, orphaned bookings may remain until a cleanup job runs (eventual consistency).
 */
EventSchema.post('deleteOne', { document: true, query: false }, async function () {
  const { Booking } = await import('./booking.model')
  await Booking.deleteMany({ eventId: this._id })
})

EventSchema.pre('deleteOne', { document: false, query: true }, async function () {
  const docs = await this.model
    .find(this.getFilter())
    .select('_id')
    .limit(1)
    .lean()
  const q = this as QueryWithCascade
  q[CASCADE_EVENT_IDS] = docs.map((d) => d._id)
})

EventSchema.post('deleteOne', { document: false, query: true }, async function () {
  const q = this as QueryWithCascade
  const ids = q[CASCADE_EVENT_IDS]
  delete q[CASCADE_EVENT_IDS]
  if (ids?.length) {
    const { Booking } = await import('./booking.model')
    await Booking.deleteMany({ eventId: { $in: ids } })
  }
})

EventSchema.pre('findOneAndDelete', async function () {
  const doc = await this.model.findOne(this.getFilter()).select('_id').lean()
  const q = this as QueryWithCascade
  q[CASCADE_SINGLE_EVENT_ID] = doc?._id
})

EventSchema.post('findOneAndDelete', async function () {
  const q = this as QueryWithCascade
  const id = q[CASCADE_SINGLE_EVENT_ID]
  delete q[CASCADE_SINGLE_EVENT_ID]
  if (id) {
    const { Booking } = await import('./booking.model')
    await Booking.deleteMany({ eventId: id })
  }
})

export const Event: EventModel =
  (mongoose.models.Event as EventModel | undefined) ??
  mongoose.model<EventDocument, EventModel>('Event', EventSchema)

