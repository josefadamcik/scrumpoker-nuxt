import type { ResetRequest } from '~/types'

/**
 * POST /api/session/[id]/reset
 * Reset votes for a new round
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
  const body = await readBody<ResetRequest>(event)

  if (!body.participantId) {
    throw createError({
      statusCode: 400,
      message: 'Participant ID required'
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

  // Check if participant is the creator
  if (sessionData.creator_id !== body.participantId) {
    throw createError({
      statusCode: 403,
      message: 'Only the session creator can reset the round'
    })
  }

  // Clear all votes
  const updatedParticipants = { ...sessionData.participants }
  for (const participantId in updatedParticipants) {
    updatedParticipants[participantId] = {
      ...updatedParticipants[participantId],
      vote: null
    }
  }

  // Update session: clear votes, set revealed to false, increment round
  const { error: updateError } = await supabase
    .from('sessions')
    .update({
      participants: updatedParticipants as any,
      revealed: false,
      current_round: sessionData.current_round + 1
    })
    .eq('id', sessionId)

  if (updateError) {
    console.error('Failed to reset round:', updateError)
    throw createError({
      statusCode: 500,
      message: 'Failed to reset round'
    })
  }

  return { success: true }
})
