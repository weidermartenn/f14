<template>
  <div class="px-20 py-10">
    <h2 class="text-3xl mt-4">Все проекты</h2>
    <span class="text-gray-300"
      >Ниже отображаются все созданные вами проекты.</span
    >

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
    <div v-else class="w-full mt-10 flex flex-wrap gap-4">
      <ProjectCard
        v-for="project in projects"
        :key="project.id"
        :project="project"
      />

      <!-- Новая карточка для добавления проекта -->
      <div
          class="w-64 h-40 flex items-center justify-center cursor-pointer border-2 border-gray-300 rounded-lg shadow-md hover:border-blue-500 transition-colors"
        >
          <span class="text-4xl text-gray-300 hover:text-blue-500 transition-colors">+</span>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ProjectCard from "./ProjectCard.vue";
import LoadingSpinner from "@/shared/ui/LoadingSpinner/ui/LoadingSpinner.vue";
import { ref, onMounted, watch } from "vue";
import { supabase } from "@/shared/api/supabaseClient";
import type { Project } from "@/entities/project/types";
import { user } from "@/shared/lib/auth";
import { useRouter } from "vue-router";

const router = useRouter();
const projects = ref<Project[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const fetchProjects = async () => {
  try {
    if (!user.value?.email) {
      throw new Error("Пользователь не авторизован.");
    }

    loading.value = true;
    error.value = null;

    const { data, error: supabaseError } = await supabase
      .from("projects")
      .select("*")
      .eq("userEmail", user.value.email);

    if (supabaseError) throw supabaseError;

    projects.value = (data as Project[]).map((project) => ({
      ...project,
      createdAt: new Date(project.createdAt),
    }));
  } catch (err) {
    console.error("Ошибка при загрузке проектов:", err); // Логируем ошибку
    error.value = err as string;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  if (user.value) {
    fetchProjects();
  }
});
</script>

<style scoped></style>
