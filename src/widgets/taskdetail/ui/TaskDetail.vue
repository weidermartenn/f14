<template>
  <Transition
    enter-active-class="transition-transform duration-300"
    leave-active-class="transition-transform duration-300"
    enter-from-class="-translate-x-full"
    leave-to-class="-translate-x-full"
  >
    <div
      v-if="isOpen"
      class="fixed left-0 top-0 bottom-0 w-[400px] bg-neutral-900 shadow-xl z-50 overflow-y-auto p-8"
    >
      <button
        @click="$emit('close')"
        class="absolute top-4 right-4 text-white text-xl hover:text-zinc-300"
      >
        <i class="fa-solid fa-xmark"></i>
      </button>

      <div class="flex flex-col gap-6">
        <!-- Заголовок -->
        <h2 class="text-2xl font-bold text-white">{{ task.name }}</h2>

        <!-- Статус и приоритет -->
        <div class="flex gap-3 items-center">
          <span
            :class="[
              'px-3 py-1 rounded-full text-sm text-white',
              {
                'bg-zinc-600': task.status === 'planned',
                'bg-amber-500': task.status === 'progress',
                'bg-emerald-600': task.status === 'done',
              },
            ]"
          >
            {{ getStatusLabel(task.status) }}
          </span>
          <span
            :class="[
              'px-3 py-1 rounded-full text-sm text-white',
              {
                'bg-emerald-700': task.priority === 1,
                'bg-amber-600': task.priority === 2,
                'bg-red-800': task.priority === 3,
              },
            ]"
          >
            {{ getPriorityLabel(task.priority) }}
          </span>
        </div>

        <!-- Описание -->
        <div class="bg-bg-accent-dark p-2 rounded-md">
          <h3 class="text-lg text-white">Описание</h3>
          <div
            class="text-zinc-300 prose prose-invert break-words"
            v-html="task.description || 'Нет описания'"
          ></div>
        </div>

        <!-- Даты -->
        <div class="space-y-1 text-zinc-400">
          <div class="flex justify-between">
            <span>Создана:</span>
            <span>{{ formatDate(task.createdAt) }}</span>
          </div>
          <div v-if="task.deadline" class="flex justify-between">
            <span>Дедлайн:</span>
            <span>{{ formatDate(task.deadline) }}</span>
          </div>
        </div>

        <!-- Метки -->
        <div v-if="task.labels?.length" class="space-y-2">
          <h3 class="text-lg text-white">Метки</h3>
          <div
            class="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-2"
          >
            <Label
              v-for="label in task.labels"
              :key="label"
              :label="label"
              class="h-8"
            />
          </div>
        </div>

        <!-- Вложения -->
        <div class="space-y-2">
          <h3 class="text-lg text-white">Прикрепленные файлы</h3>
          <div v-if="attachmentsLoading" class="text-gray-400 text-sm">
            Загрузка файлов...
          </div>
          <div v-else-if="attachmentsError" class="text-red-500 text-sm">
            Ошибка загрузки файлов
          </div>
          <div v-else-if="!attachments.length" class="text-gray-400 text-sm">
            Вложения отсутствуют
          </div>
          <ul v-else class="space-y-2">
            <li
              v-for="(file, index) in attachments"
              :key="index"
              class="flex items-center gap-2 text-blue-500 hover:text-blue-400 group"
            >
              <i
                :class="[
                  fileIcon(fileExtension(file.name)),
                  'text-lg w-5 flex-shrink-0',
                ]"
              ></i>
              <a
                :href="file.url"
                target="_blank"
                class="truncate hover:underline flex-1"
                :download="file.name"
              >
                {{ file.name }}
              </a>
              <button
                @click.stop="downloadFile(file)"
                class="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white"
              >
                <i class="fa-solid fa-download text-sm"></i>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import type { Task } from "../../../entities/task/types";
import { fileIcon } from "../../../pages/createTask/model/extensions";
import { Label } from "../../../widgets/label";
import { ref, watch } from 'vue';
import { supabaseHelper } from "../../../shared/api/sbHelper";

const props = defineProps({
  task: {
    type: Object as () => Task,
    required: true,
  },
  isOpen: {
    type: Boolean,
  },
});

const emit = defineEmits(["close"]);

const attachments = ref<Array<{name: string; url: string; type: string}>>([]);
const attachmentsLoading = ref(false);
const attachmentsError = ref(false);

type TaskStatus = "planned" | "progress" | "done";

const fileExtension = (filename: string) => {
  return filename.split('.').pop()?.toLowerCase() || 'file';
};

const statusLabels: Record<TaskStatus, string> = {
  planned: "Запланировано",
  progress: "В работе",
  done: "Завершено",
};

const getStatusLabel = (status: string) => {
  const validStatus = status as TaskStatus;
  return statusLabels[validStatus] || status;
};

const getPriorityLabel = (priority: number) => {
  switch (priority) {
    case 1:
      return "Низкий";
    case 2:
      return "Средний";
    case 3:
      return "Высокий";
    default:
      return "Не указан";
  }
};

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const downloadFile = async (file: {url: string; name: string}) => {
  try {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error('Ошибка скачивания файла:', err);
  }
};

const loadAttachments = async () => {
  try {
    attachmentsLoading.value = true;
    attachmentsError.value = false;
    
    console.log('Loading files for:', {
      projectId: props.task.projectId,
      taskId: props.task.id
    });
    
    const files = await supabaseHelper.fetchTaskFiles(props.task.projectId, props.task.id);
    console.log('Received files:', files);
    
    attachments.value = files;
  } catch (err) {
    attachmentsError.value = true;
    console.error('Attachment loading failed:', err);
  } finally {
    attachmentsLoading.value = false;
  }
};

watch(() => props.task, async (newTask) => {
  if (newTask && props.isOpen) {
    try {
      attachmentsLoading.value = true;
      attachmentsError.value = false;
      attachments.value = await supabaseHelper.fetchTaskFiles(newTask.projectId, newTask.id);
    } catch (err) {
      attachmentsError.value = true;
    } finally {
      attachmentsLoading.value = false;
    }
  }
}, { immediate: true });

// Загружаем файлы при открытии
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    loadAttachments();
  }
});

// Обновляем при изменении задачи
watch(() => props.task, () => {
  if (props.isOpen) {
    loadAttachments();
  }
});
</script>

<style scoped></style>
