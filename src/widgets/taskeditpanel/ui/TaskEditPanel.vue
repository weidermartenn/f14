<template>
  <!-- Blur Background -->
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

  <!-- Task Panel -->
  <Transition
    enter-active-class="transition-transform duration-300 ease-out"
    leave-active-class="transition-transform duration-200 ease-in"
    enter-from-class="translate-x-full"
    enter-to-class="translate-x-0"
    leave-from-class="translate-x-0"
    leave-to-class="translate-x-full"
  >
    <div
      v-if="isOpen"
      class="fixed right-0 top-0 bottom-0 w-full max-w-[420px] bg-neutral-800 shadow-2xl z-50 overflow-y-auto border-l border-neutral-700 animate-glow"
    >
      <button
        @click="$emit('close')"
        class="absolute top-4 right-4 text-neutral-400 hover:text-white transition-all duration-200 rounded-full hover:bg-neutral-700 active:scale-90 p-1"
      >
        <i class="fa-solid fa-xmark text-xl"></i>
      </button>

      <div class="flex flex-col gap-6">
        <!-- Header -->
        <div class="sticky top-0 bg-neutral-800/90 backdrop-blur-sm z-10 p-6 pb-4 border-b border-neutral-700">
          <h2 class="text-2xl font-bold text-white truncate drop-shadow-md">Редактирование задачи</h2>
        </div>

        <!-- Edit Form -->
        <form @submit.prevent="handleSubmit" class="space-y-6 p-6">
          <!-- Task Name -->
          <div>
            <label class="block text-sm font-medium text-neutral-300 mb-2">
              Название задачи
            </label>
            <input
              v-model="formData.name"
              type="text"
              required
              class="w-full bg-neutral-700 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          <!-- Назначенный -->
          <div>
            <label class="block text-sm font-medium text-neutral-300 mb-2">
              Ответственный
            </label>
            <select
              v-model="formData.user_id"
              class="w-full bg-neutral-700 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option v-for="user in users" :key="user.id" :value="user.id">
                {{ user.email.split('@')[0] }}
              </option>
            </select>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-neutral-300 mb-2">
              Описание
            </label>
            <TextEditor
              @click.stop
              v-model="formData.description!!"
              class="bg-neutral-700 rounded-md transition-all duration-200"
            />
          </div>

          <!-- Status -->
          <div>
            <label class="block text-sm font-medium text-neutral-300 mb-2">
              Статус
            </label>
            <select
              v-model="formData.status"
              class="w-full bg-neutral-700 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option value="planned">Запланировано</option>
              <option value="progress">В работе</option>
              <option value="done">Завершено</option>
            </select>
          </div>

          <!-- Priority -->
          <div>
            <label class="block text-sm font-medium text-neutral-300 mb-2">
              Приоритет
            </label>
            <select
              v-model="formData.priority"
              class="w-full bg-neutral-700 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            >
              <option :value="1">Низкий</option>
              <option :value="2">Средний</option>
              <option :value="3">Высокий</option>
            </select>
          </div>

          <!-- Deadline -->
          <div>
            <label class="block text-sm font-medium text-neutral-300 mb-2">
              Дедлайн
            </label>
            <input
              v-model="formData.deadline"
              type="datetime-local"
              class="w-full bg-neutral-700 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          <!-- Buttons -->
          <div class="flex gap-4 justify-end">
            <button
              type="button"
              @click="$emit('close')"
              class="px-4 py-2 text-neutral-300 hover:text-white transition-colors duration-200"
            >
              Отмена
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 rounded-md text-white hover:bg-blue-700 transition-colors duration-200"
              :disabled="isSubmitting"
            >
              <span v-if="isSubmitting">Сохранение...</span>
              <span v-else>Сохранить изменения</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits, onMounted } from "vue";
