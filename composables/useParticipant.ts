import { STORAGE_KEYS, type StoredParticipantInfo } from '~/types'

/**
 * Composable for managing participant info in localStorage
 */
export const useParticipant = () => {
  // Get participant info from localStorage
  const getParticipantInfo = (sessionId: string): StoredParticipantInfo | null => {
    if (typeof window === 'undefined') return null

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PARTICIPANT_INFO)
      if (!stored) return null

      const info: StoredParticipantInfo = JSON.parse(stored)

      // Check if it's for the current session
      if (info.sessionId !== sessionId) {
        return null
      }

      return info
    } catch (error) {
      console.error('Failed to parse participant info:', error)
      return null
    }
  }

  // Save participant info to localStorage
  const saveParticipantInfo = (info: StoredParticipantInfo) => {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(STORAGE_KEYS.PARTICIPANT_INFO, JSON.stringify(info))
    } catch (error) {
      console.error('Failed to save participant info:', error)
    }
  }

  // Clear participant info from localStorage
  const clearParticipantInfo = () => {
    if (typeof window === 'undefined') return

    try {
      localStorage.removeItem(STORAGE_KEYS.PARTICIPANT_INFO)
    } catch (error) {
      console.error('Failed to clear participant info:', error)
    }
  }

  return {
    getParticipantInfo,
    saveParticipantInfo,
    clearParticipantInfo
  }
}
