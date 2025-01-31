<template>
  <div class="flex flex-col items-center gap-4 p-4 min-h-screen">
    <div class="flex flex-col items-center gap-1">
      <span class="text-sm text-gray-400"
        >Перемещайте задачи между колонками с помощью перетаскивания и нажатием
        кнопки</span
      >
      <span class="text-sm text-gray-400"
        >Для более подробного просмотра задач нажмите на задачу</span
      >
    </div>

    <div class="flex gap-6 items-center justify-center">
      <span>Добавить задачу</span>
      <button
        @click="handleAddTask"
        class="w-14 h-10 flex items-center justify-center text-3xl cursor-pointer border-2 border-gray-700 rounded-lg hover:border-blue-500 hover:text-blue-500 transition-colors"
      >
        +
      </button>
    </div>

    <div v-if="tasks.length === 0" class="text-center text-gray-400 mt-4">
      В этом проекте пока нет задач. Нажмите на кнопку выше, чтобы добавить новую задачу.
    </div>

    <div v-else class="mr-12 flex items-center gap-4 relative">
      <i
        id="info"
        class="fa-solid fa-circle-info text-2xl text-zinc-700 flex justify-center items-center w-8 h-8 rounded-full hover:bg-bg-accent-dark hover:text-zinc-500 duration-150"
        @mouseenter="showTips = true"
        @mouseleave="showTips = false"
      ></i>

      <Transition name="fade">
        <div
          v-if="showTips"
          id="tips"
          class="bg-bg-dark p-4 rounded-lg shadow-md shadow-black flex flex-col gap-3 absolute left-12 top-0"
        >
          <div class="flex items-center gap-2">
            <button
              class="hover:bg-gray-600 w-8 h-8 flex items-center justify-center rounded-full duration-150"
            >
              <i class="fa-solid fa-pen-to-square text-gray-400"></i>
            </button>
            <span class="text-sm text-gray-400">Редактировать задачу</span>
          </div>
          <div class="flex items-center gap-2">
            <button
              class="hover:bg-gray-600 w-8 h-8 flex items-center justify-center rounded-full duration-150"
            >
              <i class="fa-solid fa-snowflake text-gray-400"></i>
            </button>
            <span class="text-sm text-gray-400">Заморозить задачу</span>
          </div>
          <div class="flex items-center gap-2">
            <button
              class="hover:bg-gray-600 w-8 h-8 flex items-center justify-center rounded-full duration-150"
            >
              <i class="fa-solid fa-eye-slash text-gray-400"></i>
            </button>
            <span class="text-sm text-gray-400">Скрыть задачу</span>
          </div>
          <div class="flex items-center gap-2">
            <button
              class="hover:bg-gray-600 w-8 h-8 flex items-center justify-center rounded-full duration-150"
            >
              <i class="fa-regular fa-trash-can text-gray-400"></i>
            </button>
            <span class="text-sm text-gray-400">Удалить задачу</span>
          </div>
        </div>
      </Transition>

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
            <KanbanTaskCard
                v-for="task in tasksByColumn[column.id]"
                :key="task.id"
                :task="task"
              />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { KanbanTaskCard } from "..";
import { fetchTasks } from "@/shared/api/sbHelper";
import type { Task } from "@/entities/task/types";

const showTips = ref(false);
const router = useRouter();
const route = useRoute();
const projectId = route.query.projectId as string;
const tasks = ref<Task[]>([]);

const columns = reactive([
  { id: "planned", title: "Запланировано", icon: "fa-regular fa-calendar" },
  { id: "progress", title: "В работе", icon: "fa-solid fa-bars-staggered" },
  { id: "done", title: "Завершено", icon: "fa-solid fa-check" },
]);

const tasksByColumn = computed(() => {
  const groupedTasks: { [key: string]: Task[] } = {
    planned: [],
    progress: [],
    done: [],
  };
  tasks.value.forEach((task: Task) => {
    groupedTasks[task.status].push(task);
  });

  return groupedTasks;
});

const fetchProjectTasks = async () => {
  if (!projectId) return;
  tasks.value = await fetchTasks(projectId);
  console.log("Задачи : ",await fetchTasks(projectId));
};

const handleAddTask = () => {
  router.push({ name: "create-task", query: { projectId } });
};

onMounted(fetchProjectTasks);
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>
