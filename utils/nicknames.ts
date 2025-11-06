// Random nickname generator for participants
// Format: AdjectiveNoun (e.g., "SwiftPanda", "BraveOwl")

const ADJECTIVES = [
  'Swift', 'Brave', 'Clever', 'Gentle', 'Happy',
  'Mighty', 'Noble', 'Quick', 'Silent', 'Wise',
  'Bold', 'Calm', 'Eager', 'Fierce', 'Jolly',
  'Kind', 'Lively', 'Proud', 'Sharp', 'Witty',
  'Agile', 'Bright', 'Daring', 'Epic', 'Focused',
  'Graceful', 'Honest', 'Keen', 'Lucky', 'Nimble'
]

const NOUNS = [
  'Panda', 'Owl', 'Fox', 'Wolf', 'Bear',
  'Eagle', 'Tiger', 'Lion', 'Hawk', 'Shark',
  'Dragon', 'Phoenix', 'Falcon', 'Raven', 'Cobra',
  'Leopard', 'Panther', 'Jaguar', 'Lynx', 'Otter',
  'Badger', 'Raccoon', 'Beaver', 'Bison', 'Moose',
  'Dolphin', 'Whale', 'Octopus', 'Mantis', 'Spider'
]

/**
 * Generate a random nickname in the format "AdjectiveNoun"
 */
export function generateNickname(): string {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)]
  return `${adjective}${noun}`
}

/**
 * Validate nickname
 * @param nickname - The nickname to validate
 * @returns true if valid, false otherwise
 */
export function validateNickname(nickname: string): boolean {
  return nickname.length > 0 && nickname.length <= 30
}

/**
 * Sanitize nickname by trimming and limiting length
 */
export function sanitizeNickname(nickname: string): string {
  return nickname.trim().slice(0, 30)
}
