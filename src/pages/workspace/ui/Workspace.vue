<template>
  <div class="flex flex-col items-center">
    <div class="flex flex-col items-center justify-center px-2 py-1 gap-4">
      <div>
        <button
          @click="$router.push({ name: 'projects' })"
          class="flex items-center gap-2 hover:text-gray-300 duration-150"
        >
          <i class="fa-solid fa-chevron-left hover:text-gray-300"></i>
          <span>Вернуться к проектам</span>
        </button>
      </div>
      <div>
        <span class="text-2xl">
          <code class="bg-bg-accent-dark text-white rounded-md px-2 py-1">{{
            projectName
          }}</code>
        </span>
      </div>
    </div>
    <div
      class="bg-zinc-400 dark:bg-zinc-900 w-full max-w-[1500px] h-[1000px] rounded-md mt-4 mb-20 flex flex-col"
    >
      <div class="w-full flex justify-center items-center p-4 shadow-lg">
        <!-- Контейнер для пунктов -->
        <div class="flex gap-8 items-center">
          <span
            v-for="(page, index) in pages"
            :key="index"
            :class="{
              'text-gray-400 scale-90': index !== currentPage,
              'scale-105': index === currentPage,
            }"
            class="cursor-pointer transition-colors duration-150"
            @click="currentPage = index"
          >
            {{ page }}
          </span>
        </div>
      </div>
      <div class="flex-1 overflow-auto p-4">
        <!-- Условное отображение компонентов -->
        <KanbanBoard
          v-if="currentPage === 1"
          :projectId="projectId"
          :projectName="projectName"
          class="h-full"
        />
        <div
          v-else-if="currentPage === 0"
          class="h-full flex items-center justify-center"
        >
          Все задачи (виджет будет добавлен позже)
        </div>
        <div
          v-else-if="currentPage === 2"
          class="h-full flex items-center justify-center"
        >
          Диаграмма Ганта (виджет будет добавлен позже)
        </div>
        <div
          v-else-if="currentPage === 3"
          class="h-full flex items-center justify-center"
        >
          Аналитика (виджет будет добавлен позже)
        </div>
        <div
          v-else-if="currentPage === 4"
          class="h-full flex items-center justify-center"
        >
          Все действия (виджет будет добавлен позже)
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { KanbanBoard } from "../../../widgets/kanban/";
import { ref, watch, onMounted } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const projectId = ref<string | undefined>(
  typeof route.query.projectId === "string" ? route.query.projectId : undefined
);
const projectName = ref<string | undefined>(
  typeof route.query.name === "string" ? route.query.name : undefined
);

// Список всех пунктов
const pages = [
  "Все задачи",
  "Доска задач",
  "Диаграмма Ганта",
  "Аналитика",
  "Все действия",
];
const currentPage = ref(0); // Текущий активный пункт

// Восстановление состояния вкладки из localStorage
onMounted(() => {
  const savedPage = localStorage.getItem("currentPage");
  if (savedPage !== null) {
    currentPage.value = parseInt(savedPage, 10);
  }
});

// Сохранение состояния вкладки в localStorage
watch(currentPage, (newPage) => {
  localStorage.setItem("currentPage", newPage.toString());
});

// Если route.query.projectId или route.query.name изменятся, обновите projectId и projectName
watch(
  () => route.query.projectId,
  (newProjectId) => {
    if (typeof newProjectId === "string") {
      projectId.value = newProjectId;
    } else {
      projectId.value = undefined;
    }
  }
);

watch(
  () => route.query.name,
  (newName) => {
    if (typeof newName === "string") {
      projectName.value = newName;
    } else {
      projectName.value = undefined;
    }
  }
);
</script>

<style scoped>
/* Дополнительные стили, если нужно */
</style>
