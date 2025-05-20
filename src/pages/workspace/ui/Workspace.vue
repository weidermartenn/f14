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
          class="h-full flex"
        >
          <TaskList :projectId="projectId" />
        </div>
        <div v-else-if="currentPage === 2" class="flex flex-col justify-center items-center">
          <div class="gantt-view-controls w-full">
            <button @click="changeViewMode('Day')" :class="{ active: viewMode === 'Day' }">День</button>
            <button @click="changeViewMode('Week')" :class="{ active: viewMode === 'Week' }">Неделя</button>
            <button @click="changeViewMode('Month')" :class="{ active: viewMode === 'Month' }">Месяц</button>
          </div>
          <GanttDiagram
            ref="ganttRef"
            :tasks="ganttTasks"
            :holidays="holidays"
            :initial-options="ganttOptions"
          />
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
import { GanttDiagram } from "../../../widgets/gantt";
import { TaskList } from "../../../widgets/tasklist";
import { supabaseHelper } from "../../../shared/api/sbHelper";

interface GanttTask {
  id: string;
  name: string;
  start: string;
  end: string;
  dependencies?: string;
}

interface Holiday {
  date: string;
  name: string;
}

const route = useRoute();
const projectId = ref<string>(
  typeof route.query.projectId === "string" ? route.query.projectId : ""
);
const projectName = ref<string | undefined>(
  typeof route.query.name === "string" ? route.query.name : undefined
);

const ganttRef = ref<InstanceType<typeof GanttDiagram> | null>(null);
const viewMode = ref<'Day' | 'Week' | 'Month'>('Week');
const ganttError = ref<string | null>(null);

// Настройки диаграммы Ганта
const ganttOptions = ref({
  view_mode: viewMode.value,
  bar_height: 25,
  bar_corner_radius: 5,
  view_mode_select: false,
  today_button: false
});

// Данные для диаграммы
const ganttTasks = ref<GanttTask[]>([]);

// Список праздников
const holidays = ref<Holiday[]>([
  { date: '2023-10-04', name: 'День города' },
  { date: '2023-11-06', name: 'День народного единства' }
]);

// Список всех пунктов
const pages = [
  "Все задачи",
  "Доска задач",
  "Диаграмма Ганта",
  "Аналитика",
  "Все действия",
];
const currentPage = ref(0);

// Методы для работы с диаграммой
const changeViewMode = (mode: 'Day' | 'Week' | 'Month') => {
  viewMode.value = mode;
  ganttOptions.value.view_mode = mode;
  if (ganttRef.value) {
    ganttRef.value.changeViewMode(mode);
  }
};

// Восстановление состояния вкладки из localStorage
onMounted(async () => {
  try {
    const savedPage = localStorage.getItem("currentPage");
    if (savedPage !== null) {
      currentPage.value = parseInt(savedPage, 10);
    }

    // Fetch tasks from the database
    if (projectId.value) {
      const fetchedTasks = await supabaseHelper.fetchTasks(projectId.value);
      ganttTasks.value = await Promise.all(fetchedTasks.map(async task => {
        const dependencies = await supabaseHelper.fetchTaskDependencies(task.id);
        return {
          id: task.id,
          name: task.name,
          start: task.createdAt.split('T')[0], // Assuming createdAt is a valid date string
          end: task.deadline.split('T')[0], // Assuming deadline is a valid date string
          dependencies: dependencies.map(dep => dep.depends_on_task_id).join(',')
        };
      }));
    }
  } catch (error) {
    console.error("Ошибка инициализации:", error);
    ganttError.value = error instanceof Error ? error.message : 'Ошибка загрузки диаграммы';
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
      projectId.value = "";
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
.gantt-view-controls {
  display: flex;
  gap: 10px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
  margin-bottom: 10px;
}

.gantt-view-controls button {
  padding: 5px 10px;
  border-radius: 4px;
  border: 1px solid #dee2e6;
  background: white;
  cursor: pointer;
}

.gantt-view-controls button.active {
  background: #4e79a7;
  color: white;
  border-color: #4e79a7;
}

.gantt-view-controls .today-btn {
  background: #f28e2b;
  color: white;
  border-color: #f28e2b;
}

.gantt-container {
  height: calc(100% - 50px);
  background: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
</style>
