import type { RealtimeChannel } from '@supabase/supabase-js'
import type { Session } from '~/types'

/**
 * Composable for real-time session updates
 */
export const useRealtime = (sessionId: string) => {
  const supabase = useSupabase()
  const session = ref<Session | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)

  let channel: RealtimeChannel | null = null

  // Fetch initial session data
  const fetchSession = async () => {
    try {
      loading.value = true
      const response = await $fetch<Session>(`/api/session/${sessionId}`)
      session.value = response
      error.value = null
    } catch (err: any) {
      console.error('Failed to fetch session:', err)
      error.value = err.message || 'Failed to fetch session'
    } finally {
      loading.value = false
    }
  }

  // Subscribe to real-time updates
  const subscribe = () => {
    if (!supabase) return

    channel = supabase
      .channel(`session:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'sessions',
          filter: `id=eq.${sessionId}`
        },
        (payload) => {
          console.log('Session updated:', payload)
          session.value = payload.new as Session
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status)
      })
  }

  // Unsubscribe from real-time updates
  const unsubscribe = () => {
    if (channel) {
      supabase?.removeChannel(channel)
      channel = null
    }
  }

  // Initialize
  onMounted(async () => {
    await fetchSession()
    subscribe()
  })

  // Cleanup
  onUnmounted(() => {
    unsubscribe()
  })

  return {
    session: readonly(session),
    loading: readonly(loading),
    error: readonly(error),
    refresh: fetchSession
  }
}
