<template>
  <div>
    <TaskEditPanel :task="task" :isOpen="isEditPanelOpen" @close="handleEditClose" @updated="handleTaskUpdated"/>
    <div
      :class="[
        'w-full p-4 flex flex-col justify-between rounded-lg border cursor-pointer relative transition-colors',
        task.isFrozen 
          ? 'bg-gray-400 dark:bg-zinc-700 border-gray-300 dark:border-gray-600' 
          : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400'
      ]"
    >
      <TaskDetail :task="task" :isOpen="isOpen" @close="handleClose"/>
      
      <!-- Buttons Container -->
      <div class="absolute top-2 right-2 flex gap-2">
        <button 
          @click.stop="handleEditTask" 
          class="text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 w-6 h-6 flex items-center justify-center rounded-full transition-colors"
          title="Редактировать"
        >
          <i class="fa-solid fa-pen-to-square text-sm"></i>
        </button>
        <button 
          @click.stop="handleFreezeTask" 
          class="text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 w-6 h-6 flex items-center justify-center rounded-full transition-colors"
          title="Заморозить"
        >
          <i class="fa-solid fa-snowflake text-sm" :class="task.isFrozen ? 'text-blue-500' : ''"></i>
        </button>
        <button 
          @click.stop="handleHideTask" 
          class="text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 w-6 h-6 flex items-center justify-center rounded-full transition-colors"
          :title="task.isVisible ? 'Скрыть' : 'Показать'"
        >
          <i :class="task.isVisible ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'"></i>
        </button>
        <button 
          @click.stop="handleDeleteModalOpen" 
          class="text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 w-6 h-6 flex items-center justify-center rounded-full transition-colors"
          title="Удалить"
        >
          <i class="fa-regular fa-trash-can text-sm"></i>
        </button>
      </div>
      
      <div @click="handleClick" class="space-y-3">
        <div class="flex flex-col space-y-1">
          <span class="text-xs text-gray-500 dark:text-gray-400">{{ task.id }}</span>
          <span class="text-xs text-gray-500 dark:text-gray-400">{{ majorTaskName }}</span>
          <span class="text-md font-medium text-gray-900 dark:text-gray-100 truncate">
            <code class="bg-gray-100 dark:bg-gray-700 rounded px-2 py-1 text-gray-800 dark:text-gray-200">
              {{ task.name }}
            </code>
          </span>
        </div>
        
        <div class="grid grid-cols-2 gap-2">
          <div class="flex flex-col space-y-1">
            <span class="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300">
              <i class="fa-solid fa-chart-simple text-xs"></i>
              <span>{{ getPriorityLabel(task.priority) }}</span>
            </span>
            <span class="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300">
              <i class="fa-regular fa-calendar-days text-xs"></i>
              <span>{{ formatDate(new Date(task.createdAt)) }}</span>
            </span>
          </div>
          
          <div v-if="task.labels && task.labels.length > 0" class="grid grid-cols-2 gap-1">
            <Label 
              v-for="(label, index) in task.labels.slice(0, 2)" 
              :key="index" 
              :label="label" 
              class="max-w-[100px] truncate text-xs"
            />
          </div>
        </div>
        
        <div class="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <i class="fa-solid fa-clock"></i>
          <span>{{ formatDate(new Date(task.deadline)) }}</span>
        </div>
      </div>
      
      <ConfirmationModal
        :is-open="isDeleteModalOpen"
        title="Удалить задачу?"
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
import { defineProps, defineEmits, ref, onMounted } from 'vue';
import { TaskDetail } from '../../../widgets/taskdetail';
import { TaskEditPanel } from '../../../widgets/taskeditpanel';
import { ConfirmationModal } from '../../../shared/ui/ConfirmationModal';
import { supabaseHelper } from '../../../shared/api/sbHelper';

const props = defineProps<{
  task: Task;
}>();

const emit = defineEmits(['edit', 'delete', 'freeze', 'hide']);

const isOpen = ref(false);
const isDeleting = ref(false);
const isEditPanelOpen = ref(false);
const isDeleteModalOpen = ref(false);

const majorTaskName = ref('');

onMounted(async () => {
  const result = await supabaseHelper.fetchMajorTaskName(props.task.majorTaskId);
  majorTaskName.value = result.name;
});

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
  emit('edit', props.task.id);
  isEditPanelOpen.value = true;
}

const handleDeleteTask = async () => {
  emit('delete', props.task.id);
  isDeleting.value = true;
}

const handleHideTask = async () => {
  emit('hide', props.task.id);
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
/* Container for the card */
div[class*="w-82"] {
  position: relative;
}

/* Buttons container */
div[class*="absolute"] {
  position: absolute;
  top: 0.5rem; /* Adjust as needed */
  right: 0.5rem; /* Adjust as needed */
  display: flex;
  gap: 4px;
}
</style>
