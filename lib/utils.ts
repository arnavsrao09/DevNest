import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Parses JSON safely; if `json` is already a non-string value (e.g. an array from the DB), returns it when compatible. */
export function parseJsonSafe<T>(json: unknown, fallback: T): T {
  if (json === null || json === undefined) return fallback
  if (typeof json !== "string") {
    if (Array.isArray(json)) return json as T
    return fallback
  }
  try {
    return JSON.parse(json) as T
  } catch {
    return fallback
  }
}

/** Parses agenda/tags from DB JSON strings or arrays; returns only string[] or fallback. */
export function parseStringArrayField(value: unknown, fallback: string[]): string[] {
  const parsed = parseJsonSafe<unknown>(value, fallback)
  if (Array.isArray(parsed) && parsed.every((item) => typeof item === "string")) {
    return parsed
  }
  return fallback
}
