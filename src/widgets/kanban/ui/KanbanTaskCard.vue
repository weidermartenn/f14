<template>
  <div>
    <TaskEditPanel :task="task" :isOpen="isEditPanelOpen" @close="handleEditClose" @updated="handleTaskUpdated"/>
    <div
    :class="['w-82 h-42 p-2 flex flex-col justify-between rounded-md border-2 cursor-pointer',
      task.isFrozen ? 'bg-gray-800 border-gray-600' : 'bg-bg-dark border-gray-700 hover:border-blue-500'
    ]">
      <TaskDetail :task="task" :isOpen="isOpen" @close="handleClose"/>
      <div class="flex justify-between gap-4">
          <button @click="handleEditTask" id="edit" class="hover:bg-gray-600 w-6 h-6 flex items-center justify-center rounded-full duration-150">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button @click="handleFreezeTask" id="froze" class="hover:bg-gray-600 w-6 h-6 flex items-center justify-center rounded-full duration-150">
            <i class="fa-solid fa-snowflake" :class="task.isFrozen ? 'text-gray-300' : ''"></i>
          </button>
          <button @click="handleHideTask" id="hide" class="hover:bg-gray-600 w-6 h-6 flex items-center justify-center rounded-full duration-150">
            <i :class="task.isVisible ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
          </button>
          <button @click="handleDeleteModalOpen" id="delete" class="hover:bg-gray-600 w-6 h-6 flex items-center justify-center rounded-full duration-150">
            <i class="fa-regular fa-trash-can"></i>
          </button>
      </div>
      <div @click="handleClick">
        <div class="flex flex-col">
          <span class="inline-block mt-2 text-xs text-gray-300">{{ task.id }}</span>
          <span class="inline-block mt-2 text-md truncate max-w-[100%]"><code class="bg-bg-accent-dark rounded-sm px-2 py-2">{{ task.name }}</code></span>
        </div>
        <div class="mt-4 grid grid-cols-2">
          <div class="flex flex-col">
            <span class="flex gap-1 items-center text-xs text-gray-400">
              <i class="fa-solid fa-chart-simple"></i>
              <span>{{ getPriorityLabel(task.priority) }}</span>
            </span>
            <span class="flex gap-1 items-center text-xs text-gray-400">
              <i class="fa-regular fa-calendar-days"></i>
              <span>{{ formatDate(new Date(task.createdAt)) }}</span>
            </span>
          </div>
          <div v-if="task.labels && task.labels.length > 0" class="grid grid-cols-2 gap-1">
              <Label v-for="(label, index) in task.labels.slice(0, 2)" :key="index" :label="label" class="w-14 truncate"/>
          </div>
        </div>
        <div class="mt-4 flex gap-2 justify-center items-center">
          <i class="fa-solid fa-clock text-xl"></i>
          <span class="text-sm">{{ formatDate(new Date(task.deadline)) }}</span>
        </div>
      </div>
      <ConfirmationModal
        :is-open="isDeleteModalOpen"
        title="Удалить проект?"
        :message="`Вы уверены, что хотите удалить задачу ${task.name}? Это действие нельзя отменить.`"
        confirm-text="Удалить"
        :is-loading="isDeleting"
        @confirm="handleDeleteTask"
        @cancel="cancelDelete"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Label } from '../../../widgets/label';
import type { Task } from '../../../entities/task/types';
import { defineProps, defineEmits, ref } from 'vue';
import { TaskDetail } from '../../../widgets/taskdetail';
import { TaskEditPanel } from '../../../widgets/taskeditpanel';
import { ConfirmationModal } from '../../../shared/ui/ConfirmationModal';

const props = defineProps<{
  task: Task;
}>();

const emit = defineEmits(['edit', 'delete', 'freeze', 'hide']);

const isOpen = ref(false);
const isDeleting = ref(false)
const isEditPanelOpen = ref(false);
const isDeleteModalOpen = ref(false);

const getPriorityLabel = (priority: number) => {
  switch (priority) {
    case 1: return 'Низкий';
    case 2: return 'Средний';
    case 3: return 'Высокий';
    default: return 'Не указан';
  }
}

const handleTaskUpdated = (updatedTask: Task) => {
  emit('edit', updatedTask);
  isEditPanelOpen.value = false;
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('ru-RU');
};

const handleEditTask = async () => {
  emit('edit', props.task.id)
  isEditPanelOpen.value = true
}

const handleDeleteTask = async () => {
  emit('delete', props.task.id);
  isDeleting.value = true
}

const handleHideTask = async () => {
  emit('hide', props.task.id)
}

const handleFreezeTask = async () => {
  emit('freeze', props.task.id);
}

const handleClick = () => {
  isOpen.value = !isOpen.value;
}

const handleClose = () => {
  isOpen.value = false;
}

const handleEditClose = () => {
  isEditPanelOpen.value = false;
}

const handleDeleteModalOpen = () => {
  isDeleteModalOpen.value = true;
}

const cancelDelete = () => {
  isDeleteModalOpen.value = false;
}
</script>

<style scoped>

</style>