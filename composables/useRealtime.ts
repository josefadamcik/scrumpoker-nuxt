import type { RealtimeChannel } from '@supabase/supabase-js'
import type { Session } from '~/types'

/**
 * Composable for real-time session updates via Supabase Realtime
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
      error.value = err.data?.message || err.message || 'Failed to fetch session'
    } finally {
      loading.value = false
    }
  }

  // Subscribe to real-time updates
  const subscribe = () => {
    if (!supabase) {
      console.error('Supabase client not available')
      return
    }

    console.log('📡 Subscribing to real-time updates for session:', sessionId)

    channel = supabase
      .channel(`session:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to ALL events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'sessions',
          filter: `id=eq.${sessionId}`
        },
        (payload) => {
          console.log('🎉 Realtime event:', payload.eventType)
          session.value = payload.new as Session
        }
      )
      .subscribe((status, err) => {
        if (err) {
          console.error('❌ Realtime subscription error:', err)
        }

        if (status === 'SUBSCRIBED') {
          console.log('✅ Subscribed to real-time updates')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Real-time channel error - check Supabase configuration')
        } else if (status === 'TIMED_OUT') {
          console.error('⏱️  Subscription timed out - retrying...')
          setTimeout(() => {
            unsubscribe()
            subscribe()
          }, 3000)
        }
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

