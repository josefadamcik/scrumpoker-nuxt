import { CARDS, type Card } from '~/types'

/**
 * Validate if a value is a valid card
 */
export function isValidCard(value: unknown): value is Card {
  return typeof value === 'string' && CARDS.includes(value as Card)
}

/**
 * Calculate statistics from revealed votes
 */
export function calculateStatistics(votes: Record<string, Card>) {
  const numericVotes = Object.values(votes)
    .filter(vote => vote !== '?' && vote !== '☕')
    .map(vote => parseInt(vote))
    .filter(v => !isNaN(v))

  if (numericVotes.length === 0) {
    return {
      average: null,
      min: null,
      max: null,
      consensus: false,
      distribution: getDistribution(votes)
    }
  }

  const sum = numericVotes.reduce((a, b) => a + b, 0)
  const average = sum / numericVotes.length
  const min = Math.min(...numericVotes).toString() as Card
  const max = Math.max(...numericVotes).toString() as Card
  const consensus = new Set(numericVotes).size === 1

  return {
    average: Math.round(average * 10) / 10,
    min,
    max,
    consensus,
    distribution: getDistribution(votes)
  }
}

/**
 * Get vote distribution count
 */
function getDistribution(votes: Record<string, Card>): Record<Card, number> {
  const distribution = {} as Record<Card, number>

  for (const vote of Object.values(votes)) {
    distribution[vote] = (distribution[vote] || 0) + 1
  }

  return distribution
}
