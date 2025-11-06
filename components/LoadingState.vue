<template>
  <div class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <div
        class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-primary-600 dark:border-gray-600 dark:border-t-primary-400"
      ></div>
      <p v-if="message" class="mt-4 text-gray-600 dark:text-gray-400">{{ message }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  message?: string
}

defineProps<Props>()
</script>
