<template>
  <div class="flex flex-col items-center gap-4 p-4 min-h-screen dark:bg-gray-900">
    <div class="flex flex-col items-center gap-1">
      <span class="text-sm text-zinc-700 dark:text-gray-400"
        >Перемещайте задачи между колонками с помощью перетаскивания</span
      >
      <span class="text-sm text-zinc-700 dark:text-gray-400"
        >Для более подробного просмотра задач нажмите на задачу</span
      >
    </div>

    <div class="flex gap-6 items-center justify-center">
      <span class=" text-zinc-900 dark:text-white">Добавить задачу</span>
      <button
        @click="handleAddTask"
        class="w-12 h-8 flex items-center justify-center text-xl cursor-pointer border-2 border-gray-700 rounded-lg hover:border-blue-500 hover:text-blue-500 transition-colors"
      >
        +
      </button>
    </div>

    <div class="mr-12 flex items-center gap-4 relative">
      <i
        id="info"
        class="fa-solid fa-circle-info text-2xl text-zinc-700 flex justify-center items-center w-8 h-8 rounded-full hover:bg-gray-700 hover:text-zinc-500 duration-150"
        @mouseenter="showTips = true"
        @mouseleave="showTips = false"
      ></i>

      <Transition name="fade">
        <div
          v-if="showTips"
          id="tips"
          class="bg-bg-accent-dark p-4 rounded-lg shadow-md shadow-black flex flex-col gap-3 absolute left-12 top-0 z-50"
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

      <div class="grid grid-cols-3 gap-4">
        <div
          v-for="column in columns"
          :key="column.id"
          class="flex-1 bg-zinc-500 dark:bg-gray-800 rounded-lg p-4 shadow-md shadow-black flex flex-col min-h-[600px] max-h-[600px] min-w-[450px]"
        >
          <div class="flex justify-center">
            <i :class="column.icon" class="text-3xl text-gray-400 mb-2"></i>
          </div>
          <h3 class="text-center text-white">{{ column.title }}</h3>
          <draggable
            :list="tasksByColumn[column.id]"
            :move="checkMove"
            group="tasks"
            item-key="id"
            class="mt-10 flex flex-col gap-2 p-4 overflow-y-auto flex-1 custom-scrollbar"
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
                      @hide="handleHideTask"
                      @freeze="handleFreezeTask"
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

    <div v-if="tasks.length === 0" class="text-center text-zinc-800 dark:text-gray-400 mt-4">
      В этом проекте пока нет задач. Нажмите на кнопку выше, чтобы добавить
      новую задачу.
    </div>

    <div v-if="tasks.length > 0" class="mt-10 w-full px-4 flex justify-center">
      <div v-if="hiddenTasks.length > 0">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-2xl text-zinc-800 dark:text-gray-300">Скрытые задачи</span>
          <button
            @click="isHiddenExpanded = !isHiddenExpanded"
            class="text-gray-400 hover:text-white transition-colors"
          >
            <i
              :class="
                isHiddenExpanded
                  ? 'fa-solid fa-chevron-down'
                  : 'fa-solid fa-chevron-up'
              "
            ></i>
          </button>
        </div>

        <Transition name="slide">
          <div v-if="isHiddenExpanded" class="overflow-x-auto pb-4">
            <div class="flex gap-4 min-h-[200px]">
              <KanbanTaskCard
                v-for="task in hiddenTasks"
                :key="task.id"
                :task="task"
                class="flex-shrink-0 w-72"
                @edit="handleEditTask"
                @hide="handleHideTask"
                @freeze="handleFreezeTask"
                @delete="handleDeleteTask"
              />
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
  <Notification :notifications="notifications" @close="removeNotification" />
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from "vue";
import { generateId } from "../../../shared/lib/generateId";
import { user } from "../../../shared/lib/auth";
import { useRouter, useRoute } from "vue-router";
import { KanbanTaskCard } from "..";
import { supabaseHelper } from "../../../shared/api/sbHelper";
import type { Task } from "../../../entities/task/types";
import { LoadingSpinner } from "../../../shared/ui/LoadingSpinner";
import { Notification } from "../../../widgets/notification";
import draggable from "vuedraggable";

const showTips = ref(false);
const router = useRouter();
const route = useRoute();
const projectId = route.query.projectId as string;
const tasks = ref<Task[]>([]);

const userId = ref("");

const loadingTasks = ref<Record<string, boolean>>({});

const isHiddenExpanded = ref(false);

const notifications = ref<
  Array<{ id: string; message: string; type: "success" | "error" }>
>([]);
let notificationId = 0;

const addNotification = (
  message: string,
  type: "success" | "error" = "success"
) => {
  const id = `notify-${notificationId++}`;
  notifications.value.unshift({ id, message, type });

  if (notifications.value.length > 5) {
    notifications.value.pop();
  }

  setTimeout(() => {
    removeNotification(id);
  }, 3000);
};

