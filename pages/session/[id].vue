<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <LoadingState v-if="loading" message="Loading session..." />

    <ErrorState
      v-else-if="error"
      title="Session Not Found"
      :message="error"
    />

    <div v-else-if="session && participantId && currentParticipant" class="container mx-auto px-4 py-8">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
              Scrum Poker Session
            </h1>
            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Round {{ session.current_round }} • You are: {{ currentParticipant.nickname }}
            </p>
          </div>
          <NuxtLink
            to="/"
            class="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
          >
            Leave Session
          </NuxtLink>
        </div>

        <!-- Session Link -->
        <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div class="flex items-center justify-between">
            <div class="flex-1 mr-4">
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Share this link with your team:
              </label>
              <code class="block text-sm bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded">
                {{ sessionUrl }}
              </code>
            </div>
            <button
              @click="copySessionUrl"
              class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {{ copied ? 'Copied!' : 'Copy' }}
            </button>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Main voting area -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Vote cards -->
          <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Choose Your Card
            </h2>

            <div class="flex flex-wrap gap-4 justify-center">
              <VoteCard
                v-for="card in CARDS"
                :key="card"
                :value="card"
                :selected="myVote === card"
                :disabled="session.revealed"
                @select="handleVote"
              />
            </div>
          </div>

          <!-- Statistics (shown after reveal) -->
          <Statistics
            v-if="session.revealed"
            :stats="voteStatistics"
          />

          <!-- Control buttons (host only) -->
          <div v-if="isCreator" class="flex gap-4">
            <button
              v-if="!session.revealed"
              @click="revealVotes"
              :disabled="submitting || !hasVotes"
              class="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {{ submitting ? 'Revealing...' : 'Reveal Votes' }}
            </button>

            <button
              v-if="session.revealed"
              @click="resetRound"
              :disabled="submitting"
              class="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {{ submitting ? 'Resetting...' : 'New Round' }}
            </button>
          </div>
        </div>

        <!-- Participants sidebar -->
        <div class="lg:col-span-1">
          <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <ParticipantList
              :participants="session.participants"
              :revealed="session.revealed"
              :presences="presences"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CARDS, type Card } from '~/types'
import { calculateStatistics } from '~/utils/validation'
import type { JoinSessionResponse } from '~/types'

const route = useRoute()
const sessionId = route.params.id as string

const { getParticipantInfo, saveParticipantInfo } = useParticipant()
const participantId = ref<string | null>(null)
const myVote = ref<Card | null>(null)
const submitting = ref(false)
const copied = ref(false)
const joining = ref(false)

// Real-time session updates - load first
const { session, loading, error, refresh } = useRealtime(sessionId)

// Wait for session to load, then check/join participant
watch(session, async (newSession) => {
  if (!newSession || joining.value) return

  // Check if we have a stored participant
  const existingParticipant = getParticipantInfo(sessionId)

  if (existingParticipant && newSession.participants[existingParticipant.participantId]) {
    // Participant exists in session, use it
    participantId.value = existingParticipant.participantId
    console.log('Restored participant from localStorage:', existingParticipant.nickname)
  } else if (!participantId.value && !joining.value) {
    // Need to join the session
    joining.value = true
    try {
      const response = await $fetch<JoinSessionResponse>(
        `/api/session/${sessionId}/join`,
        {
          method: 'POST',
          body: {
            nickname: existingParticipant?.nickname // Try to preserve nickname
          }
        }
      )

      participantId.value = response.participantId
      saveParticipantInfo({
        participantId: response.participantId,
        nickname: response.nickname,
        sessionId
      })
      console.log('Joined session as:', response.nickname)

      // Refresh session data to get updated participants list
      await refresh()
    } catch (err) {
      console.error('Failed to join session:', err)
    } finally {
      joining.value = false
    }
  }
}, { immediate: true })

// Get current participant info
const currentParticipant = computed(() => {
  if (!session.value || !participantId.value) return null
  return session.value.participants[participantId.value]
})

// Presence tracking - only initialize when we have participant data
const { presences } = computed(() => {
  if (participantId.value && currentParticipant.value) {
    return usePresence(sessionId, participantId.value, currentParticipant.value.nickname)
  }
  return { presences: ref({}) }
}).value

// Computed properties
const isCreator = computed(() => {
  return session.value?.creator_id === participantId.value
})

const hasVotes = computed(() => {
  if (!session.value) return false
  return Object.values(session.value.participants).some(p => p.vote !== null)
})

const voteStatistics = computed(() => {
  if (!session.value?.revealed) return null

  const votes: Record<string, Card> = {}
  for (const [id, participant] of Object.entries(session.value.participants)) {
    if (participant.vote) {
      votes[id] = participant.vote
    }
  }

  return calculateStatistics(votes)
})

const sessionUrl = computed(() => {
  if (typeof window === 'undefined') return ''
  return `${window.location.origin}/session/${sessionId}`
})

// Watch for vote changes
watch(
  () => session.value?.participants[participantId.value!]?.vote,
  (newVote) => {
    myVote.value = newVote || null
  },
  { immediate: true }
)

// Methods
const handleVote = async (card: Card) => {
  if (!participantId.value || session.value?.revealed) return

  myVote.value = card
  submitting.value = true

  try {
    await $fetch(`/api/session/${sessionId}/vote`, {
      method: 'POST',
      body: {
        participantId: participantId.value,
        vote: card
      }
    })
  } catch (err) {
    console.error('Failed to submit vote:', err)
    myVote.value = session.value?.participants[participantId.value]?.vote || null
  } finally {
    submitting.value = false
  }
}

const revealVotes = async () => {
  if (!participantId.value) return

  submitting.value = true

  try {
    await $fetch(`/api/session/${sessionId}/reveal`, {
      method: 'POST',
      body: {
        participantId: participantId.value
      }
    })
  } catch (err) {
    console.error('Failed to reveal votes:', err)
  } finally {
    submitting.value = false
  }
}

const resetRound = async () => {
  if (!participantId.value) return

  submitting.value = true

  try {
    await $fetch(`/api/session/${sessionId}/reset`, {
      method: 'POST',
      body: {
        participantId: participantId.value
      }
    })
    myVote.value = null
  } catch (err) {
    console.error('Failed to reset round:', err)
  } finally {
    submitting.value = false
  }
}

const copySessionUrl = async () => {
  try {
    await navigator.clipboard.writeText(sessionUrl.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy URL:', err)
  }
}

useHead({
  title: `Session ${sessionId} - Scrum Poker`,
})
</script>
