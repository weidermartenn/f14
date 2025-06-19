<template>
  <!-- Блюр фона -->
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    leave-active-class="transition-all duration-200 ease-in"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isOpen"
      @click="$emit('close')"
      class="fixed inset-0 z-40 backdrop-blur-sm bg-black/30"
    ></div>
  </Transition>

  <!-- Панель задачи -->
  <Transition
    enter-active-class="transition-transform duration-300 ease-out"
    leave-active-class="transition-transform duration-200 ease-in"
    enter-from-class="-translate-x-full"
    enter-to-class="translate-x-0"
    leave-from-class="translate-x-0"
    leave-to-class="-translate-x-full"
  >
    <div
      v-if="isOpen"
      class="fixed inset-0 w-full max-w-[420px] bg-neutral-800 shadow-2xl z-50 overflow-y-auto border-r-2 border-neutral-700 animate-glow"
    >
      <!-- Заголовок и кнопка закрытия -->
      <div class="sticky top-0 bg-neutral-800/90 backdrop-blur-sm z-10 p-6 pb-4 border-b border-neutral-700">
        <div class="flex justify-between items-start gap-4">
          <h2 class="text-2xl font-bold text-white truncate drop-shadow-md">{{ task.name }}</h2>
          <button
            @click="$emit('close')"
            class="flex-shrink-0 p-1 text-neutral-400 hover:text-white transition-all duration-200 rounded-full hover:bg-neutral-700 active:scale-90"
          >
            <i class="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <!-- Статус и приоритет -->
        <div class="flex gap-2 mt-3 flex-wrap">
          <span
            :class="[
              'px-3 py-1 rounded-full text-xs font-medium tracking-wide transition-all duration-200',
              {
                'bg-neutral-700 text-neutral-300 hover:bg-neutral-600': task.status === 'planned',
                'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30': task.status === 'progress',
                'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30': task.status === 'done',
              },
            ]"
          >
            {{ getStatusLabel(task.status) }}
          </span>
          <span
            :class="[
              'px-3 py-1 rounded-full text-xs font-medium tracking-wide transition-all duration-200',
              {
                'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30': task.priority === 1,
                'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30': task.priority === 2,
                'bg-red-500/20 text-red-400 hover:bg-red-500/30': task.priority === 3,
              },
            ]"
          >
            {{ getPriorityLabel(task.priority) }}
          </span>
        </div>
      </div>

      <!-- Основное содержимое -->
      <div class="p-6 space-y-6">
        <!-- Описание -->
        <div class="space-y-2">
          <h3 class="text-sm font-semibold text-neutral-400 uppercase tracking-wider">Описание</h3>
          <div
            class="text-neutral-300 prose prose-invert prose-sm break-words bg-neutral-700/50 rounded-lg p-4 transition-all duration-200 hover:bg-neutral-700/70"
            v-html="task.description || '<p class=\'text-neutral-500\'>Нет описания</p>'"
          ></div>
        </div>

        <!-- Назначенный -->
         <div class="space-y-2">
            <h3 class="text-sm font-semibold text-neutral-400 uppercase tracking-wider">Ответственный: </h3>
            <div
              class="text-neutral-300 prose prose-invert prose-sm break-words bg-neutral-700/50 rounded-lg p-4 transition-all duration-200 hover:bg-neutral-700/70"
              v-html="username || '<p class=\'text-neutral-500\'>Нет ответственного</p>'"
            ></div>
         </div>

        <!-- Даты -->
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-neutral-400 uppercase tracking-wider">Даты</h3>
          <div class="space-y-2">
            <div class="flex justify-between items-center hover:bg-neutral-700/30 p-2 rounded transition-colors duration-200">
              <span class="text-neutral-400">Создана:</span>
              <span class="text-neutral-300 font-medium">{{ formatDate(task.createdAt) }}</span>
            </div>
            <div
              v-if="task.deadline"
              class="flex justify-between items-center hover:bg-neutral-700/30 p-2 rounded transition-colors duration-200"
            >
              <span class="text-neutral-400">Дедлайн:</span>
              <span
                :class="[
                  'font-medium',
                  isDeadlinePassed(task.deadline) ? 'text-red-400' : 'text-neutral-300'
                ]"
              >
                {{ formatDate(task.deadline) }}
                <span
                  v-if="isDeadlinePassed(task.deadline)"
                  class="ml-1 text-xs text-red-400 animate-pulse"
                >
                  (просрочено)
                </span>
              </span>
            </div>
          </div>
        </div>

        <!-- Метки -->
        <div v-if="task.labels?.length" class="space-y-3">
          <h3 class="text-sm font-semibold text-neutral-400 uppercase tracking-wider">Метки</h3>
          <div class="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-2">
            <Label
              v-for="label in task.labels"
              :key="label"
              :label="label"
              class="h-7 transition-transform duration-200 hover:scale-105"
            />
          </div>
        </div>

        <!-- Вложения -->
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-neutral-400 uppercase tracking-wider">Вложения</h3>

          <div v-if="attachmentsLoading" class="flex items-center justify-center py-4">
            <div class="animate-spin text-neutral-500">
              <i class="fa-solid fa-spinner"></i>
            </div>
            <span class="ml-2 text-neutral-400 animate-pulse">Загрузка файлов...</span>
          </div>

          <div
            v-else-if="attachmentsError"
            class="bg-red-900/20 border border-red-800/50 rounded-lg p-3 text-center animate-fade-in"
          >
            <p class="text-red-400 text-sm">Ошибка загрузки файлов</p>
            <button
              @click="loadAttachments"
              class="mt-2 text-xs text-red-300 hover:text-white underline transition-colors duration-200"
            >
              Попробовать снова
            </button>
          </div>

          <div
            v-else-if="!attachments.length"
            class="text-center py-4 text-neutral-500 text-sm animate-fade-in"
          >
            Нет прикрепленных файлов
          </div>

          <ul v-else class="space-y-2 animate-fade-in">
            <TransitionGroup name="list">
              <li
                v-for="(file, index) in attachments"
                :key="index"
                class="group flex items-center gap-3 p-2 rounded-lg hover:bg-neutral-700/50 transition-all duration-200 hover:shadow-lg"
              >
                <div
                  :class="[
                    'flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300 group-hover:scale-110',
                    getFileTypeClass(fileExtension(file.name))
                  ]"
                >
                  <i
                    :class="[
                      fileIcon(fileExtension(file.name)),
                      'text-lg text-white/80 transition-transform duration-300 group-hover:scale-125'
                    ]"
                  ></i>
                </div>

                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-neutral-300 truncate">{{ file.name }}</p>
                  <p class="text-xs text-neutral-500">{{ formatFileSize(file.size) }}</p>
                </div>

                <button
                  @click.stop="downloadFile(file)"
                  class="opacity-0 group-hover:opacity-100 transition-all duration-300 p-2 text-neutral-400 hover:text-white hover:bg-neutral-600/50 rounded-full"
                  :title="`Скачать ${file.name}`"
                >
                  <i class="fa-solid fa-download"></i>
                </button>
              </li>
            </TransitionGroup>
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
import { ref, watch, onMounted } from 'vue';
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
const username = ref("");

