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
        <div v-else-if="currentPage === 2" class="h-full">
          <div class="gantt-view-controls">
            <button @click="changeViewMode('Day')" :class="{ active: viewMode === 'Day' }">День</button>
            <button @click="changeViewMode('Week')" :class="{ active: viewMode === 'Week' }">Неделя</button>
            <button @click="changeViewMode('Month')" :class="{ active: viewMode === 'Month' }">Месяц</button>
            <button @click="scrollToToday" class="today-btn">Сегодня</button>
          </div>
          <GanttDiagram
            ref="ganttRef"
            :tasks="tasks"
            :holidays="holidays"
            :initial-options="ganttOptions"
            @task-click="handleTaskClick"
            class="gantt-container"
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

    <!-- Модальное окно для редактирования задачи -->
    <div v-if="selectedTask" class="modal-overlay">
      <div class="modal-content">
        <h3>Редактирование задачи</h3>
        <div class="form-group">
          <label>Название</label>
          <input v-model="selectedTask.name" class="form-control">
        </div>
        <div class="form-group">
          <label>Прогресс</label>
          <input
            v-model.number="selectedTask.progress"
            type="range"
            min="0"
            max="100"
            class="form-range"
          >
          <span>{{ selectedTask.progress }}%</span>
        </div>
        <div class="form-group">
          <label>Дата начала</label>
          <input
            v-model="selectedTask.start"
            type="date"
            class="form-control"
          >
        </div>
        <div class="form-group">
          <label>Дата окончания</label>
          <input
            v-model="selectedTask.end"
            type="date"
            class="form-control"
          >
        </div>
        <div class="modal-actions">
          <button @click="saveTask" class="btn btn-primary">Сохранить</button>
          <button @click="selectedTask = null" class="btn btn-outline-secondary">Отмена</button>
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

interface Task {
  id: string;
  name: string;
  start: string;
  end: string;
  progress: number;
  dependencies?: string;
}

interface Holiday {
  date: string;
  name: string;
}

const route = useRoute();
const projectId = ref<string | undefined>(
  typeof route.query.projectId === "string" ? route.query.projectId : undefined
);
const projectName = ref<string | undefined>(
  typeof route.query.name === "string" ? route.query.name : undefined
);

const ganttRef = ref<InstanceType<typeof GanttDiagram> | null>(null);
const viewMode = ref<'Day' | 'Week' | 'Month'>('Week');
const selectedTask = ref<Task | null>(null);
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
const tasks = ref<Task[]>([
  {
    id: 'task1',
    name: 'Разработка API',
    start: '2023-10-01',
    end: '2023-10-05',
    progress: 50
  },
  {
    id: 'task2',
    name: 'Тестирование',
    start: '2023-10-06',
    end: '2023-10-10',
    progress: 30
  },
  {
    id: 'task3',
    name: 'Документация',
    start: '2023-10-11',
    end: '2023-10-15',
    progress: 10
  }
]);

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

const scrollToToday = () => {
  if (ganttRef.value) {
    ganttRef.value.scrollToToday();
  }
};

const handleTaskClick = (task: Task) => {
  selectedTask.value = { ...task };
};

const saveTask = () => {
  if (!selectedTask.value) return;

  const index = tasks.value.findIndex(t => t.id === selectedTask.value?.id);
  if (index !== -1) {
    tasks.value[index] = { ...selectedTask.value };
    if (ganttRef.value) {
      ganttRef.value.updateTask(selectedTask.value.id, selectedTask.value);
    }
  }
  selectedTask.value = null;
};

// Восстановление состояния вкладки из localStorage
onMounted(() => {
  try {
    const savedPage = localStorage.getItem("currentPage");
    if (savedPage !== null) {
      currentPage.value = parseInt(savedPage, 10);
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 25px;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}
</style>
