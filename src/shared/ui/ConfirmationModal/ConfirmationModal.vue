<template>
  <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        @click.self="cancel"
      >
        <div class="bg-gray-300 dark:bg-zinc-800 p-6 rounded-lg shadow-lg max-w-sm w-full">
          <h3 class="text-xl text-zinc-800 dark:text-f14-font-dark font-semibold mb-4">{{ title }}</h3>
          <p class="text-zinc-700 dark:text-gray-300 mb-6">{{ message }}</p>
          <div class="flex gap-2 justify-end">
            <button
              @click="confirm"
              class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
              :disabled="isLoading"
            >
              {{ confirmText }}
            </button>
            <button
              @click="cancel"
              class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md"
              :disabled="isLoading"
            >
              {{ cancelText }}
            </button>
          </div>
        </div>
      </div>
  </Transition>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";

const props = defineProps({
  isOpen: Boolean,
  title: {
    type: String,
    default: "Подтвердите действие",
  },
  message: String,
  confirmText: {
    type: String,
    default: "Подтвердить",
  },
  cancelText: {
    type: String,
    default: "Отмена",
  },
  isLoading: Boolean,
});

const emit = defineEmits(["confirm", "cancel"]);

const confirm = () => emit("confirm");
const cancel = () => emit("cancel");

const handleKeydown = (e: KeyboardEvent) => {
  if (props.isOpen) {
    if (e.key === 'Escape') cancel();
    if (e.key === 'Enter') confirm();
  }
};

onMounted(() => window.addEventListener('keydown', handleKeydown));
onUnmounted(() => window.removeEventListener('keydown', handleKeydown));

</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-enter-active,
.scale-leave-active {
  transition: transform 0.3s, opacity 0.3s;
}
.scale-enter-from,
.scale-leave-to {
  transform: scale(0.95);
  opacity: 0;
}
</style>
