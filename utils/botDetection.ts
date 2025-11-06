/**
 * Simple bot detection based on user-agent
 * Checks for common bot patterns in the user-agent string
 */

const BOT_PATTERNS = [
  /bot/i,
  /crawl/i,
  /spider/i,
  /slurp/i,
  /mediapartners/i,
  /headless/i,
  /phantom/i,
  /selenium/i,
  /webdriver/i,
  /scraper/i,
]

/**
 * Check if the request appears to be from a bot
 * @param userAgent - The user-agent string from the request
 * @returns true if likely a bot, false otherwise
 */
export function isBot(userAgent: string | undefined): boolean {
  if (!userAgent) {
    return true // No user agent = suspicious
  }

  return BOT_PATTERNS.some(pattern => pattern.test(userAgent))
}

/**
 * Extract user agent from request headers
 */
export function getUserAgent(headers: Headers): string | undefined {
  return headers.get('user-agent') || undefined
}
