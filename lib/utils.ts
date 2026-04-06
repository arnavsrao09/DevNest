import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Parses JSON safely. When `validate` is provided, only values that pass the guard are returned.
 * Without `validate`, non-string arrays and parsed JSON are returned with legacy `as T` behavior.
 */
export function parseJsonSafe<T>(
  json: unknown,
  fallback: T,
  validate?: (v: unknown) => v is T,
): T {
  if (json === null || json === undefined) return fallback

  if (typeof json !== "string") {
    if (validate) {
      return validate(json) ? json : fallback
    }
    if (Array.isArray(json)) return json as T
    return fallback
  }

  try {
    const parsed: unknown = JSON.parse(json)
    if (validate) {
      return validate(parsed) ? parsed : fallback
    }
    return parsed as T
  } catch {
    return fallback
  }
}

/** One display line from API/dashboard objects or plain strings. */
function coerceListItemToString(item: unknown): string | null {
  if (item === null || item === undefined) return null
  if (typeof item === "string") {
    const t = item.trim()
    return t.length > 0 ? t : null
  }
  if (typeof item === "number" || typeof item === "boolean") {
    return String(item)
  }
  if (typeof item === "object" && !Array.isArray(item)) {
    const o = item as Record<string, unknown>
    const str = (k: string) =>
      typeof o[k] === "string" ? (o[k] as string).trim() : ""
    const title =
      str("title") ||
      str("label") ||
      str("name") ||
      str("text") ||
      str("description") ||
      str("item") ||
      str("topic")
    const time = str("time") || str("start") || str("slot")
    if (title && time) return `${time} — ${title}`
    if (title) return title
    return null
  }
  return null
}

function normalizeListFromArray(parts: unknown[]): string[] {
  const out: string[] = []
  for (const item of parts) {
    if (Array.isArray(item)) {
      out.push(...normalizeListFromArray(item))
      continue
    }
    if (typeof item === "string") {
      const expanded = tryExpandJsonArrayString(item)
      if (expanded.length > 0) {
        out.push(...expanded)
        continue
      }
    }
    const line = coerceListItemToString(item)
    if (line) out.push(line)
  }
  return out
}

/** If `raw` is a JSON array (of strings or agenda-like objects), return mapped lines. */
function tryExpandJsonArrayString(raw: string): string[] {
  const t = raw.trim()
  if (!t.startsWith("[")) return []
  try {
    const parsed: unknown = JSON.parse(t)
    if (!Array.isArray(parsed)) return []
    return normalizeListFromArray(parsed)
  } catch {
    return []
  }
}

/**
 * Normalizes agenda/tags from Mongo (string[], objects, JSON strings, or delimited text).
 */
export function parseStringArrayField(
  value: unknown,
  fallback: string[],
): string[] {
  if (value === null || value === undefined) return fallback

  if (Array.isArray(value)) {
    const out = normalizeListFromArray(value)
    return out.length > 0 ? out : fallback
  }

  if (typeof value === "string") {
    const trimmed = value.trim()
    if (!trimmed) return fallback

    try {
      const parsed: unknown = JSON.parse(trimmed)
      if (Array.isArray(parsed)) {
        const out = normalizeListFromArray(parsed)
        return out.length > 0 ? out : fallback
      }
      const single = coerceListItemToString(parsed)
      if (single) return [single]
      return fallback
    } catch {
      // not JSON — try nested array shape or delimited text
    }

    const fromBracket = tryExpandJsonArrayString(trimmed)
    if (fromBracket.length > 0) return fromBracket

    const split = trimmed
      .split(/\r?\n|,\s*/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
    return split.length > 0 ? split : fallback
  }

  return fallback
}
