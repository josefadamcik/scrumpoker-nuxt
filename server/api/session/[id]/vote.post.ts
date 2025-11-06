import { isValidCard } from '~/utils/validation'
import type { VoteRequest, Session } from '~/types'

/**
 * POST /api/session/[id]/vote
 * Submit a vote for the current round
 */
export default defineEventHandler(async (event) => {
  // Get session ID from route params
  const sessionId = getRouterParam(event, 'id')
  if (!sessionId) {
    throw createError({
      statusCode: 400,
      message: 'Session ID required'
    })
  }

  // Parse request body
  const body = await readBody<VoteRequest>(event)

  if (!body.participantId) {
    throw createError({
      statusCode: 400,
      message: 'Participant ID required'
    })
  }

  if (!isValidCard(body.vote)) {
    throw createError({
      statusCode: 400,
      message: 'Invalid vote'
    })
  }

  // Get Supabase client
  const supabase = getSupabaseClient()

  // Fetch session
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

  // Check if participant exists
  if (!sessionData.participants[body.participantId]) {
    throw createError({
      statusCode: 403,
      message: 'Participant not found in session'
    })
  }

  // Check if votes are already revealed
  if (sessionData.revealed) {
    throw createError({
      statusCode: 400,
      message: 'Cannot vote after reveal'
    })
  }

  // Update participant's vote
  const updatedParticipants = {
    ...sessionData.participants,
    [body.participantId]: {
      ...sessionData.participants[body.participantId],
      vote: body.vote
    }
  }

  // Update session in database
  const { error: updateError } = await supabase
    .from('sessions')
    .update({ participants: updatedParticipants as any })
    .eq('id', sessionId)

  if (updateError) {
    console.error('Failed to submit vote:', updateError)
    throw createError({
      statusCode: 500,
      message: 'Failed to submit vote'
    })
  }

  return { success: true }
})