const removeNotification = (id: string) => {
  notifications.value = notifications.value.filter((n) => n.id !== id);
};

const handleEditTask = async (taskId: string) => {
  tasks.value.find((task: Task) => task.id === taskId);
};

const handleDeleteTask = async (taskId: string) => {
  loadingTasks.value[taskId] = true;
  const task = tasks.value.find((task: Task) => task.id === taskId);

  if (task) {
    try {
      await supabaseHelper.deleteTask(taskId);

      tasks.value = tasks.value.filter((task: Task) => task.id !== taskId);

      await supabaseHelper.createLogEntry({
        id: generateId(),
        action: "Удалена задача",
        name: task.name,
        createdAt: new Date().toISOString(),
        userId: userId.value,
        orgId: "",
        projectId: task.projectId,
        taskId: task.id,
      })

      addNotification(`Задача "${task.name}" удалена`, "success");
    } catch (err) {
      addNotification("Ошибка удаления задачи", "error");
      console.error("Ошибка при удалении задачи:", err);
    }
  }
};

const handleHideTask = async (taskId: string) => {
  try {
    const task = tasks.value.find((task: Task) => task.id === taskId);

    if (task) {
      const newHideState = !task.isVisible;
      await supabaseHelper.updateTask(taskId, { isVisible: newHideState });
      task.isVisible = newHideState;

      addNotification(
        `Задача "${task.name}" ${
          newHideState ? "снова доступна" : "теперь скрыта"
        }`,
        "success"
      );
    }
  } catch (err) {
    addNotification("Ошибка скрытия задачи", "error");
    console.error("Ошибка при изменении состояния задачи:", err);
  }
};

const hiddenTasks = computed(() => {
  return tasks.value.filter((task: Task) => !task.isVisible);
});

const handleFreezeTask = async (taskId: string) => {
  try {
    const task = tasks.value.find((task: Task) => task.id === taskId);

    if (task) {
      const newFrozenState = !task.isFrozen;
      await supabaseHelper.updateTask(taskId, { isFrozen: newFrozenState });
      task.isFrozen = newFrozenState;

      addNotification(
        `Задача "${task.name}" ${
          newFrozenState ? "заморожена" : "разморожена"
        }`,
        "success"
      );
    }
  } catch (err) {
    addNotification("Ошибка заморозки задачи", "error");
    console.error("Ошибка при изменении состояния задачи:", err);
  }
};

const props = defineProps({
  projectId: {
    type: String,
    required: true,
    default: "",
  },
  projectName: {
    type: String,
    required: true,
    default: "",
  },
});

const columns = reactive([
  {
    id: "planned" as const,
    title: "Запланировано",
    icon: "fa-regular fa-calendar",
  },
  {
    id: "progress" as const,
    title: "В работе",
    icon: "fa-solid fa-bars-staggered",
  },
  { id: "done" as const, title: "Завершено", icon: "fa-solid fa-check" },
]);

const tasksByColumn = computed(() => {
  const groupedTasks: { [key: string]: Task[] } = {
    planned: [],
    progress: [],
    done: [],
  };
  tasks.value
    .filter((task: Task) => task.isVisible)
    .forEach((task: Task) => {
      groupedTasks[task.status].push(task);
    });

  return groupedTasks;
});

const fetchProjectTasks = async () => {
  if (!projectId) return;
  tasks.value = await supabaseHelper.fetchTasks(projectId);
};

const handleAddTask = () => {
  router.push({
    name: "create-task",
    query: { id: props.projectId, name: props.projectName },
  });
};

const checkMove = (event: any) => {
  return !event.draggedContext.element.isFrozen;
};

const handleTaskMove = async (
  event: any,
  newStatus: "planned" | "progress" | "done"
) => {
  const { added, moved } = event;
  const task = added?.element || moved?.element;

  if (task) {
    task.status = newStatus;
    await supabaseHelper.updateTask(task.id, { status: newStatus });
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
  userId.value = await supabaseHelper.getUserId(user.value?.email as string);
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

/* Анимация для раскрытия/сворачивания */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
  max-height: 500px; /* Максимальная ожидаемая высота */
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  max-height: 0;
}

/* Стили для горизонтального скролла */
.overflow-x-auto {
  scrollbar-width: thin;
  scrollbar-color: #3f3f46 #27272a;
}

.overflow-x-auto::-webkit-scrollbar {
  height: 8px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: #27272a;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background-color: #3f3f46;
  border-radius: 4px;
}

/* Дополнительные стили для улучшения внешнего вида */
.bg-gray-900 {
  background-color: #111827;
}

.shadow-md {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.hover\:text-blue-500:hover {
  color: #3b82f6;
}

.hover\:border-blue-500:hover {
  border-color: #3b82f6;
}

/* Стили для вертикального скролла */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #3f3f46 #27272a;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #27272a;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #3f3f46;
  border-radius: 4px;
}
</style>
