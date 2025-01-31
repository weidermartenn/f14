<template>
  <div class="w-72 h-42 p-2 flex flex-col justify-between bg-bg-dark rounded-md border-2 border-gray-700">
    <div class="flex justify-between gap-4">
        <button id="edit" class="hover:bg-gray-600 w-6 h-6 flex items-center justify-center rounded-full duration-150">
          <i class="fa-solid fa-pen-to-square"></i>
        </button>
        <button id="froze" class="hover:bg-gray-600 w-6 h-6 flex items-center justify-center rounded-full duration-150">
          <i class="fa-solid fa-snowflake"></i>
        </button>
        <button id="hide" class="hover:bg-gray-600 w-6 h-6 flex items-center justify-center rounded-full duration-150">
          <i class="fa-solid fa-eye-slash"></i>
        </button>
        <button id="delete" class="hover:bg-gray-600 w-6 h-6 flex items-center justify-center rounded-full duration-150">
          <i class="fa-regular fa-trash-can"></i>
        </button>
    </div>
    <span class="inline-block mt-2 text-md truncate max-w-[100%]">Задача такая-то где-то созданная каким-то человеком</span>
    <div class="mt-4 flex justify-between">
      <div class="flex flex-col">
        <span class="flex gap-1 items-center text-xs text-gray-400">
          <i class="fa-solid fa-chart-simple"></i>
          <span>{{ getPriorityLabel(task.priority) }}</span>
        </span>
        <span class="flex gap-1 items-center text-xs text-gray-400">
          <i class="fa-regular fa-calendar-days"></i>
          <span>{{ formatDate(task.deadline) }}</span>
        </span>
      </div>
      <div v-if="task.labels && task.labels.lenght > 0" class="grid grid-cols-2 gap-1">
          <Label v-for="(label, index) in task.labels" :key="index" :label="label"/>
      </div>
    </div>
    <div class="mt-4 flex gap-2 justify-center items-center">
      <i class="fa-solid fa-clock text-xl"></i>
      <span class="text-sm">{{ formatDate(task.createdAt) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Label } from '@/widgets/label';
import type { Task } from '@/entities/task/types';
import { defineProps } from 'vue';

const props = defineProps<{
  task: Task;
}>();

const getPriorityLabel = (priority: Label) => {
  switch (priority) {
    case 1: return 'Низкий';
    case 2: return 'Средний';
    case 3: return 'Высокий';
    default: return 'Не указан';
  }
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('ru-RU');
};

</script>

<style scoped>

</style>