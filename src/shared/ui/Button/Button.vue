<template>
  <button
    class="px-4 py-2 rounded-md transition-colors"
    :class="[
      variant === 'primary'
        ? 'bg-blue-600 hover:bg-blue-700 text-white'
        : 'bg-gray-200 hover:bg-gray-300 text-gray-600',
      size === 'sm' ? 'text-sm px-3 py-1' : 'text-base',
    ]"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
    defineProps({
        variant: {
            type: String,
            default: 'primary'
        },
        size: {
            type: String,
            default: 'md'
        }
    })
</script>

<style scoped></style>