interface Attachment {
  name: string;
  url: string;
  type: string;
  size?: number;
}

const attachments = ref<Attachment[]>([]);
const attachmentsLoading = ref(false);
const attachmentsError = ref(false);

type TaskStatus = "planned" | "progress" | "done";

const fileExtension = (filename: string) => {
  return filename.split('.').pop()?.toLowerCase() || 'file';
};

const getFileTypeClass = (ext: string) => {
  const image = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  const archive = ['zip', 'rar', '7z', 'tar', 'gz'];
  const document = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
  const code = ['js', 'ts', 'html', 'css', 'json', 'xml'];

  if (image.includes(ext)) return 'bg-blue-500/20 group-hover:bg-blue-500/30';
  if (archive.includes(ext)) return 'bg-purple-500/20 group-hover:bg-purple-500/30';
  if (document.includes(ext)) return 'bg-emerald-500/20 group-hover:bg-emerald-500/30';
  if (code.includes(ext)) return 'bg-amber-500/20 group-hover:bg-amber-500/30';
  return 'bg-neutral-700 group-hover:bg-neutral-600';
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

const isDeadlinePassed = (deadline: string | Date) => {
  return new Date(deadline) < new Date();
};

const formatFileSize = (bytes?: number) => {
  if (!bytes) return 'Неизвестный размер';
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} КБ`;
  return `${(bytes / 1048576).toFixed(1)} МБ`;
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

    const files = await supabaseHelper.fetchTaskFiles(props.task.projectId, props.task.id);
    attachments.value = files.map(file => ({
      ...file,
      size: file.size || 0
    }));
  } catch (err) {
    attachmentsError.value = true;
    console.error('Attachment loading failed:', err);
  } finally {
    attachmentsLoading.value = false;
  }
};

watch(() => props.task, async (newTask) => {
  if (newTask && props.isOpen) {
    await loadAttachments();
  }
}, { immediate: true });

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    loadAttachments();
  }
});

onMounted( async () => {
  username.value = (await supabaseHelper.getUserEmail(props.task.user_id)).split("@")[0];
});
</script>

<style scoped>
/* Анимации */
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Анимация списка */
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.list-leave-active {
  position: absolute;
  width: calc(100% - 1.5rem);
}

/* Плавность блюра */
.backdrop-blur-sm {
  transition: backdrop-filter 300ms ease-out, background-color 300ms ease-out;
}

/* Параллакс-эффект */
.bg-neutral-800 {
  background-attachment: fixed;
}

/* Анимация свечения границы */
.animate-glow {
  border-right-color: #3b82f6;
  animation: glow 2s infinite;
}

@keyframes glow {
  0% {
    box-shadow: 0 0 5px #0c377a;
  }
  50% {
    box-shadow: 0 0 10px #0c377a, 0 0 30px #1d4ed8;
  }
  100% {
    box-shadow: 0 0 5px #0c377a;
  }
}
</style>
