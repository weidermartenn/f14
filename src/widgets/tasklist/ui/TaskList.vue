<template>
  <div class="p-4 w-full">
    <div v-if="loading" class="text-center">Loading...</div>
    <div v-else>
      <!-- Sorting and Filtering Controls -->
      <div class="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <div class="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <input
            v-model="sortByName"
            placeholder="Сортировать по названию"
            class="bg-gray-300 dark:bg-gray-700 text-zinc-800 dark:text-white px-4 py-2 rounded-md w-full md:w-64"
          />
          <div class="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <input
              v-model="startDate"
              type="date"
              class="bg-gray-300 dark:bg-gray-700 text-zinc-800 dark:text-white px-4 py-2 rounded-md w-full md:w-auto"
            />
            <input
              v-model="endDate"
              type="date"
              class="bg-gray-300 dark:bg-gray-700 text-zinc-800 dark:text-white px-4 py-2 rounded-md w-full md:w-auto"
            />
            <button
              @click="sortByDateRange"
              class="bg-gray-300 dark:bg-gray-700 text-zinc-800 dark:text-white px-4 py-2 rounded-md hover:bg-gray-600 w-full md:w-auto"
            >
              Сортировать по дате
            </button>
          </div>
        </div>
        <div class="w-full md:w-auto">
          <select
            v-model="selectedMajorTaskId"
            @change="filterByMajorTask"
            class="bg-gray-300 dark:bg-gray-700 text-zinc-800 dark:text-white px-4 py-2 rounded-md w-full md:w-auto"
          >
            <option value="">Все группы задач</option>
            <option v-for="majorTask in majorTasks" :key="majorTask.id" :value="majorTask.id">
              {{ majorTask.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Task List -->
      <div v-for="majorTask in filteredMajorTasks" :key="majorTask.id" class="mb-6">
        <div
          @click="toggleExpand(majorTask.id)"
          class="bg-gray-300 dark:bg-zinc-800 p-4 rounded-lg shadow-md mb-2 flex justify-between items-center hover:cursor-pointer hover:bg-zinc-700 duration-150"
        >
          <h2 class="text-lg text-zinc-800 dark:text-f14-font-dark font-semibold">{{ majorTask.name }}</h2>
          <button @click.stop="toggleExpand(majorTask.id)" class="text-zinc-700 dark:text-gray-400 dark:hover:text-white">
            <i :class="expandedMajorTasks.includes(majorTask.id) ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'"></i>
          </button>
        </div>
        <div v-if="expandedMajorTasks.includes(majorTask.id)" class="ml-4">
          <div
            v-for="task in sortedTasksByMajorTask[majorTask.id]"
            :key="task.id"
            class="bg-zinc-300 dark:bg-bg-dark p-4 rounded-lg shadow-sm mb-2 transition-all duration-300 hover:shadow-lg"
          >
            <h3 class="text-lg text-zinc-800 dark:text-f14-font-dark font-medium">{{ task.name }}</h3>
            <p class="text-sm text-zinc-700 dark:text-gray-300 mt-2">{{ stripHtmlTags(task.description || '') }}</p>
            <div class="flex flex-col md:flex-row justify-between mt-4 gap-2">
              <span class="text-md text-zinc-700 dark:text-gray-300">Создано: {{ formatDate(new Date(task.createdAt)) }}</span>
              <span class="text-md text-zinc-700 dark:text-gray-300">Дедлайн: {{ formatDate(new Date(task.deadline)) }}</span>
            </div>
            <div class="flex flex-col md:flex-row justify-between mt-2 gap-2">
              <span class="text-sm text-zinc-700 dark:text-gray-300">Приоритет: {{ getPriorityLabel(task.priority) }}</span>
              <span class="text-sm text-zinc-700 dark:text-gray-300">Статус: {{ getTaskStatus(task.status) }}</span>
            </div>
            <div v-if="task.labels && task.labels.length > 0" class="mt-2">
              <span class="text-sm text-zinc-700 dark:text-gray-300">Метки:</span>
              <div class="flex flex-wrap gap-2 mt-1">
                <span
                  v-for="(label, index) in task.labels"
                  :key="index"
                  class="bg-blue-500 text-white text-md px-2 py-1 rounded-md min-w-20 text-center"
                >
                  {{ label }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { supabaseHelper } from '../../../shared/api/sbHelper';
import type { MajorTask } from '../../../entities/majortask/types';
import type { Task } from '../../../entities/task/types';

const props = defineProps({
  projectId: {
    type: String,
    required: true,
  },
});

const majorTasks = ref<MajorTask[]>([]);
const tasks = ref<Task[]>([]);
const loading = ref(true);
const expandedMajorTasks = ref<string[]>([]);
const selectedMajorTaskId = ref<string>("");
const sortByName = ref<string>("");
const startDate = ref<string>("");
const endDate = ref<string>("");

const fetchMajorTasks = async () => {
  try {
    const data = await supabaseHelper.fetchMajorTasks(props.projectId);
    majorTasks.value = data;
  } catch (error) {
    console.error("Error fetching major tasks:", error);
  }
};

const fetchTasks = async () => {
  try {
    const data = await supabaseHelper.fetchTasks(props.projectId);
    tasks.value = data;
  } catch (error) {
    console.error("Error fetching tasks:", error);
  }
};

const tasksByMajorTask = computed(() => {
  const groupedTasks: { [key: string]: Task[] } = {};
  tasks.value.forEach((task: Task) => {
    if (!groupedTasks[task.majorTaskId]) {
      groupedTasks[task.majorTaskId] = [];
    }
    groupedTasks[task.majorTaskId].push(task);
  });
  return groupedTasks;
});

const filteredMajorTasks = computed(() => {
  if (!selectedMajorTaskId.value) {
    return majorTasks.value.filter(majorTask =>
      tasksByMajorTask.value[majorTask.id] && tasksByMajorTask.value[majorTask.id].length > 0
    );
  }
  return majorTasks.value.filter(majorTask => majorTask.id === selectedMajorTaskId.value);
});

const sortedTasksByMajorTask = computed(() => {
  const sortedTasks: { [key: string]: Task[] } = {};

  Object.keys(tasksByMajorTask.value).forEach(majorTaskId => {
    let tasksToSort = [...tasksByMajorTask.value[majorTaskId]];

    if (sortByName.value) {
      tasksToSort = tasksToSort.filter(task => task.name.toLowerCase().includes(sortByName.value.toLowerCase()));
    }

    if (startDate.value && endDate.value) {
      const start = new Date(startDate.value).getTime();
      const end = new Date(endDate.value).getTime();
      tasksToSort = tasksToSort.filter(task => {
        const taskDate = new Date(task.createdAt).getTime();
        return taskDate >= start && taskDate <= end;
      });
    }

    sortedTasks[majorTaskId] = tasksToSort;
  });

  return sortedTasks;
});

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('ru-RU');
};

const stripHtmlTags = (htmlString: string | null | undefined) => {
  if (!htmlString) return '';
  return htmlString.replace(/<[^>]*>/g, '');
};

const getPriorityLabel = (priority: number) => {
  switch (priority) {
    case 1: return 'Низкий';
    case 2: return 'Средний';
    case 3: return 'Высокий';
    default: return 'Не указан';
  }
};

const getTaskStatus = (status: string) => {
  switch (status) {
    case 'planned': return 'Запланировано';
    case 'progress': return 'В работе';
    case 'done': return 'Завершено';
    default: return 'Не указан';
  }
};

const toggleExpand = (majorTaskId: string) => {
  if (expandedMajorTasks.value.includes(majorTaskId)) {
    expandedMajorTasks.value = expandedMajorTasks.value.filter(id => id !== majorTaskId);
  } else {
    expandedMajorTasks.value.push(majorTaskId);
  }
};

const sortByDateRange = () => {
  // Sorting by date range is handled by the computed property `sortedTasksByMajorTask`
};

const filterByMajorTask = () => {
  // Filtering by major task is handled by the computed property `filteredMajorTasks`
};

onMounted(async () => {
  await fetchMajorTasks();
  await fetchTasks();
  loading.value = false;
});
</script>

<style scoped>
/* Responsive styles */
@media (max-width: 768px) {
  .flex-col {
    flex-direction: column;
  }
  .gap-4 {
    gap: 1rem;
  }
  .w-full {
    width: 100%;
  }
}
</style>
