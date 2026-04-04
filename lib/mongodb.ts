import mongoose, { Mongoose } from 'mongoose'

/**
 * Shape of the cached Mongoose connection stored on the `global` object.
 * This prevents creating multiple connections in development when modules
 * are hot-reloaded by Next.js.
 */
interface MongooseCache {
  conn: Mongoose | null
  promise: Promise<Mongoose> | null
}

/**
 * Extend the Node.js global type to include our cached connection.
 * We use `var` on `global` to avoid conflicts with other type declarations.
 */
declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined
}

/**
 * Ensure we have a single shared cache instance across the app.
 * In production this will be created once; in development it persists across
 * hot reloads via the `global` object.
 */
const cached: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
}

if (!global.mongooseCache) {
  global.mongooseCache = cached
}

/**
 * Establishes (or reuses) a Mongoose connection to MongoDB.
 *
 * - Reuses an existing connection if one is already established.
 * - Caches the connection promise to avoid creating parallel connections.
 */
export async function connectToDatabase(): Promise<Mongoose> {
  // Read env at call-time (works better with serverless + avoids module-load crashes).
  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error(
      'Please define the MONGODB_URI environment variable inside .env.local or .env',
    )
  }

  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10_000,
      connectTimeoutMS: 10_000,
      socketTimeoutMS: 45_000,
    })
  }

  cached.conn = await cached.promise
  return cached.conn
}

/**
 * Default export for convenience when importing the connection helper.
 */
export default connectToDatabase

// Alias requested name (same cached behavior).
export const connectDB = connectToDatabase

