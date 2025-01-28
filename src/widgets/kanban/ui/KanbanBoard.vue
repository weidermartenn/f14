<template>
  <div class="flex justify-center p-4 min-h-screen">
    <!-- Колонки -->
    <div class="flex gap-4 w-[1000px] h-[600px]">
      <div
        v-for="column in columns"
        :key="column.id"
        class="flex-1 bg-bg-accent-dark rounded-lg p-4 shadow-md shadow-black"
      >
        <div class="flex justify-center">
          <i :class="column.icon" class="text-3xl text-gray-400 mb-2"></i>
        </div>
        <h3 class="text-center text-white">{{ column.title }}</h3>
        <div class="mt-10 flex justify-center">
          <KanbanTaskCard />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from "vue";
import { KanbanTaskCard } from "..";

// Состояние колонок и задач
const columns = reactive([
  {
    id: "planned",
    title: "Запланировано",
    icon: "fa-regular fa-calendar",
  },
  {
    id: "progress",
    title: "В работе",
    icon: "fa-solid fa-bars-staggered",
  },
  {
    id: "done",
    title: "Завершено",
    icon: "fa-solid fa-check",
  },
]);
</script>