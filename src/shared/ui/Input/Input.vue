<template>
  <div class="mb-4">
    <input
      :type="type"
      id="input"
      :disabled="disabled"
      :value="modelValue"
      :class="[
        'mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
        disabled ? 'text-gray-400' : 'text-input-text',
      ]"
      :placeholder="placeholder"
      @input="handleInput"
    />
    <p v-if="error" class="mt-2 text-sm text-red-600">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { watch } from "vue";

const props = defineProps({
  type: {
    type: String,
    default: "text",
  },
  modelValue: {
    type: [String, Number],
    required: true,
  },
  error: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "Введите данные",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue"]);

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const value = target.value;
  emit("update:modelValue", value);
};

watch(
  () => props.modelValue,
  (newValue) => {
    if (!newValue) {
      // Очищаем ошибку, если поле пустое
    }
  }
);
</script>

<style scoped></style>
