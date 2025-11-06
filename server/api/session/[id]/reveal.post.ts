import type { RevealRequest, VoteRecord, Card } from '~/types'

/**
 * POST /api/session/[id]/reveal
 * Reveal all votes for the current round
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
  const body = await readBody<RevealRequest>(event)

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
      message: 'Only the session creator can reveal votes'
    })
  }

  // Check if already revealed
  if (sessionData.revealed) {
    throw createError({
      statusCode: 400,
      message: 'Votes already revealed'
    })
  }

  // Collect all votes
  const votes: Record<string, Card> = {}
  for (const [participantId, participant] of Object.entries(sessionData.participants)) {
    const p = participant as any
    if (p.vote) {
      votes[participantId] = p.vote
    }
  }

  // Create vote record for history
  const voteRecord: VoteRecord = {
    round: sessionData.current_round,
    timestamp: new Date().toISOString(),
    votes,
    revealed: true
  }

  // Update session: set revealed to true and add to vote history
  const { error: updateError } = await supabase
    .from('sessions')
    .update({
      revealed: true,
      vote_history: [...sessionData.vote_history, voteRecord] as any
    })
    .eq('id', sessionId)

  if (updateError) {
    console.error('Failed to reveal votes:', updateError)
    throw createError({
      statusCode: 500,
      message: 'Failed to reveal votes'
    })
  }

  return { success: true }
})
