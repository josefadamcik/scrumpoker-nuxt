<template>
  <div class="space-y-2">
    <div class="mb-4">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Participants ({{ participantCount }})
      </h3>
      <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
        <span class="inline-flex items-center gap-1">
          <span class="w-2 h-2 bg-green-500 rounded-full"></span>
          {{ onlineCount }} online
        </span>
        <span v-if="offlineCount > 0" class="ml-3 inline-flex items-center gap-1">
          <span class="w-2 h-2 bg-gray-400 rounded-full"></span>
          {{ offlineCount }} offline
        </span>
      </p>
    </div>

    <div class="space-y-2">
      <div
        v-for="participant in sortedParticipants"
        :key="participant.id"
        :class="[
          'flex items-center justify-between p-3 rounded-lg',
          'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
        ]"
      >
        <div class="flex items-center space-x-3">
          <!-- Presence indicator -->
          <div
            :class="[
              'w-2.5 h-2.5 rounded-full',
              isOnline(participant.id) ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            ]"
            :title="isOnline(participant.id) ? 'Online' : 'Offline'"
          />

          <!-- Nickname -->
          <div class="flex items-center space-x-2">
            <span
              :class="[
                'font-medium',
                isOnline(participant.id) ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-500'
              ]"
            >
              {{ participant.nickname }}
            </span>
            <span
              v-if="participant.isCreator"
              class="text-xs px-2 py-0.5 rounded bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
            >
              Host
            </span>
            <span
              v-if="!isOnline(participant.id)"
              class="text-xs px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
            >
              Offline
            </span>
          </div>
        </div>

        <!-- Vote status -->
        <div class="flex items-center space-x-2">
          <div
            v-if="revealed && participant.vote"
            class="text-2xl font-bold text-primary-600 dark:text-primary-400"
          >
            {{ participant.vote }}
          </div>
          <div
            v-else-if="participant.vote"
            class="w-8 h-8 rounded bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center"
            title="Voted"
          >
            <svg class="w-5 h-5 text-primary-600 dark:text-primary-400" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div
            v-else
            class="text-sm text-gray-500 dark:text-gray-400"
          >
            Waiting...
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Participant, PresenceState } from '~/types'

interface Props {
  participants: Record<string, Participant>
  revealed: boolean
  presences?: Record<string, PresenceState>
}

const props = defineProps<Props>()

const sortedParticipants = computed(() => {
  return Object.values(props.participants).sort((a, b) => {
    // Creator first
    if (a.isCreator && !b.isCreator) return -1
    if (!a.isCreator && b.isCreator) return 1
    // Then by join time
    return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime()
  })
})

const participantCount = computed(() => Object.keys(props.participants).length)

const onlineCount = computed(() => {
  return Object.keys(props.participants).filter(id => isOnline(id)).length
})

const offlineCount = computed(() => {
  return participantCount.value - onlineCount.value
})

const isOnline = (participantId: string) => {
  if (!props.presences) return false
  return !!props.presences[participantId]?.online
}
</script>
