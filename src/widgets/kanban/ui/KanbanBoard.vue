<template>
  <div class="flex flex-col items-center gap-4 p-4 min-h-screen">
    <div class="flex flex-col items-center gap-1">
      <span class="text-sm text-gray-400"
        >Перемещайте задачи между колонками с помощью перетаскивания</span
      >
      <span class="text-sm text-gray-400"
        >Для более подробного просмотра задач нажмите на задачу</span
      >
    </div>

    <div class="flex gap-6 items-center justify-center">
      <span>Добавить задачу</span>
      <button
        @click="handleAddTask"
        class="w-12 h-8 flex items-center justify-center text-xl cursor-pointer border-2 border-gray-700 rounded-lg hover:border-blue-500 hover:text-blue-500 transition-colors"
      >
        +
      </button>
    </div>

    <div v-if="tasks.length === 0" class="text-center text-gray-400 mt-4">
      В этом проекте пока нет задач. Нажмите на кнопку выше, чтобы добавить
      новую задачу.
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
          class="bg-bg-dark p-4 rounded-lg shadow-md shadow-black flex flex-col gap-3 absolute left-12 top-0 z-50"
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
          class="flex-1 bg-bg-accent-dark rounded-lg p-4 shadow-md shadow-black flex flex-col"
        >
          <div class="flex justify-center">
            <i :class="column.icon" class="text-3xl text-gray-400 mb-2"></i>
          </div>
          <h3 class="text-center text-white">{{ column.title }}</h3>
          <draggable
            :list="tasksByColumn[column.id]"
            group="tasks"
            item-key="id"
            class="mt-10 flex flex-col gap-2 overflow-y-auto flex-1"
            @change="(event) => handleTaskMove(event, column.id)"
            @move="onDragMove"
            @end="onDragEnd"
          >
            <template #item="{ element }">
              <Transition name="fade">
                <div class="relative">
                  <div
                    v-if="!loadingTasks[element.id]"
                    class="transition-opacity duration-300"
                  >
                    <KanbanTaskCard
                      :task="element"
                      @delete="handleDeleteTask"
                      :class="{ 'border-indicator': element.isIndicator }"
                      class="cursor-move"
                    />
                  </div>
                  <div
                    v-if="loadingTasks[element.id]"
                    class="absolute inset-0 flex items-center justify-center"
                  >
                    <LoadingSpinner />
                  </div>
                </div>
              </Transition>
            </template>
          </draggable>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed, provide } from "vue";
import { useRouter, useRoute } from "vue-router";
import { KanbanTaskCard } from "..";
import { fetchTasks, updateTask, deleteTask, fetchLabels } from "@/shared/api/sbHelper";
import type { Task } from "@/entities/task/types";
import { LoadingSpinner } from "@/shared/ui/LoadingSpinner";
import draggable from "vuedraggable";

const showTips = ref(false);
const router = useRouter();
const route = useRoute();
const projectId = route.query.projectId as string;
const tasks = ref<Task[]>([]);

const loadingTasks = ref<Record<string, boolean>>({});

const handleDeleteTask = async (taskId: string) => {
  loadingTasks.value[taskId] = true;
  try {
    await deleteTask(taskId);
    tasks.value = tasks.value.filter((task: Task) => task.id !== taskId);
  } catch (err) {
    console.error(err);
  } finally {
    delete loadingTasks.value[taskId];
  }
}

const props = defineProps({
  projectId: String,
  projectName: String,
});

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
};

const handleAddTask = () => {
  router.push({
    name: "create-task",
    query: { id: props.projectId, name: props.projectName },
  });
};

const handleTaskMove = async (event: any, newStatus: string) => {
  const { added, moved } = event;
  const task = added?.element || moved?.element;

  if (task) {
    task.status = newStatus;
    await updateTask(task.id, { status: newStatus });
  }
};

const onDragMove = (event: any) => {
  const { related } = event;
  const relatedElement = related.element as Task;

  // Убираем индикатор у всех карточек
  tasks.value.forEach((task: Task) => (task.isIndicator = false));

  // Добавляем индикатор к карточке, над которой находится перетаскиваемая карточка
  if (relatedElement) {
    relatedElement.isIndicator = true;
  }
};

const onDragEnd = () => {
  // Убираем индикатор у всех карточек после завершения перетаскивания
  tasks.value.forEach((task: Task) => (task.isIndicator = false));
};

onMounted(async () => {
  await fetchProjectTasks();
});

</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.border-indicator {
  border-bottom: 2px solid #3bf6ae; /* Синий бордер для индикатора */
}
</style>
