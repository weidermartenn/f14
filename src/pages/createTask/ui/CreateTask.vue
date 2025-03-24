<template>
  <ConfirmationModal
    :isOpen="isErrorModalOpen"
    title="Ошибка"
    message="Пожалуйста, введите название задачи"
    confirmText="OK"
    cancelText=""
    @confirm="isErrorModalOpen = false"
  />
  <div class="mt-28 flex flex-col items-center gap-4 px-4">
    <div>
      <button
        @click="router.back"
        class="flex items-center gap-2 hover:text-gray-300"
      >
        <i class="fa-solid fa-chevron-left"></i>
        <span>Вернуться назад</span>
      </button>
    </div>
    <div
      class="bg-bg-accent-dark p-8 rounded-lg shadow-lg w-full md:w-[90%] lg:w-[70%] grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4"
    >
      <!-- Первый столбец -->
      <div>
        <span class="text-xl text-gray-300 ml-2">
          Создание задачи для проекта
          <code class="text-f14-font-dark bg-bg-dark rounded-md px-2 ml-2">
            {{ projectName }}
          </code>
        </span>
        <Input
          type="text"
          v-model="name"
          placeholder="Название"
          class="rounded-md p-2 w-full max-w-md"
        />
        <TextEditor v-model="description" />
      </div>

      <!-- Второй столбец -->
      <div
        class="flex flex-col gap-4 bg-bg-dark rounded-md p-4 overflow-y-auto max-h-[550px] max-w-[400px] w-full"
      >
        <span>Выполнить до:</span>
        <DatePicker v-model="selectedDate!!" placeholder="Выберите дату" />
        <div class="flex mt-4 gap-4 items-center">
          <span>Приоритет:</span>
          <select v-model="priority" class="bg-bg-accent-dark rounded-md p-2 cursor-pointer">
            <option value="1">Низкий</option>
            <option value="2">Средний</option>
            <option value="3">Высокий</option>
          </select>
        </div>

        <div class="mt-4">
          <span>Метки</span>
          <!--Выбранные метки-->
          <div
            v-if="selectedLabels.length > 0"
            class="flex flex-wrap gap-2 mt-2 max-w-full overflow-hidden"
          >
            <div
              v-for="(label, index) in selectedLabels"
              :key="label.id"
              class="flex items-center gap-2 bg-blue-500 text-white rounded-md px-2 py-1 text-sm max-w-[150px]"
            >
              <span class="truncate">{{ label.label }}</span>
              <button
                @click="removeLabel(index)"
                class="text-white hover:text-red-500"
              >
                <i class="fa-solid fa-xmark"></i>
              </button>
            </div>
          </div>
          <div v-else>
            <span class="text-xs text-gray-300"
              >Вы не выбрали ни одной метки</span
            >
          </div>
        </div>
        <div
          v-if="labels.length > 0"
          class="grid grid-cols-2 sm:grid-cols-3 gap-2"
        >
          <Label
            class="h-8"
            v-for="labelItem in labels"
            :key="labelItem.id"
            :label="labelItem.label"
            :class="{
              'opacity-50 cursor-not-allowed': isLabelSelected(labelItem),
            }"
            @click="toggleLabel(labelItem)"
          />
        </div>

        <div v-else>
          <LoadingSpinner />
        </div>

        <!-- Кнопка и форма добавления новой метки -->
        <div
          v-if="isAddingLabel"
          class="flex items-center justify-center gap-2"
        >
          <Input
            type="text"
            v-model="newLabel"
            placeholder="Новая метка"
            class="h-9"
          />
          <button
            @click="confirmAddLabel"
            class="w-10 h-6 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            <i class="fa-solid fa-check"></i>
          </button>
          <button
            @click="cancelAddLabel"
            class="w-10 h-6 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <button
          v-else
          @click="startAddLabel"
          class="h-8 flex items-center justify-center bg-gray-700 text-white rounded-md hover:bg-gray-600"
        >
          <span>+</span>
        </button>

        <div class="flex gap-4 items-center mt-6">
          <label for="file-input" class="cursor-pointer">
            <span
              class="bg-blue-500 text-xs text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
              Прикрепить файлы
            </span>
          </label>
          <input
            id="file-input"
            type="file"
            multiple
            class="hidden"
            @change="handleFileInput"
          />
        </div>
        <span class="text-xs text-gray-400"
          >Максимальное количество файлов: 5</span
        >

        <div v-if="selectedFiles.length > 0" class="mt-4">
          <ul class="space-y-2">
            <li
              v-for="(file, index) in selectedFiles"
              :key="index"
              class="flex items-center text-gray-300 gap-2"
            >
              <i class="text-md" :class="getIcon(file)"></i>
              <span class="text-xs">{{ file.name }}</span>
              <button
                @click="removeFile(index)"
                class="text-red-500 hover:text-red-700"
              >
                <i class="fa-solid fa-xmark"></i>
              </button>
            </li>
          </ul>
        </div>
        <button
          @click="createTask"
          class="mt-10 flex justify-center gap-2 bg-blue-500 text-white rounded-md px-4 py-2 hover:bg-blue-600"
        >
          Создать
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from "vue-router";
import { ref, onMounted } from "vue";
import { Input } from "../../../shared/ui/Input";
import { TextEditor } from "../../../widgets/editor";
import { DatePicker } from "../../../shared/ui/DatePicker";
import { Label } from "../../../widgets/label";
import type { TLabel } from '../../../entities/label/types';
import { supabaseHelper } from "../../../shared/api/sbHelper";
import { LoadingSpinner } from "../../../shared/ui/LoadingSpinner";
import { fileIcon } from "../model/extensions";
import { generateId } from "../../../shared/lib/generateId";
import { ConfirmationModal } from "../../../shared/ui/ConfirmationModal";

