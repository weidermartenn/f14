<template>
  <div class="mb-4">
    <label for="email" class="block text-sm font-medium">Email</label>
    <input
      type="email"
      id="email"
      :value="modelValue"
      class="mt-1 block w-full px-3 py-2 text-input-text border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      placeholder="Введите ваш email"
      @input="handleInput"
    />
    <p v-if="error" class="mt-2 text-sm text-red-600">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { watch } from "vue";

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
  },
  error: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:modelValue", "update:error"]);

// Функция для проверки формата email
const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Обработка ввода
const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const value = target.value;

  // Обновляем значение modelValue
  emit("update:modelValue", value);

  // Проверяем валидность email и обновляем ошибку
  if (value && !validateEmail(value)) {
    emit("update:error", "Пожалуйста, введите корректный email.");
  } else {
    emit("update:error", ""); // Очищаем ошибку, если email корректен
  }
};

// Следим за изменением modelValue и сбрасываем ошибку, если поле пустое
watch(() => props.modelValue, (newValue) => {
  if (!newValue) {
    emit("update:error", ""); // Очищаем ошибку, если поле пустое
  }
});
</script>

<style scoped></style>