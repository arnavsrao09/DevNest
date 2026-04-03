import posthog from 'posthog-js'

const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
const host = process.env.NEXT_PUBLIC_POSTHOG_HOST

if (!key || key.trim().length === 0) {
  console.warn(
    '[posthog] NEXT_PUBLIC_POSTHOG_KEY is missing; analytics disabled',
  )
} else if (!host || host.trim().length === 0) {
  console.warn(
    '[posthog] NEXT_PUBLIC_POSTHOG_HOST is missing; analytics disabled',
  )
} else {
  posthog.init(key, {
    api_host: host,
    defaults: '2026-01-30',
  })
}
