<template>
  <div class="mt-2.5">
    <div v-for="(subtask, index) in subtasks" :key="index" class="p-2.5 mb-2.5 bg-gray-700 rounded-lg">
      <div class="flex items-center gap-2.5">
        <input type="checkbox" v-model="subtask.completed" @change="updateSubtask(subtask)" />
        <span :class="{ 'line-through text-gray-400': subtask.completed }">{{ subtask.name }}</span>
      </div>
      <div class="flex justify-between mt-1.5 text-xs text-gray-400">
        <span>Дедлайн: {{ formatDate(subtask.deadline) }}</span>
        <span>{{ getStatusLabel(subtask.status) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

defineProps<{
  subtasks: Array<{
    name: string;
    completed: boolean;
    deadline: string;
    status: string;
  }>;
}>();

const emit = defineEmits(['update-subtask']);

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('ru-RU');
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'planned': return 'Запланировано';
    case 'progress': return 'В работе';
    case 'done': return 'Завершено';
    default: return 'Не указан';
  }
};

const updateSubtask = (subtask: any) => {
  emit('update-subtask', subtask);
};
</script>
