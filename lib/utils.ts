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

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((item) => typeof item === "string")
}

/** Parses agenda/tags from DB JSON strings or arrays; returns only string[] or fallback. */
export function parseStringArrayField(
  value: unknown,
  fallback: string[],
): string[] {
  return parseJsonSafe(value, fallback, isStringArray)
}
