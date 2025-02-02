<template>
  <div class="w-72 h-42 p-2 flex flex-col justify-between bg-bg-dark rounded-md border-2 border-gray-700 hover:border-blue-500 cursor-pointer">
    <TaskDetail :task="task" :isOpen="isOpen" @close="handleClose"/>
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
        <button @click="handleDeleteTask" id="delete" class="hover:bg-gray-600 w-6 h-6 flex items-center justify-center rounded-full duration-150">
          <i class="fa-regular fa-trash-can"></i>
        </button>
    </div>
    <div @click="handleClick">
      <span class="inline-block mt-2 text-md truncate max-w-[100%]"><code class="bg-bg-accent-dark rounded-sm px-2 py-2">{{ task.name }}</code></span>
      <div class="mt-4 grid grid-cols-2">
        <div class="flex flex-col">
          <span class="flex gap-1 items-center text-xs text-gray-400">
            <i class="fa-solid fa-chart-simple"></i>
            <span>{{ getPriorityLabel(task.priority) }}</span>
          </span>
          <span class="flex gap-1 items-center text-xs text-gray-400">
            <i class="fa-regular fa-calendar-days"></i>
            <span>{{ formatDate(task.createdAt) }}</span>
          </span>
        </div>
        <div v-if="task.labels && task.labels.length > 0" class="grid grid-cols-2 gap-1">
            <Label v-for="(label, index) in task.labels.slice(0, 2)" :key="index" :label="label" class="w-14 truncate"/>
        </div>
      </div>
      <div class="mt-4 flex gap-2 justify-center items-center">
        <i class="fa-solid fa-clock text-xl"></i>
        <span class="text-sm">{{ formatDate(task.deadline) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Label } from '@/widgets/label';
import type { Task } from '@/entities/task/types';
import { deleteTask } from '@/shared/api/sbHelper';
import { defineProps, defineEmits, ref } from 'vue';
import { TaskDetail } from '@/widgets/taskdetail';

const props = defineProps<{
  task: Task;
}>();

const emit = defineEmits(['delete']);

const isOpen = ref(false);

const getPriorityLabel = (priority: Label) => {
  switch (priority) {
    case 1: return 'Низкий';
    case 2: return 'Средний';
    case 3: return 'Высокий';
    default: return 'Не указан';
  }
}

/**
 * Format date to string in format dd.mm.yyyy
 * @param {Date} date
 * @returns {string}
 */
const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('ru-RU');
};

const handleDeleteTask = async () => {
  emit('delete', props.task.id);
}


const handleClick = () => {
  isOpen.value = !isOpen.value;
}

const handleClose = () => {
  isOpen.value = false;
}
</script>

<style scoped>

</style>