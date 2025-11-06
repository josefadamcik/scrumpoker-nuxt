import type { Session } from '~/types'

/**
 * GET /api/session/[id]
 * Get session details
 */
export default defineEventHandler(async (event): Promise<Session> => {
  // Get session ID from route params
  const sessionId = getRouterParam(event, 'id')
  if (!sessionId) {
    throw createError({
      statusCode: 400,
      message: 'Session ID required'
    })
  }

  // Get Supabase client
  const supabase = getSupabaseClient()

  // Fetch session
  const { data: session, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .single()

  if (error || !session) {
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

  return sessionData as Session
})
