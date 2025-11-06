<template>
  <div class="flex items-center justify-center min-h-screen p-4">
    <div class="max-w-md w-full text-center">
      <div class="mb-4">
        <svg
          class="mx-auto h-12 w-12 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h2 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
        {{ title || 'Error' }}
      </h2>
      <p class="text-gray-600 dark:text-gray-400 mb-6">
        {{ message }}
      </p>
      <NuxtLink
        to="/"
        class="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        Go Home
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  message: string
}

defineProps<Props>()
</script>
