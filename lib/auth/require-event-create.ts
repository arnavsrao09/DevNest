import { timingSafeEqual } from 'crypto'

import { NextRequest, NextResponse } from 'next/server'

/**
 * Protects event creation: set `EVENT_CREATE_SECRET` and send
 * `Authorization: Bearer <secret>` or `x-api-key: <secret>`.
 */
export function requireEventCreateAuth(req: NextRequest): NextResponse | null {
  const secretRaw = process.env.EVENT_CREATE_SECRET
  const secret = secretRaw?.trim() ?? ''
  if (!secret) {
    console.error(
      'EVENT_CREATE_SECRET is not set; refusing POST /api/events',
    )
    return NextResponse.json(
      { message: 'Server configuration error' },
      { status: 503 },
    )
  }

  const authHeader = req.headers.get('authorization')?.trim() ?? null
  const bearer =
    authHeader?.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length).trim()
      : null
  const apiKey = req.headers.get('x-api-key')?.trim() ?? null
  const token = bearer ?? apiKey

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const bufToken = Buffer.from(token, 'utf8')
  const bufSecret = Buffer.from(secret, 'utf8')
  if (bufToken.length !== bufSecret.length) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  if (!timingSafeEqual(bufToken, bufSecret)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  return null
}
