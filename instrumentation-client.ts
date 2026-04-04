import posthog from 'posthog-js'

const trimmedKey = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim() ?? ''
const trimmedHost = process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim() ?? ''

if (!trimmedKey) {
  console.warn(
    '[posthog] NEXT_PUBLIC_POSTHOG_KEY is missing; analytics disabled',
  )
} else if (!trimmedHost) {
  console.warn(
    '[posthog] NEXT_PUBLIC_POSTHOG_HOST is missing; analytics disabled',
  )
} else {
  posthog.init(trimmedKey, {
    api_host: trimmedHost,
    defaults: '2026-01-30',
  })
}
