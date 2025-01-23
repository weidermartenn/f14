<template>
    <div class="mb-4">
        <input
            :type="type"
            id="input"
            :value="modelValue"
            class="mt-1 block w-full px-3 py-2 text-input-text border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Введите данные"
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
});

const emit = defineEmits(["update:modelValue"]);

const handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    emit("update:modelValue", value);
};

watch(() => props.modelValue, (newValue) => {
    if (!newValue) {
        // Очищаем ошибку, если поле пустое
    }
});
</script>

<style scoped>

</style>