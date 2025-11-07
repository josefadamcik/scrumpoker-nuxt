import type { RealtimeChannel } from '@supabase/supabase-js'
import type { Session } from '~/types'

/**
 * Composable for real-time session updates
 * Uses Supabase Realtime with polling fallback
 */
export const useRealtime = (sessionId: string) => {
  const supabase = useSupabase()
  const session = ref<Session | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)
  const lastUpdate = ref<number>(Date.now())
  const realtimeWorking = ref(false)

  let channel: RealtimeChannel | null = null
  let pollingInterval: NodeJS.Timeout | null = null

  // Fetch initial session data
  const fetchSession = async (silent = false) => {
    try {
      if (!silent) {
        loading.value = true
      }
      const response = await $fetch<Session>(`/api/session/${sessionId}`)

      // Only update if data actually changed
      const hasChanged = JSON.stringify(session.value) !== JSON.stringify(response)
      if (hasChanged) {
        console.log('🔄 Session data updated', silent ? '(polling)' : '')
        session.value = response
        lastUpdate.value = Date.now()
      }

      error.value = null
    } catch (err: any) {
      console.error('Failed to fetch session:', err)
      error.value = err.data?.message || err.message || 'Failed to fetch session'
    } finally {
      if (!silent) {
        loading.value = false
      }
    }
  }

  // Start polling as fallback
  const startPolling = () => {
    if (pollingInterval) return

    console.log('⏰ Starting polling fallback (every 2 seconds)')
    pollingInterval = setInterval(async () => {
      if (!realtimeWorking.value) {
        await fetchSession(true)
      }
    }, 2000)
  }

  // Stop polling
  const stopPolling = () => {
    if (pollingInterval) {
      console.log('⏰ Stopping polling')
      clearInterval(pollingInterval)
      pollingInterval = null
    }
  }

  // Subscribe to real-time updates
  const subscribe = () => {
    if (!supabase) {
      console.error('Supabase client not available')
      return
    }

    console.log('📡 Subscribing to real-time updates for session:', sessionId)
    console.log('🔍 Listening for: postgres_changes on table "sessions"')

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
          console.log('🎉 REALTIME EVENT RECEIVED:', {
            event: payload.eventType,
            table: payload.table,
            new: payload.new
          })

          realtimeWorking.value = true
          session.value = payload.new as Session
          lastUpdate.value = Date.now()

          // Stop polling if realtime is working
          stopPolling()
        }
      )
      .subscribe((status, err) => {
        console.log('📡 Realtime subscription status:', status)

        if (err) {
          console.error('❌ Realtime subscription error:', err)
        }

        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to real-time updates')
          console.log('⏳ Waiting for UPDATE events... (try voting or revealing)')
          console.log('⚠️  If no events come after 10 seconds, using polling fallback')

          // Start polling fallback after 10 seconds if no realtime events
          setTimeout(() => {
            if (!realtimeWorking.value) {
              console.warn('⚠️  No realtime events received in 10 seconds')
              console.log('🔄 Switching to polling mode (refresh every 2 seconds)')
              startPolling()
            }
          }, 10000)
        }

        if (status === 'CHANNEL_ERROR') {
          console.error('❌ Real-time channel error')
          console.error('📋 Checklist:')
          console.error('   1. Is Realtime enabled in Supabase? (Database → Replication)')
          console.error('   2. Is the "sessions" table toggle ON?')
          console.error('   3. Try refreshing Supabase dashboard and re-enabling')
          startPolling()
        }

        if (status === 'TIMED_OUT') {
          console.error('⏱️  Real-time subscription timed out')
          startPolling()
          // Retry subscription after timeout
          setTimeout(() => {
            unsubscribe()
            subscribe()
          }, 3000)
        }

        if (status === 'CLOSED') {
          console.log('🔌 Realtime connection closed')
          startPolling()
        }
      })
  }

  // Unsubscribe from real-time updates
  const unsubscribe = () => {
    if (channel) {
      console.log('🔌 Unsubscribing from real-time updates')
      supabase?.removeChannel(channel)
      channel = null
    }
    stopPolling()
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
    refresh: fetchSession,
    lastUpdate: readonly(lastUpdate),
    realtimeWorking: readonly(realtimeWorking)
  }
}

