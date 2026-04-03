import { randomUUID } from 'crypto'

import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

import { requireEventCreateAuth } from '@/lib/auth/require-event-create'
import { connectToDatabase } from '@/lib/mongodb'
import { Event } from '@/database/event.model'

const MAX_LIMIT = 100
const DEFAULT_LIMIT = 20

function parsePositiveInt(value: string | null, fallback: number): number {
  if (value === null) return fallback
  const n = Number.parseInt(value, 10)
  if (!Number.isFinite(n) || n < 1) return fallback
  return n
}

function parseJsonArrayOfStrings(raw: string): string[] | null {
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) {
      return null
    }
    if (!parsed.every((item) => typeof item === 'string' && item.trim().length > 0)) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export async function POST(req: NextRequest) {
  const unauthorized = requireEventCreateAuth(req)
  if (unauthorized) return unauthorized

  try {
    await connectToDatabase()

    let formData: FormData
    try {
      formData = await req.formData()
    } catch (error) {
      console.error('Malformed multipart request body:', error)
      return NextResponse.json({ message: 'Malformed request' }, { status: 400 })
    }

    let raw: Record<string, unknown>
    try {
      raw = Object.fromEntries(formData.entries()) as Record<string, unknown>
    } catch (error) {
      console.error('Error parsing form data:', error)
      return NextResponse.json({ message: 'Invalid form data' }, { status: 400 })
    }

    const title = typeof raw.title === 'string' ? raw.title.trim() : ''
    const description =
      typeof raw.description === 'string' ? raw.description.trim() : ''
    const overview = typeof raw.overview === 'string' ? raw.overview.trim() : ''
    const venue = typeof raw.venue === 'string' ? raw.venue.trim() : ''
    const location = typeof raw.location === 'string' ? raw.location.trim() : ''
    const date = typeof raw.date === 'string' ? raw.date.trim() : ''
    const time = typeof raw.time === 'string' ? raw.time.trim() : ''
    const mode = typeof raw.mode === 'string' ? raw.mode.trim() : ''
    const audience = typeof raw.audience === 'string' ? raw.audience.trim() : ''
    const organizer =
      typeof raw.organizer === 'string' ? raw.organizer.trim() : ''

    if (!title || !description || !overview || !venue || !location) {
      return NextResponse.json(
        { message: 'title, description, overview, venue, and location are required' },
        { status: 400 },
      )
    }
    if (!date || !time || !mode || !audience || !organizer) {
      return NextResponse.json(
        { message: 'date, time, mode, audience, and organizer are required' },
        { status: 400 },
      )
    }

    const dateValue = new Date(date)
    if (Number.isNaN(dateValue.getTime())) {
      return NextResponse.json(
        { message: 'date must be a valid date' },
        { status: 400 },
      )
    }

    const agendaRaw = raw.agenda
    const tagsRaw = raw.tags
    let agenda: string[] | null = null
    let tags: string[] | null = null

    if (typeof agendaRaw === 'string') {
      agenda = parseJsonArrayOfStrings(agendaRaw)
    } else if (Array.isArray(agendaRaw)) {
      agenda =
        agendaRaw.every((item) => typeof item === 'string' && item.trim().length > 0)
          ? (agendaRaw as string[])
          : null
    }

    if (typeof tagsRaw === 'string') {
      tags = parseJsonArrayOfStrings(tagsRaw)
    } else if (Array.isArray(tagsRaw)) {
      tags =
        tagsRaw.every((item) => typeof item === 'string' && item.trim().length > 0)
          ? (tagsRaw as string[])
          : null
    }

    if (!agenda || !tags) {
      return NextResponse.json(
        { message: 'agenda and tags must be non-empty JSON arrays of non-empty strings' },
        { status: 400 },
      )
    }

    const file = formData.get('image')

    if (!(file instanceof File)) {
      return NextResponse.json({ message: 'Image file is required' }, { status: 400 })
    }
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { message: 'Only image uploads are supported' },
        { status: 400 },
      )
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ message: 'Image must be 5MB or smaller' }, { status: 413 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const uploadResult = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: 'image',
            folder: 'DevNest',
          },
          (error, result) => {
            if (error) reject(error)
            else if (!result?.secure_url || !result?.public_id) {
              reject(new Error('Upload result missing required fields'))
            } else {
              resolve({
                secure_url: result.secure_url,
                public_id: result.public_id,
              })
            }
          },
        ).end(buffer)
      },
    )

    const eventPayload = {
      title,
      description,
      overview,
      venue,
      location,
      date,
      time,
      mode,
      audience,
      organizer,
      agenda,
      tags,
      image: uploadResult.secure_url,
    }

    const publicId = uploadResult.public_id

    let createdEvent
    try {
      createdEvent = await Event.create(eventPayload)
    } catch (error) {
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId, { resource_type: 'image' })
        } catch (cleanupError) {
          console.error('Error cleaning up uploaded image:', cleanupError)
        }
      }
      throw error
    }

    return NextResponse.json(
      { message: 'Event created successfully', event: createdEvent },
      { status: 201 },
    )
  } catch (error) {
    const errorId = randomUUID()
    const err = error instanceof Error ? error : new Error(String(error))
    console.error(
      '[POST /api/events]',
      errorId,
      err.message,
      err.stack ?? '(no stack)',
    )
    return NextResponse.json(
      { message: 'Internal server error', errorId },
      { status: 500 },
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase()

    const { searchParams } = new URL(req.url)
    const page = parsePositiveInt(searchParams.get('page'), 1)
    const limit = Math.min(
      MAX_LIMIT,
      parsePositiveInt(searchParams.get('limit'), DEFAULT_LIMIT),
    )
    const skip = (page - 1) * limit

    const [events, total] = await Promise.all([
      Event.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .maxTimeMS(10_000)
        .lean()
        .exec(),
      Event.countDocuments().maxTimeMS(10_000).exec(),
    ])

    const totalPages = total === 0 ? 1 : Math.ceil(total / limit)

    return NextResponse.json(
      {
        message: 'Events fetched successfully',
        events,
        page,
        limit,
        total,
        totalPages,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
