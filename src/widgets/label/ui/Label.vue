<template>
    <div class="flex items-center justify-center bg-gray-200 dark:bg-bg-accent-dark rounded-md hover:bg-zinc-600 duration-150">
        <span class="inline-block text-[12px] truncate max-w-[90%]">{{ label }}</span>
    </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';

defineProps({
    label: {
        type: String,
        required: true,
    },
});

</script>

<style scoped>

</style>