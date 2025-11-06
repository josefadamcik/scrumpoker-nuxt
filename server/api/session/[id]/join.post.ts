import { generateParticipantId } from '~/utils/ids'
import { generateNickname, sanitizeNickname, validateNickname } from '~/utils/nicknames'
import { isBot, getUserAgent } from '~/utils/botDetection'
import type { JoinSessionRequest, JoinSessionResponse, Participant, Session } from '~/types'

/**
 * POST /api/session/[id]/join
 * Join an existing planning poker session
 */
export default defineEventHandler(async (event): Promise<JoinSessionResponse> => {
  // Bot detection
  const userAgent = getUserAgent(event.headers)
  if (isBot(userAgent)) {
    throw createError({
      statusCode: 403,
      message: 'Bot access not allowed'
    })
  }

  // Get session ID from route params
  const sessionId = getRouterParam(event, 'id')
  if (!sessionId) {
    throw createError({
      statusCode: 400,
      message: 'Session ID required'
    })
  }

  // Parse request body
  const body = await readBody<JoinSessionRequest>(event)

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

  // Get Supabase client
  const supabase = getSupabaseClient()

  // Fetch existing session
  const { data: session, error: fetchError } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .single()

  if (fetchError || !session) {
    throw createError({
      statusCode: 404,
      message: 'Session not found'
    })
  }

  const sessionData = session as any

  // Check if session has expired
  if (new Date(sessionData.expires_at) < new Date()) {
    throw createError({
      statusCode: 410,
      message: 'Session has expired'
    })
  }

  // Generate participant ID
  const participantId = generateParticipantId()

  // Create participant object
  const participant: Participant = {
    id: participantId,
    nickname,
    vote: null,
    joinedAt: new Date().toISOString(),
    isCreator: false
  }

  // Add participant to session
  const updatedParticipants = {
    ...sessionData.participants,
    [participantId]: participant
  }

  // Update session in database
  const { data: updatedSession, error: updateError } = await supabase
    .from('sessions')
    .update({ participants: updatedParticipants as any })
    .eq('id', sessionId)
    .select()
    .single()

  if (updateError || !updatedSession) {
    console.error('Failed to join session:', updateError)
    throw createError({
      statusCode: 500,
      message: 'Failed to join session'
    })
  }

  // Return response
  return {
    participantId,
    nickname,
    session: updatedSession as Session
  }
})