import { user } from "../../../shared/lib/auth";
import { useRoute } from "vue-router";
import { TextEditor } from "../../../widgets/editor";
import { supabaseHelper } from "../../../shared/api/sbHelper";
import type { Task } from "../../../entities/task/types";
import { generateId } from "../../../shared/lib/generateId";

const userId = ref("");
const users = ref<{ id: string; email: string }[]>([]);

const route = useRoute();

onMounted(async () => {
  userId.value = await supabaseHelper.getUserId(user.value?.email as string);

  // Fetch users for the organization
  const orgId = await supabaseHelper.fetchProject(props.task.projectId);
  if (orgId) {
    const emails = await supabaseHelper.fetchOrgMembers(orgId.orgId);
    users.value = await Promise.all(
      emails.map(async (email: string) => {
        const userId = await supabaseHelper.getUserId(email);
        return { id: userId, email };
      })
    );
  }
});

const props = defineProps({
  task: {
    type: Object as () => Task,
    required: true,
  },
  isOpen: Boolean,
});

const emit = defineEmits(["close", "updated", "notify"]);

const formData = ref({
  name: props.task.name,
  description: props.task.description,
  status: props.task.status,
  priority: props.task.priority,
  deadline: props.task.deadline ? formatDateTime(props.task.deadline) : undefined,
  user_id: props.task.user_id,
});

const isSubmitting = ref(false);

// Format date for datetime-local
function formatDateTime(date: string | Date) {
  const d = new Date(date);
  return d.toISOString().slice(0, 16);
}

// Update form when task changes
watch(
  () => props.task,
  (newTask) => {
    formData.value = {
      name: newTask.name,
      description: newTask.description,
      status: newTask.status,
      priority: newTask.priority,
      deadline: newTask.deadline ? formatDateTime(newTask.deadline) : undefined,
      user_id: newTask.user_id,
    };
  }
);

const handleSubmit = async () => {
  try {
    isSubmitting.value = true;

    const updatedData = {
      ...formData.value,
      deadline: formData.value.deadline
        ? formData.value.deadline
        : undefined,
    };

    await supabaseHelper.updateTask(props.task.id, updatedData);

    const newName = formData.value.name !== props.task.name ? formData.value.name : props.task.name;

    if (formData.value.user_id !== props.task.user_id) {
      const oldUserEmail = await supabaseHelper.getUserEmail(props.task.user_id);
      const newUserEmail = await supabaseHelper.getUserEmail(formData.value.user_id);

      await supabaseHelper.createLogEntry({
        id: generateId(),
        action: "Изменен ответственный за задачу",
        name: `Задача: ${props.task.name}, Ответственный: ${oldUserEmail.split('@')[0]} ⭢ ${newUserEmail.split('@')[0]}`,
        createdAt: new Date().toISOString(),
        userId: userId.value,
        orgId: route.params.orgId as string,
        projectId: props.task.projectId,
        taskId: props.task.id,
      });
    }

    if (props.task.name !== newName) {
      await supabaseHelper.createLogEntry({
        id: generateId(),
        action: "Изменена название задачи",
        name: `${props.task.name} ⭢ ${newName}`,
        createdAt: new Date().toISOString(),
        userId: userId.value,
        orgId: route.params.orgId as string,
        projectId: props.task.projectId,
        taskId: props.task.id,
      });
    }

    emit("updated", { ...props.task, ...updatedData });
    emit("notify", { type: "success", message: "Задача успешно обновлена" });
    emit("close");
  } catch (error) {
    console.error("Ошибка обновления задачи:", error);
    emit("notify", { type: "error", message: "Ошибка при обновлении задачи" });
  } finally {
    isSubmitting.value = false;
  }
};
</script>


<style scoped>
/* Glow Animation */
.animate-glow {
  border-left-color: #3b82f6;
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

/* Blur Transition */
.backdrop-blur-sm {
  transition: backdrop-filter 300ms ease-out, background-color 300ms ease-out;
}
</style>
