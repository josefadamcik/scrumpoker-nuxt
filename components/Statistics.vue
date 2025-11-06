<template>
  <div
    v-if="stats"
    class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
  >
    <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
      Vote Statistics
    </h3>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="text-center">
        <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">Average</div>
        <div class="text-2xl font-bold text-primary-600 dark:text-primary-400">
          {{ stats.average !== null ? stats.average.toFixed(1) : 'N/A' }}
        </div>
      </div>

      <div class="text-center">
        <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">Min</div>
        <div class="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {{ stats.min || 'N/A' }}
        </div>
      </div>

      <div class="text-center">
        <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">Max</div>
        <div class="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {{ stats.max || 'N/A' }}
        </div>
      </div>

      <div class="text-center">
        <div class="text-sm text-gray-500 dark:text-gray-400 mb-1">Consensus</div>
        <div class="text-2xl">
          {{ stats.consensus ? '✅' : '❌' }}
        </div>
      </div>
    </div>

    <div v-if="Object.keys(stats.distribution).length > 0">
      <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Distribution</h4>
      <div class="space-y-2">
        <div
          v-for="(count, card) in stats.distribution"
          :key="card"
          class="flex items-center space-x-3"
        >
          <div class="w-12 text-lg font-bold text-gray-900 dark:text-gray-100">{{ card }}</div>
          <div class="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-6 relative overflow-hidden">
            <div
              class="bg-primary-500 h-full rounded-full flex items-center justify-end px-2"
              :style="{ width: `${(count / totalVotes) * 100}%` }"
            >
              <span class="text-xs font-medium text-white">{{ count }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { VoteStatistics } from '~/types'

interface Props {
  stats: VoteStatistics | null
}

const props = defineProps<Props>()

const totalVotes = computed(() => {
  if (!props.stats) return 0
  return Object.values(props.stats.distribution).reduce((sum, count) => sum + count, 0)
})
</script>
