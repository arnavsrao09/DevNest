import type { Document, Types } from 'mongoose'

import { connectToDatabase } from '@/lib/mongodb'
import { Event } from '@/database/event.model'
import type { EventDocument } from '@/database/event.model'

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100
const QUERY_MAX_TIME_MS = 10_000

/** Matches URL slugs: lowercase segments separated by single hyphens. */
const SLUG_PARAM_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/u
const MAX_SLUG_LENGTH = 200

function isValidSlugParam(slug: string): boolean {
  const trimmed = slug.trim()
  if (trimmed.length === 0 || trimmed.length > MAX_SLUG_LENGTH) {
    return false
  }
  return SLUG_PARAM_REGEX.test(trimmed)
}

export type LeanEvent = Omit<EventDocument, keyof Document> & {
  _id: Types.ObjectId
}

export type PaginatedEvents = {
  events: LeanEvent[]
  page: number
  limit: number
  total: number
  totalPages: number
}

function clampPage(page: number): number {
  return Number.isFinite(page) && page >= 1 ? Math.floor(page) : DEFAULT_PAGE
}

function clampLimit(limit: number): number {
  if (!Number.isFinite(limit) || limit < 1) return DEFAULT_LIMIT
  return Math.min(Math.floor(limit), MAX_LIMIT)
}

export async function getEvents(options?: {
  page?: number
  limit?: number
}): Promise<PaginatedEvents> {
  await connectToDatabase()

  const page = clampPage(options?.page ?? DEFAULT_PAGE)
  const limit = clampLimit(options?.limit ?? DEFAULT_LIMIT)
  const skip = (page - 1) * limit

  const [events, total] = await Promise.all([
    Event.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .maxTimeMS(QUERY_MAX_TIME_MS)
      .lean<LeanEvent[]>()
      .exec(),
    Event.countDocuments().maxTimeMS(QUERY_MAX_TIME_MS).exec(),
  ])

  const totalPages = total === 0 ? 1 : Math.ceil(total / limit)

  return { events, page, limit, total, totalPages }
}

/**
 * Loads an event by URL slug. Returns `null` when the slug is malformed or not found.
 */
export async function getEventBySlug(slug: string): Promise<LeanEvent | null> {
  if (typeof slug !== 'string' || !isValidSlugParam(slug)) {
    return null
  }

  await connectToDatabase()

  const event = await Event.findOne({ slug: slug.trim() })
    .maxTimeMS(QUERY_MAX_TIME_MS)
    .lean<LeanEvent | null>()
    .exec()

  return event
}