const router = useRouter();
const route = useRoute();
const description = ref("");
const priority = ref("1");

const projectName = ref(route.query.name || "");
const projectId = ref(route.query.id || "");

const labels = ref<TLabel[]>([]);
const selectedLabels = ref<TLabel[]>([]);
const isAddingLabel = ref(false);
const newLabel = ref("");

const isErrorModalOpen = ref(false);

onMounted(async () => {
  labels.value = await supabaseHelper.fetchLabels();
});

const name = ref("");

const selectedDate = ref<Date | null>(new Date());
const selectedFiles = ref<File[]>([]);

const handleFileInput = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;

  if (files && files.length > 5) {
    alert("Максимальное количество файлов: 5");
    target.value = "";
  } else if (files) {
    selectedFiles.value = Array.from(files);
  }
};

const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1);
};

const getIcon = (file: File) => {
  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  return fileIcon(extension);
};

const startAddLabel = () => {
  isAddingLabel.value = true;
};

const confirmAddLabel = async () => {
  if (newLabel.value.trim()) {
    try {
      const label = {
        id: Date.now(), // Временное решение, пока сервер не вернет настоящий ID
        label: newLabel.value
      };
      await supabaseHelper.addLabel(label);
      labels.value = await supabaseHelper.fetchLabels();
      newLabel.value = "";
      isAddingLabel.value = false;
    } catch (error) {
      console.error("Ошибка при добавлении метки:", error);
    }
  }
};

const cancelAddLabel = () => {
  newLabel.value = "";
  isAddingLabel.value = false;
};

const toggleLabel = (label: TLabel) => {
  if (isLabelSelected(label)) {
    removeLabelFromSelected(label);
  } else {
    addLabelToSelected(label);
  }
};

const isLabelSelected = (label: TLabel) => {
  return selectedLabels.value.some(
    (selectedLabel: TLabel) => selectedLabel.id === label.id
  );
};

const addLabelToSelected = (label: TLabel) => {
  selectedLabels.value.push(label);
};

const removeLabel = (index: number) => {
  selectedLabels.value.splice(index, 1);
};

const removeLabelFromSelected = (label: TLabel) => {
  selectedLabels.value = selectedLabels.value.filter(
    (selectedLabel: TLabel) => selectedLabel.id !== label.id
  );
};

const createTask = async () => {
  try {
    const taskId = generateId();
    const projectIdStr = Array.isArray(projectId.value) 
      ? projectId.value[0] 
      : projectId.value;

    if (!projectIdStr) {
      alert("Проект не найден");
      return router.back();
    }

    if (!name.value.trim()) {
      isErrorModalOpen.value = true;
      return;
    }

    const cleanDescription = description.value.replace(/<[^>]+>/gm, "").trim();

    const taskData = {
      id: taskId,
      name: name.value,
      description: cleanDescription.length > 0 ? description.value : null,
      createdAt: new Date().toISOString(),
      deadline: selectedDate.value!!.toISOString(),
      priority: parseInt(priority.value),
      labels: selectedLabels.value.map((l: TLabel) => l.label),
      status: "planned" as const,
      projectId: projectIdStr,
      isFrozen: false,
      isVisible: true,
    };
    
    await supabaseHelper.addTask(projectIdStr, taskData);
    await supabaseHelper.createTaskFolder(projectIdStr, taskId);
    await supabaseHelper.uploadFiles(projectIdStr, taskId, selectedFiles.value);

    router.back();
  } catch (error) {
    console.error("Ошибка при создании задачи:", error);
  }
};
</script>

<style scoped>
/* Дополнительные стили, если нужно */
</style>
