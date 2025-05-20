<template>
  <div class="p-4 w-full">
    <div v-if="loading" class="text-center">Loading...</div>
    <div v-else>
      <div v-for="majorTask in majorTasks" :key="majorTask.id" class="mb-6">
        <div @click="toggleExpand(majorTask.id)" class="bg-zinc-800 p-4 rounded-lg shadow-md mb-2 flex justify-between items-center hover:cursor-pointer hover:bg-zinc-700 duration-150">
          <h2 class="text-lg font-semibold">{{ majorTask.name }}</h2>
          <button @click="toggleExpand(majorTask.id)" class="text-gray-400 hover:text-white">
            <i :class="expandedMajorTasks.includes(majorTask.id) ? 'fa-solid fa-chevron-up' : 'fa-solid fa-chevron-down'"></i>
          </button>
        </div>
        <div v-if="expandedMajorTasks.includes(majorTask.id)" class="ml-4">
          <div v-for="task in tasksByMajorTask[majorTask.id]" :key="task.id" class="bg-gray-700 p-3 rounded-lg shadow-sm mb-2">
            <h3 class="text-lg">{{ task.name }}</h3>
            <div class="flex justify-between mt-2">
              <span class="text-xs">{{ formatDate(new Date(task.createdAt)) }}</span>
              <span class="text-xs">{{ getPriorityLabel(task.priority) }}</span>
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

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('ru-RU');
};

const getPriorityLabel = (priority: number) => {
  switch (priority) {
    case 1: return 'Низкий';
    case 2: return 'Средний';
    case 3: return 'Высокий';
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

onMounted(async () => {
  await fetchMajorTasks();
  await fetchTasks();
  loading.value = false;
});
</script>

<style scoped>
/* Add any custom styles here */
</style>
