import type { RealtimeChannel } from '@supabase/supabase-js'
import type { PresenceState } from '~/types'

/**
 * Composable for presence tracking
 */
export const usePresence = (sessionId: string, participantId: string, nickname: string) => {
  const supabase = useSupabase()
  const presences = ref<Record<string, PresenceState>>({})

  let channel: RealtimeChannel | null = null

  // Subscribe to presence
  const subscribe = () => {
    if (!supabase) return

    channel = supabase.channel(`presence:${sessionId}`, {
      config: {
        presence: {
          key: participantId
        }
      }
    })

    // Track presence state
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel!.presenceState()
        const presenceMap: Record<string, PresenceState> = {}

        for (const [key, values] of Object.entries(state)) {
          if (values.length > 0) {
            const presence = values[0] as any
            presenceMap[key] = {
              participantId: key,
              nickname: presence.nickname || 'Unknown',
              online: true,
              lastSeen: new Date().toISOString()
            }
          }
        }

        presences.value = presenceMap
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('Presence joined:', key, newPresences)
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('Presence left:', key, leftPresences)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track own presence
          await channel!.track({
            participantId,
            nickname,
            online: true,
            lastSeen: new Date().toISOString()
          })
        }
      })
  }

  // Unsubscribe from presence
  const unsubscribe = () => {
    if (channel) {
      channel.untrack()
      supabase?.removeChannel(channel)
      channel = null
    }
  }

  // Initialize
  onMounted(() => {
    subscribe()
  })

  // Cleanup
  onUnmounted(() => {
    unsubscribe()
  })

  return {
    presences: readonly(presences)
  }
}
