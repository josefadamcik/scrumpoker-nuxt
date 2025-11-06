<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800">
    <div class="container mx-auto px-4 py-16">
      <div class="max-w-2xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-12">
          <h1 class="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Scrum Poker
          </h1>
          <p class="text-xl text-gray-600 dark:text-gray-300">
            Real-time planning poker for agile teams
          </p>
        </div>

        <!-- Create Session Card -->
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Start a New Session
          </h2>

          <form @submit.prevent="createSession">
            <div class="mb-6">
              <label
                for="nickname"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Your Nickname (optional)
              </label>
              <input
                id="nickname"
                v-model="nickname"
                type="text"
                maxlength="30"
                placeholder="Leave empty for random name"
                class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Maximum 30 characters
              </p>
            </div>

            <button
              type="submit"
              :disabled="loading"
              class="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              <span v-if="loading" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </span>
              <span v-else>Create Session</span>
            </button>
          </form>

          <div v-if="error" class="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
          </div>
        </div>

        <!-- Features -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="text-center">
            <div class="bg-primary-100 dark:bg-primary-900/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Real-time Updates</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">Instant synchronization via WebSocket</p>
          </div>

          <div class="text-center">
            <div class="bg-primary-100 dark:bg-primary-900/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 class="font-semibold text-gray-900 dark:text-white mb-2">No Registration</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">Start estimating immediately</p>
          </div>

          <div class="text-center">
            <div class="bg-primary-100 dark:bg-primary-900/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 class="font-semibold text-gray-900 dark:text-white mb-2">Team Collaboration</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">Up to 50 participants per session</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CreateSessionResponse } from '~/types'

const nickname = ref('')
const loading = ref(false)
const error = ref('')

const { saveParticipantInfo } = useParticipant()

const createSession = async () => {
  loading.value = true
  error.value = ''

  try {
    const response = await $fetch<CreateSessionResponse>('/api/session', {
      method: 'POST',
      body: {
        nickname: nickname.value.trim() || undefined
      }
    })

    // Save participant info
    saveParticipantInfo({
      participantId: response.participantId,
      nickname: response.nickname,
      sessionId: response.sessionId
    })

    // Navigate to session
    await navigateTo(`/session/${response.sessionId}`)
  } catch (err: any) {
    console.error('Failed to create session:', err)
    error.value = err.data?.message || 'Failed to create session. Please try again.'
  } finally {
    loading.value = false
  }
}

useHead({
  title: 'Scrum Poker - Planning Poker for Agile Teams',
})
</script>
