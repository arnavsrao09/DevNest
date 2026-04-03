import { NextRequest, NextResponse } from 'next/server'

/**
 * Protects event creation: set `EVENT_CREATE_SECRET` and send
 * `Authorization: Bearer <secret>` or `x-api-key: <secret>`.
 */
export function requireEventCreateAuth(req: NextRequest): NextResponse | null {
  const secret = process.env.EVENT_CREATE_SECRET
  if (!secret || secret.trim().length === 0) {
    console.error(
      'EVENT_CREATE_SECRET is not set; refusing POST /api/events',
    )
    return NextResponse.json(
      { message: 'Server configuration error' },
      { status: 503 },
    )
  }

  const auth = req.headers.get('authorization')
  const bearer =
    auth?.startsWith('Bearer ') ? auth.slice('Bearer '.length).trim() : null
  const apiKey = req.headers.get('x-api-key')
  const token = bearer ?? apiKey

  if (!token || token !== secret) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  return null
}
