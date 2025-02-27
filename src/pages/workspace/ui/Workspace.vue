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
    <div class="bg-zinc-400 dark:bg-zinc-900 min-w-[1200px] max-h-[1100px] rounded-md mt-4">
      <div class="w-full flex justify-center items-center p-4">
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
      <div>
        <KanbanBoard :projectId="projectId" :projectName="projectName" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { KanbanBoard } from "../../../widgets/kanban/";
import { ref, watch } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const projectId = ref<string | undefined>(
  typeof route.query.projectId === "string" ? route.query.projectId : undefined
);
const projectName = ref<string | undefined>(
  typeof route.query.name === "string" ? route.query.name : undefined
);

// Список всех пунктов
const pages = ["Все задачи", "Доска задач", "Диаграмма Ганта", "Аналитика", "Все действия"];
const currentPage = ref(0); // Текущий активный пункт

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