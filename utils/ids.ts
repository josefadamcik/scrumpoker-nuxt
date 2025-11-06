import { nanoid } from 'nanoid'

/**
 * Generate a unique session ID
 * 12 characters, URL-safe
 */
export function generateSessionId(): string {
  return nanoid(12)
}

/**
 * Generate a unique participant ID
 * 16 characters, URL-safe
 */
export function generateParticipantId(): string {
  return nanoid(16)
}

/**
 * Validate session ID format
 */
export function isValidSessionId(id: string): boolean {
  return /^[A-Za-z0-9_-]{12}$/.test(id)
}

/**
 * Validate participant ID format
 */
export function isValidParticipantId(id: string): boolean {
  return /^[A-Za-z0-9_-]{16}$/.test(id)
}
