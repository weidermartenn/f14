<template>
  <div class="flex flex-col items-center gap-4 p-4 min-h-screen">
    <div class="flex flex-col items-center gap-1">
      <span class="text-sm text-gray-400">Перемещайте задачи между колонками с помощью перетаскивания и нажатием кнопки</span>
      <span class="text-sm text-gray-400">Для более подробного просмотра задач нажмите на задачу</span>
    </div>

    <!-- Контейнер для плашки и доски -->
    <div class="flex items-center gap-4">
      <!-- Плашка с подсказками -->
      <div id="tips" class="bg-bg-dark p-4 rounded-lg shadow-md shadow-black flex flex-col gap-3">
        <div class="flex items-center gap-2">
          <button class="hover:bg-gray-600 w-8 h-8 flex items-center justify-center rounded-full duration-150">
            <i class="fa-solid fa-pen-to-square text-gray-400"></i>
          </button>
          <span class="text-sm text-gray-400">Редактировать задачу</span>
        </div>
        <div class="flex items-center gap-2">
          <button class="hover:bg-gray-600 w-8 h-8 flex items-center justify-center rounded-full duration-150">
            <i class="fa-solid fa-snowflake text-gray-400"></i>
          </button>
          <span class="text-sm text-gray-400">Заморозить задачу</span>
        </div>
        <div class="flex items-center gap-2">
          <button class="hover:bg-gray-600 w-8 h-8 flex items-center justify-center rounded-full duration-150">
            <i class="fa-solid fa-eye-slash text-gray-400"></i>
          </button>
          <span class="text-sm text-gray-400">Скрыть задачу</span>
        </div>
        <div class="flex items-center gap-2">
          <button class="hover:bg-gray-600 w-8 h-8 flex items-center justify-center rounded-full duration-150">
            <i class="fa-regular fa-trash-can text-gray-400"></i>
          </button>
          <span class="text-sm text-gray-400">Удалить задачу</span>
        </div>
      </div>

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