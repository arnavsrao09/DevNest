import { NextRequest, NextResponse } from "next/server";
import type { Document } from "mongoose";
import { Types } from "mongoose";

import { connectToDatabase } from "@/lib/mongodb";
import { Event } from "@/database/event.model";
import type { EventDocument } from "@/database/event.model";

/**
 * Max length for URL slug segment (defensive limit for path params).
 */
const MAX_SLUG_LENGTH = 200;

/**
 * Matches slugs produced by `slugifyTitle` in the Event model:
 * lowercase alphanumeric segments separated by single hyphens.
 */
const SLUG_FORMAT =
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/u;

/**
 * Lean document shape returned from `.lean()` (plain object, no Document methods).
 */
type LeanEvent = Omit<EventDocument, keyof Document> & {
  _id: Types.ObjectId;
  __v?: number;
};

type SlugValidationResult =
  | { ok: true; slug: string }
  | { ok: false; status: number; message: string };

/**
 * Validates the dynamic `slug` path segment: non-empty, length cap, safe format.
 */
function validateSlugParam(raw: string | undefined): SlugValidationResult {
  if (raw === undefined) {
    return {
      ok: false,
      status: 400,
      message: "Slug is required",
    };
  }

  const trimmed = raw.trim();

  if (trimmed.length === 0) {
    return {
      ok: false,
      status: 400,
      message: "Slug cannot be empty",
    };
  }

  if (trimmed.length > MAX_SLUG_LENGTH) {
    return {
      ok: false,
      status: 400,
      message: "Slug is too long",
    };
  }

  if (!SLUG_FORMAT.test(trimmed)) {
    return {
      ok: false,
      status: 400,
      message: "Invalid slug format",
    };
  }

  return { ok: true, slug: trimmed };
}

/**
 * GET /api/events/[slug]
 * Returns a single event by unique slug.
 */
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  let rawSlug: string | undefined;

  try {
    const resolved = await context.params;
    rawSlug = resolved.slug;
  } catch (error) {
    console.error("Failed to resolve route params:", error);
    return NextResponse.json(
      { message: "Invalid request" },
      { status: 400 },
    );
  }

  const validation = validateSlugParam(rawSlug);
  if (!validation.ok) {
    return NextResponse.json(
      { message: validation.message },
      { status: validation.status },
    );
  }

  const { slug } = validation;

  try {
    await connectToDatabase();

    const event = await Event.findOne({ slug })
      .lean<LeanEvent>()
      .exec();

    if (!event) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        message: "Event fetched successfully",
        event,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching event by slug:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
