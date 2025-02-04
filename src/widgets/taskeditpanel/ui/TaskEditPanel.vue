<template>
  <Transition
    enter-active-class="transition-transform duration-300"
    leave-active-class="transition-transform duration-300"
    enter-from-class="translate-x-full"
    leave-to-class="translate-x-full"
  >
    <div
      v-if="isOpen"
      @click.stop
      class="fixed right-0 top-0 bottom-0 w-[400px] bg-zinc-900 shadow-xl z-50 overflow-y-auto p-8"
    >
      <button
        @click="$emit('close')"
        class="absolute top-4 right-4 text-white text-xl hover:text-zinc-300"
      >
        <i class="fa-solid fa-xmark"></i>
      </button>

      <div class="flex flex-col gap-6">
        <!-- Заголовок -->
        <h2 class="text-2xl font-bold text-white">Редактирование задачи</h2>

        <!-- Форма редактирования -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Название задачи -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Название задачи
            </label>
            <input
              v-model="formData.name"
              type="text"
              required
              class="w-full bg-bg-accent-dark rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <!-- Описание -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Описание
            </label>
            <TextEditor
              @click.stop
              v-model="formData.description"
              class="bg-bg-accent-dark rounded-md"
            />
          </div>

          <!-- Статус -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Статус
            </label>
            <select
              v-model="formData.status"
              class="w-full bg-bg-accent-dark rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="planned">Запланировано</option>
              <option value="progress">В работе</option>
              <option value="done">Завершено</option>
            </select>
          </div>

          <!-- Приоритет -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Приоритет
            </label>
            <select
              v-model="formData.priority"
              class="w-full bg-bg-accent-dark rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option :value="1">Низкий</option>
              <option :value="2">Средний</option>
              <option :value="3">Высокий</option>
            </select>
          </div>

          <!-- Дедлайн -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Дедлайн
            </label>
            <input
              v-model="formData.deadline"
              type="datetime-local"
              class="w-full bg-bg-accent-dark rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <!-- Кнопки -->
          <div class="flex gap-4 justify-end">
            <button
              type="button"
              @click="$emit('close')"
              class="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-blue-600 rounded-md text-white hover:bg-blue-700 transition-colors"
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
import { ref, watch, defineProps, defineEmits } from "vue";
import { TextEditor } from "@/widgets/editor";
import { updateTask } from "@/shared/api/sbHelper";
import type { Task } from "@/entities/task/types";

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
  deadline: props.task.deadline ? formatDateTime(props.task.deadline) : null,
});

const isSubmitting = ref(false);

// Форматирование даты для datetime-local
function formatDateTime(date: string | Date) {
  const d = new Date(date);
  return d.toISOString().slice(0, 16);
}

// Обновляем форму при изменении задачи
watch(
  () => props.task,
  (newTask) => {
    formData.value = {
      name: newTask.name,
      description: newTask.description,
      status: newTask.status,
      priority: newTask.priority,
      deadline: newTask.deadline ? formatDateTime(newTask.deadline) : null,
    };
  }
);

const handleSubmit = async () => {
  try {
    isSubmitting.value = true;

    const updatedData = {
      ...formData.value,
      deadline: formData.value.deadline
        ? new Date(formData.value.deadline)
        : null,
    };

    await updateTask(props.task.id, updatedData);

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
