<template>
  <div class="fixed bottom-4 right-4 w-80 z-[9999] flex flex-col gap-2">
    <TransitionGroup name="slide">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="[
          'p-4 rounded-lg shadow-lg flex items-center justify-between',
          notification.type === 'success'
            ? 'bg-bg-accent-dark border-2 border-emerald-700 text-white'
            : 'bg-bg-accent-dark border-2 border-red-800 text-white',
        ]"
      >
        <span>{{ notification.message }}</span>
        <button
          @click="$emit('close', notification.id)"
          class="hover:opacity-70 transition-opacity"
        >
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  notifications: Array<{
    id: string;
    message: string;
    type: "success" | "error";
  }>;
}>();

defineEmits(["close"]);
</script>

<style>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
