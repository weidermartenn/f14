<template>
  <div class="px-20 py-10 min-h-[calc(100vh-180px)]">
    <h2 class="text-3xl mt-4 py-2 mb-4 border-b-2 border-gray-700">Все проекты</h2>
    <span class="text-gray-300"
      >Ниже отображаются все созданные вами проекты.</span
    >

    <button
      @click="handleCreateProject"
      class="w-14 h-10 mt-6 flex items-center justify-center text-3xl cursor-pointer border-2 border-gray-700 rounded-lg hover:border-blue-500 hover:text-blue-500 transition-colors"
    >
      +
    </button>

    <!-- Загрузка проектов -->
    <div v-if="loading" class="mt-10 flex justify-center">
      <LoadingSpinner />
    </div>

    <!-- Состояние ошибки-->
    <div v-else-if="error" class="mt-10 text-center flex justify-center">
      Ошибка: {{ error }}
    </div>

    <!-- Состояние, когда проектов нет -->
    <div
      v-else-if="projects.length === 0"
      class="mt-10 text-center flex justify-center"
    >
      Проектов пока нет.
    </div>

    <!-- Отображение проектов -->
    <div
      v-else
      class="w-full mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-6 gap-4"
    >
      <ProjectCard
        v-for="project in projects"
        :key="project.id"
        :project="project"
        @edit="handleProjectUpdate"
        @delete="handleProjectDelete"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import ProjectCard from "./ProjectCard.vue";
import LoadingSpinner from "../../../shared/ui/LoadingSpinner/ui/LoadingSpinner.vue";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { user } from "../../../shared/lib/auth";
import { fetchProjects } from "../../../shared/api/sbHelper";
import type { Project } from "../../../entities/project/types";

const projects = ref<Project[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const router = useRouter();

const loadProjects = async () => {
  try {
    if (!user.value?.email) {
      throw new Error("Пользователь не авторизован.");
    }

    loading.value = true;
    error.value = null;

    const data = await fetchProjects(user.value.email);
    projects.value = data;
  } catch (err) {
    console.error("Ошибка при загрузке проектов:", err); // Логируем ошибку
    error.value = err as string;
  } finally {
    loading.value = false;
  }
};

const handleProjectUpdate = (updatedProject: Project) => {
  projects.value = projects.value.map((p: Project) =>
    p.id === updatedProject.id ? updatedProject : p
  );
};

const handleProjectDelete = async (deletedProject: Project) => {
  projects.value = projects.value.filter(
    (p: Project) => p.id !== deletedProject.id
  );
  await loadProjects();
};

const handleCreateProject = () => {
  router.push("/create-new-project");
};

onMounted(() => {
  if (user.value) {
    loadProjects();
  }
});
</script>

<style scoped></style>
