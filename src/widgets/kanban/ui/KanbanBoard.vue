<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center mb-4">
      <h1 class="text-2xl font-bold">Kanban Board</h1>
      <Button @click="showModal = true">Добавить задачу</Button>
    </div>

    <div class="flex flex-col md:flex-row gap-4 overflow-x-auto pb-4">
      <TaskColumn
        v-for="column in columns"
        :key="column.id"
        :column="column"
        @task-moved="moveTask"
      />
    </div>

    <AddTaskModal
      v-if="showModal"
      @close="showModal = false"
      @submit="handleAddTask"
    />
  </div>
</template>

<script setup lang="ts">
import TaskColumn from "@/features/tasks/TaskColumn.vue";
import AddTaskModal from "./AddTaskModal.vue";
import { ref } from 'vue';
import { useTasks } from '@features/tasks/useTasks';
import Button from '@shared/ui/Button';

const { columns, addTask, moveTask } = useTasks();
const showModal = ref(flase);

const handleAddTask = (task) => {
    addTask(task);
    showModal.value = false;
};

</script>

<style scoped></style>
