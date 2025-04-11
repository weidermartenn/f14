<template>
  <div class="px-6 py-8 min-h-[calc(100vh-180px)]">
    <Notification
      v-if="showNotification"
      :notifications="[
        { id: '1', message: notificationMessage, type: 'success' },
      ]"
      @close="showNotification = false"
    />
    <button
      @click="$router.push({ name: 'dashboard' })"
      class="flex items-center gap-2 mb-4 hover:text-gray-300 duration-150"
    >
      <i class="fa-solid fa-chevron-left hover:text-gray-300"></i>
      <span>Вернуться к дашборду</span>
    </button>
    <span class="bg-bg-accent-dark text-white rounded-md px-2 py-1">{{
      orgName
    }}</span>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 ml-20 mt-6">
      <div class="flex flex-col items-center">
        <div class="flex flex-col items-center justify-center px-2 py-1 gap-4">
          <h2 class="text-xl mt-4 w-full text-center">Участники организации</h2>
          <div class="flex flex-wrap gap-2 mt-2">
            <!-- Имена участников -->
            <span
              v-for="(member, id) in members"
              :key="id"
              class="bg-bg-accent-dark text-white rounded-md px-2 py-1"
            >
              {{ member.email.split("@")[0] }}
              <i v-if="member.isLeader" class="fa-solid fa-crown text-gray-300"></i>
            </span>
          </div>
          <button
            @click="openAddMemberModal"
            class="mt-4 hover:text-gray-300 rounded-md px-4 py-2"
          >
            + Добавить участника
          </button>
        </div>
        <h2
          class="text-3xl mt-4 py-2 mb-4 border-b-2 border-gray-700 w-full text-center"
        >
          Все проекты
        </h2>
        <span class="text-gray-300 text-center mb-4">
          Ниже отображаются все созданные вами проекты.
        </span>
        <button
          @click="handleCreateProject"
          class="w-14 h-10 mt-2 flex items-center justify-center text-3xl cursor-pointer border-2 border-gray-700 rounded-lg hover:border-blue-500 hover:text-blue-500 transition-colors"
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
          class="w-full mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <ProjectCard
            v-for="project in projects"
            :key="project.id"
            :project="project"
            :is-selected="selectedProjectId === project.id"
            @edit="handleProjectUpdate"
            @delete="handleProjectDelete"
            @select="handleProjectSelect"
          />
        </div>
      </div>
      <div class="flex items-center justify-center h-full">
        <CommentsContainer
          class="h-[calc(100vh-240px)] w-full max-w-lg"
          :project-id="selectedProjectId"
        />
      </div>
    </div>
    <AddMemberModal ref="addMemberModal" @memberAdded="handleMemberAdded" />
  </div>
</template>

<script setup lang="ts">
import ProjectCard from "./ProjectCard.vue";
import LoadingSpinner from "../../../shared/ui/LoadingSpinner/ui/LoadingSpinner.vue";
import CommentsContainer from "../../../widgets/comments/ui/CommentsContainer.vue";
import AddMemberModal from "../../../widgets/addmember/ui/AddMemberModal.vue";
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { supabaseHelper } from "../../../shared/api/sbHelper";
import type { Project } from "../../../entities/project/types";
import Notification from "../../../widgets/notification/ui/Notification.vue";

const projects = ref<Project[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const selectedProjectId = ref<string | null>(null);
const members = ref<{email: string; isLeader: boolean}[]>([]);

const route = useRoute();
const router = useRouter();

const showNotification = ref(false);
const notificationMessage = ref("");

const orgName = ref("");
const addMemberModal = ref<InstanceType<typeof AddMemberModal> | null>(null);

const handleProjectSelect = (projectId: string) => {
  selectedProjectId.value = projectId;
  localStorage.setItem("selectedProjectId", projectId);
};

const loadProjects = async () => {
  try {
    const orgId = route.params.orgId as string;
    if (!orgId) {
      throw new Error("Организация не найдена.");
    }

    loading.value = true;
    error.value = null;

    const data = await supabaseHelper.fetchProjects(orgId);
    projects.value = data;
  } catch (err) {
    console.error("Ошибка при загрузке проектов:", err);
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
  router.push({
    name: "create-new-project",
    params: { orgId: route.params.orgId },
  });
};

const fetchMemberData = async () => {
  try {
    const orgId = route.params.orgId as string;
    const { members: memberList, leaderEmail } = await supabaseHelper.fetchOrgMembersWithLeader(orgId);
    
    members.value = memberList.map(email => ({
      email,
      isLeader: email === leaderEmail
    }));
  } catch (error) {
    console.error("Ошибка при получении данных участников:", error);
  }
};

const openAddMemberModal = () => {
  if (addMemberModal.value) {
    addMemberModal.value.openModal();
  }
};

const handleMemberAdded = async (data: { email: string; message: string }) => {
  try {
    showNotification.value = true;
    notificationMessage.value = data.message;

    // Reset notification after 5 seconds
    setTimeout(() => {
      showNotification.value = false;
    }, 5000);

    // Refresh members list
    await fetchMemberData();
  } catch (error) {
    console.error("Error handling member addition:", error);
  }
};

onMounted(() => {
  loadProjects();
  supabaseHelper
    .fetchOrgName(route.params.orgId as string)
    .then((name) => (orgName.value = name));

  fetchMemberData();

  const savedProjectId = localStorage.getItem("selectedProjectId");
  if (savedProjectId) {
    selectedProjectId.value = savedProjectId;
  } else if (projects.value.length > 0) {
    selectedProjectId.value = projects.value[0].id;
  }
});

watch(
  projects,
  (newProjects) => {
    if (newProjects.length > 0 && !selectedProjectId.value) {
      selectedProjectId.value = newProjects[0].id;
    }
  },
  { immediate: true }
);
</script>
