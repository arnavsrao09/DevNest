import mongoose, { Document, Model, Schema, Types } from 'mongoose'
import { Event } from './event.model'

export interface BookingDocument extends Document {
  eventId: Types.ObjectId
  email: string
  createdAt: Date
  updatedAt: Date
}

export type BookingModel = Model<BookingDocument>

const EMAIL_REGEX =
  // Reasonable email validation for app-level checks (DB still stores as string).
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const BookingSchema = new Schema<BookingDocument>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (v: string) => EMAIL_REGEX.test(v),
        message: 'email must be a valid email address',
      },
    },
  },
  { timestamps: true, strict: true },
)

BookingSchema.pre('save', async function preSave() {
  // Ensure the referenced event exists to avoid dangling bookings.
  const exists = await Event.exists({ _id: this.eventId })
  if (!exists) {
    throw new Error('eventId must reference an existing event')
  }
})

export const Booking: BookingModel =
  (mongoose.models.Booking as BookingModel | undefined) ??
  mongoose.model<BookingDocument, BookingModel>('Booking', BookingSchema)

