import { createClient } from '@supabase/supabase-js'

let supabaseClient: ReturnType<typeof createClient> | null = null

/**
 * Get or create Supabase client for server-side use
 */
export function getSupabaseClient() {
  if (supabaseClient) {
    return supabaseClient
  }

  const config = useRuntimeConfig()

  const supabaseUrl = config.public.supabaseUrl
  const supabaseKey = config.supabaseServiceKey

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase configuration')
  }

  supabaseClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  return supabaseClient
}
