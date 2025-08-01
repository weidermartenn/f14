<template>
  <div>
    <div
      class="w-full h-32 bg-gray-300 dark:bg-zinc-900 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col justify-between"
      :class="{ 'border-2 border-blue-500': isSelected }"
      @click="handleSelect"
    >
      <div class="flex justify-between items-center">
        <h3 class="text-lg text-zinc-800 dark:text-gray-300 font-semibold truncate max-w-[70%]">{{ project.name }}</h3>
        <div class="relative">
          <button
            @click.stop="toggleMenu"
            class="w-6 h-6 flex items-center justify-center hover:bg-gray-600 rounded-full duration-150"
            :class="{ 'rotate-90': isMenuOpen }"
          >
            <i class="fa-solid fa-ellipsis"></i>
          </button>
          <div
            v-if="isMenuOpen"
            class="absolute right-0 top-8 bg-zinc-800 rounded-md shadow-lg w-auto z-10"
          >
            <button
              @click.stop="handleEdit"
              class="w-full px-4 py-2 hover:bg-gray-700 duration-150 rounded-md"
            >
              Изменить
            </button>
            <button
              @click.stop="handleDelete"
              class="w-full px-4 py-2 hover:bg-gray-700 duration-150 rounded-md"
            >
              Удалить
            </button>
          </div>
        </div>
      </div>
      <div class="flex justify-between items-center">
        <p class="text-zinc-700 dark:text-gray-300 text-sm">
          Создан: {{ formatDate(project.createdAt) }}
        </p>
        <button @click.stop="handleRedirect(project.id)" class="hover:text-gray-400 duration-150">Перейти</button>
      </div>
    </div>
    <div v-if="isEditOpen" class="mt-4 space-y-2">
      <Input type="text" v-model="editedName" />
      <div class="flex gap-2">
        <button
          @click="saveChanges"
          class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
          :disabled="isSaving"
        >
          {{ isSaving ? "Сохраняем..." : "Сохранить" }}
        </button>
        <button
          @click="cancelEdit"
          class="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded-md"
        >
          Отменить
        </button>
      </div>
    </div>

    <ConfirmationModal
      :is-open="isDeleteModalOpen"
      title="Удалить проект?"
      :message="`Вы уверены, что хотите удалить проект ${props.project.name}? Это действие нельзя отменить.`"
      confirm-text="Удалить"
      :is-loading="isDeleting"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref, watch } from "vue";
import { Input } from "../../../shared/ui/Input";
import type { Project } from "../../../entities/project/types";
import { supabaseHelper } from "../../../shared/api/sbHelper";
import { ConfirmationModal } from "../../../shared/ui/ConfirmationModal";
import { useRouter } from "vue-router";

const props = defineProps<{
  project: Project;
  isSelected: boolean;
}>();

const router = useRouter();

const emit = defineEmits(["edit", "delete", "select"]);

const isMenuOpen = ref(false);
const isEditOpen = ref(false);
const isSaving = ref(false);
const isDeleteModalOpen = ref(false);
const isDeleting = ref(false);
const editedName = ref("");

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const handleSelect = () => {
  emit("select", props.project.id);
};
const handleRedirect = (projectId: string) => {
  router.push({ name: 'workspace', query: { name: props.project.name, projectId: projectId } });
};

const handleEdit = () => {
  editedName.value = props.project.name;
  isEditOpen.value = true;
  isMenuOpen.value = false;
};

const saveChanges = async () => {
  if (!editedName.value.trim()) return;
  isSaving.value = true;

  try {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const updatedProject = await supabaseHelper.updateProjectName(
      props.project.id,
      editedName.value
    );

    emit("edit", updatedProject);

    isEditOpen.value = false;
  } catch (err) {
    console.error("Ошибка при сохранении изменений:", err);
  } finally {
    isSaving.value = false;
  }
};

const cancelEdit = () => {
  isEditOpen.value = false;
  editedName.value = "";
};

const handleDelete = () => {
  isDeleteModalOpen.value = true;
  isMenuOpen.value = false;
}

const confirmDelete = async () => {
  isDeleting.value = true;
  try {
    await supabaseHelper.deleteProject(props.project.id);
    emit("delete", props.project.id);
    isDeleteModalOpen.value = false;
  } catch (err) {
    console.error("Ошибка при удалении проекта:", err);
  } finally {
    isDeleting.value = false;
  }
}

const cancelDelete = () => {
  isDeleteModalOpen.value = false;
}

watch(
  () => props.project.name,
  (newVal) => {
    editedName.value = newVal;
  }
);

const formatDate = (date: Date) => {
  return date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
</script>

<style scoped></style>
