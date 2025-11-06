import { generateSessionId, generateParticipantId } from '~/utils/ids'
import { generateNickname, sanitizeNickname, validateNickname } from '~/utils/nicknames'
import { isBot, getUserAgent } from '~/utils/botDetection'
import { SESSION_TTL } from '~/types'
import type { CreateSessionRequest, CreateSessionResponse, Participant } from '~/types'

/**
 * POST /api/session
 * Create a new planning poker session
 */
export default defineEventHandler(async (event): Promise<CreateSessionResponse> => {
  // Bot detection
  const userAgent = getUserAgent(event.headers)
  if (isBot(userAgent)) {
    throw createError({
      statusCode: 403,
      message: 'Bot access not allowed'
    })
  }

  // Parse request body
  const body = await readBody<CreateSessionRequest>(event)

  // Generate or validate nickname
  let nickname: string
  if (body.nickname) {
    const sanitized = sanitizeNickname(body.nickname)
    if (!validateNickname(sanitized)) {
      throw createError({
        statusCode: 400,
        message: 'Invalid nickname'
      })
    }
    nickname = sanitized
  } else {
    nickname = generateNickname()
  }

  // Generate IDs
  const sessionId = generateSessionId()
  const participantId = generateParticipantId()

  // Create participant object
  const participant: Participant = {
    id: participantId,
    nickname,
    vote: null,
    joinedAt: new Date().toISOString(),
    isCreator: true
  }

  // Calculate expiration time
  const expiresAt = new Date(Date.now() + SESSION_TTL).toISOString()

  // Get Supabase client
  const supabase = getSupabaseClient()

  // Create session in database
  const { error } = await supabase
    .from('sessions')
    .insert({
      id: sessionId,
      expires_at: expiresAt,
      creator_id: participantId,
      participants: {
        [participantId]: participant
      } as any,
      revealed: false,
      vote_history: [] as any,
      current_round: 1
    })

  if (error) {
    console.error('Failed to create session:', error)
    throw createError({
      statusCode: 500,
      message: 'Failed to create session'
    })
  }

  // Return response
  return {
    sessionId,
    participantId,
    nickname
  }
})
