<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
    <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
      Vote History
    </h3>

    <div v-if="sortedHistory.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
      <p>No voting rounds completed yet</p>
      <p class="text-sm mt-1">History will appear here after revealing votes</p>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="record in sortedHistory"
        :key="record.round"
        class="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
      >
        <!-- Round header -->
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <span class="font-semibold text-gray-900 dark:text-gray-100">
              Round {{ record.round }}
            </span>
            <span
              v-if="record.round === voteHistory.length"
              class="px-2 py-0.5 text-xs rounded bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
            >
              Latest
            </span>
          </div>
          <span class="text-xs text-gray-500 dark:text-gray-400">
            {{ formatTimestamp(record.timestamp) }}
          </span>
        </div>

        <!-- Votes grid -->
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          <div
            v-for="(vote, participantId) in record.votes"
            :key="participantId"
            class="flex items-center gap-2 p-2 rounded bg-gray-50 dark:bg-gray-700/50"
          >
            <div class="flex-1 min-w-0">
              <div class="text-xs text-gray-500 dark:text-gray-400 truncate">
                {{ getParticipantName(participantId) }}
              </div>
            </div>
            <div class="text-lg font-bold text-primary-600 dark:text-primary-400">
              {{ vote }}
            </div>
          </div>
        </div>

        <!-- Statistics -->
        <div v-if="record.votes && Object.keys(record.votes).length > 0" class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div class="flex gap-4 text-sm">
            <div>
              <span class="text-gray-500 dark:text-gray-400">Avg:</span>
              <span class="ml-1 font-semibold text-gray-900 dark:text-gray-100">
                {{ calculateAverage(record.votes) }}
              </span>
            </div>
            <div>
              <span class="text-gray-500 dark:text-gray-400">Min:</span>
              <span class="ml-1 font-semibold text-gray-900 dark:text-gray-100">
                {{ calculateMin(record.votes) }}
              </span>
            </div>
            <div>
              <span class="text-gray-500 dark:text-gray-400">Max:</span>
              <span class="ml-1 font-semibold text-gray-900 dark:text-gray-100">
                {{ calculateMax(record.votes) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { VoteRecord, Card, ParticipantsMap } from '~/types'

interface Props {
  voteHistory: VoteRecord[]
  participants: ParticipantsMap
}

const props = defineProps<Props>()

// Sort history with latest first
const sortedHistory = computed(() => {
  return [...props.voteHistory].sort((a, b) => b.round - a.round)
})

// Get participant name by ID
const getParticipantName = (participantId: string) => {
  return props.participants[participantId]?.nickname || 'Unknown'
}

// Format timestamp
const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`

  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// Calculate statistics
const calculateAverage = (votes: Record<string, Card>) => {
  const numericVotes = Object.values(votes)
    .filter(vote => vote !== '?' && vote !== '☕')
    .map(vote => parseInt(vote))
    .filter(v => !isNaN(v))

  if (numericVotes.length === 0) return 'N/A'

  const avg = numericVotes.reduce((a, b) => a + b, 0) / numericVotes.length
  return avg.toFixed(1)
}

const calculateMin = (votes: Record<string, Card>) => {
  const numericVotes = Object.values(votes)
    .filter(vote => vote !== '?' && vote !== '☕')
    .map(vote => parseInt(vote))
    .filter(v => !isNaN(v))

  if (numericVotes.length === 0) return 'N/A'
  return Math.min(...numericVotes).toString()
}

const calculateMax = (votes: Record<string, Card>) => {
  const numericVotes = Object.values(votes)
    .filter(vote => vote !== '?' && vote !== '☕')
    .map(vote => parseInt(vote))
    .filter(v => !isNaN(v))

  if (numericVotes.length === 0) return 'N/A'
  return Math.max(...numericVotes).toString()
}
</script>
