<template>
  <button
    :class="[
      'relative w-20 h-28 rounded-lg border-2 transition-all duration-200',
      'flex items-center justify-center text-2xl font-bold',
      'hover:scale-105 active:scale-95',
      selected
        ? 'border-primary-600 bg-primary-100 dark:bg-primary-900/30 shadow-lg'
        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-primary-400 hover:shadow-md',
      disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
    ]"
    :disabled="disabled"
    @click="handleClick"
  >
    <span :class="[
      selected ? 'text-primary-700 dark:text-primary-300' : 'text-gray-700 dark:text-gray-300'
    ]">
      {{ value }}
    </span>

    <div
      v-if="selected"
      class="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary-600 flex items-center justify-center"
    >
      <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
        <path
          fill-rule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clip-rule="evenodd"
        />
      </svg>
    </div>
  </button>
</template>

<script setup lang="ts">
import type { Card } from '~/types'

interface Props {
  value: Card
  selected?: boolean
  disabled?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  select: [value: Card]
}>()

const handleClick = () => {
  if (!props.disabled) {
    emit('select', props.value)
  }
}
</script>
