<template>
  <div class="px-6 py-2 min-h-[calc(100vh-180px)] bg-bg dark:bg-bg-dark">
    <Notification
      v-if="showNotification"
      :notifications="[{ id: '1', message: notificationMessage, type: 'success' }]"
      @close="showNotification = false"
    />
    
    <!-- Кнопка возврата -->
    <div class="w-full p-5 flex justify-center">
      <button
        @click="$router.push({ name: 'dashboard' })"
        class="flex items-center justify-center border-2 border-rose-600 dark:border-rose-500 text-rose-600 dark:text-rose-500 rounded-md w-10 h-10 hover:border-rose-400 dark:hover:border-rose-400 hover:text-rose-400 dark:hover:text-rose-400 duration-150"
      >
        <i class="fa-solid fa-right-from-bracket"></i>
      </button>
    </div>

    <!-- Основной контент с тремя колонками -->
    <div class="grid grid-cols-1 lg:grid-cols-[1fr_0fr_1fr] gap-6">
      <!-- 1-я колонка: Переключаемые списки -->
      <div class="bg-gray-100 dark:bg-bg-accent-dark rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <div class="flex border-b border-gray-300 dark:border-gray-700 mb-4">
          <button
            @click="activeTab = 'members'"
            :class="{
              'text-f14-font dark:text-f14-font-dark border-b-2 border-blue-500': activeTab === 'members', 
              'text-gray-500 dark:text-gray-400': activeTab !== 'members'
            }"
            class="px-4 py-2 font-medium transition-colors"
          >
            Участники
          </button>
          <button
            @click="activeTab = 'projects'"
            :class="{
              'text-f14-font dark:text-f14-font-dark border-b-2 border-blue-500': activeTab === 'projects', 
              'text-gray-500 dark:text-gray-400': activeTab !== 'projects'
            }"
            class="px-4 py-2 font-medium transition-colors"
          >
            Проекты
          </button>
        </div>

        <!-- Контент вкладок -->
        <div v-if="activeTab === 'members'">
          <h3 class="text-lg text-f14-font dark:text-f14-font-dark font-semibold mb-4">Участники организации</h3>
          <div class="space-y-2 max-h-[300px] overflow-y-auto">
            <div
              v-for="(member, id) in members"
              :key="id"
              class="flex items-center justify-between p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded transition-colors"
            >
              <div class="flex items-center">
                <div class="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center mr-3 text-gray-700 dark:text-gray-200">
                  {{ member.email.charAt(0).toUpperCase() }}
                </div>
                <span class="text-f14-font dark:text-gray-300">
                  {{ member.email.split("@")[0] }}
                  <i v-if="member.isLeader" class="fa-solid fa-crown text-yellow-500 ml-1"></i>
                </span>
              </div>
              <button
                v-if="!member.isLeader"
                @click="removeMember(member.email)"
                class="text-red-500 dark:text-red-400 hover:text-red-400 dark:hover:text-red-300 transition-colors"
              >
                <i class="fa-solid fa-user-minus"></i>
              </button>
            </div>
          </div>
          <button
            @click="openAddMemberModal"
            class="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded flex items-center justify-center transition-colors"
          >
            <i class="fa-solid fa-user-plus mr-2"></i>
            Добавить участника
          </button>
        </div>

        <div v-else>
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg text-f14-font dark:text-f14-font-dark font-semibold">Проекты организации</h3>
            <button
              @click="handleCreateProject"
              class="w-8 h-8 flex items-center justify-center text-xl cursor-pointer border border-gray-400 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
            >
              +
            </button>
          </div>
          
          <div v-if="loading" class="flex justify-center py-10">
            <LoadingSpinner />
          </div>
          
          <div v-else-if="error" class="text-center py-10 text-red-500 dark:text-red-400">
            Ошибка: {{ error }}
          </div>
          
          <div v-else-if="projects.length === 0" class="text-center py-10 text-gray-500 dark:text-gray-400">
            Проектов пока нет
          </div>
          
          <div v-else class="space-y-2 max-h-[300px] overflow-y-auto">
            <ProjectCard
              v-for="project in projects"
              :key="project.id"
              :project="project"
              :is-selected="selectedProjectId === project.id"
              @select="handleProjectSelect"
            />
          </div>
        </div>
      </div>

      <!-- 2-я колонка: Аналитика -->
      <div class="rounded-lg">
        <h3 class="bg-gray-100 dark:bg-bg-accent-dark text-f14-font dark:text-f14-font-dark p-4 rounded-md text-lg font-semibold mb-4 border border-gray-200 dark:border-gray-700">Аналитика организации</h3>
        
        <!-- График активности -->
        <div class="bg-white dark:bg-gray-800 p-4 rounded-md mb-6 border border-gray-200 dark:border-gray-700">
          <h4 class="text-md font-medium mb-2 text-f14-font dark:text-gray-300">Активность по дням</h4>
          <div class="h-64">
            <canvas ref="activityChart"></canvas>
          </div>
        </div>
        
        <!-- Круговые диаграммы -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-white dark:bg-gray-800 rounded-md p-4 border border-gray-200 dark:border-gray-700">
            <h4 class="text-md font-medium mb-2 text-f14-font dark:text-gray-300">Выполняемость задач</h4>
            <div class="h-48">
              <canvas ref="completionChart"></canvas>
            </div>
          </div>
          <div class="bg-white dark:bg-gray-800 rounded-md p-4 border border-gray-200 dark:border-gray-700">
            <h4 class="text-md font-medium mb-2 text-f14-font dark:text-gray-300">Распределение по типам</h4>
            <div class="h-48">
              <canvas ref="typeDistributionChart"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- 3-я колонка: Чат -->
      <div class="bg-white dark:bg-bg-accent-dark rounded-lg p-4 flex flex-col border border-gray-200 dark:border-gray-700">
        <h3 class="text-lg font-semibold mb-4 text-f14-font dark:text-f14-font-dark">Чат проекта</h3>
        <CommentsContainer :projectId="selectedProjectId" />
      </div>
    </div>

    <AddMemberModal ref="addMemberModal" @memberAdded="handleMemberAdded" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Chart, registerables } from 'chart.js';
import ProjectCard from "./ProjectCard.vue";
import LoadingSpinner from "../../../shared/ui/LoadingSpinner/ui/LoadingSpinner.vue";
import AddMemberModal from "../../../widgets/addmember/ui/AddMemberModal.vue";
import { supabaseHelper } from "../../../shared/api/sbHelper";
import type { Project } from "../../../entities/project/types";
import Notification from "../../../widgets/notification/ui/Notification.vue";
import CommentsContainer from '../../../widgets/comments/ui/CommentsContainer.vue';

Chart.register(...registerables);

const projects = ref<Project[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const selectedProjectId = ref<string | null>(null);
const members = ref<{ email: string; isLeader: boolean }[]>([]);
const activeTab = ref<'members' | 'projects'>('projects');

const route = useRoute();
const router = useRouter();

const showNotification = ref(false);
const notificationMessage = ref("");
const addMemberModal = ref<InstanceType<typeof AddMemberModal> | null>(null);

// Refs для графиков
const activityChart = ref<HTMLCanvasElement | null>(null);
const completionChart = ref<HTMLCanvasElement | null>(null);
const typeDistributionChart = ref<HTMLCanvasElement | null>(null);

const removeMember = (email: string) => {
  // Реализация удаления участника
  console.log('Удалить участника:', email);
};

const initCharts = () => {
  nextTick(() => {
    // График активности
    if (activityChart.value) {
      new Chart(activityChart.value, {
        type: 'bar',
        data: {
          labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
          datasets: [{
            label: 'Активность',
            data: [12, 19, 8, 15, 22, 13, 7],
            backgroundColor: 'rgba(59, 130, 246, 0.7)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1,
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { beginAtZero: true, grid: { color: 'rgba(75, 85, 99, 0.2)' } },
            x: { grid: { display: false } }
          }
        }
      });
    }

    // Диаграмма выполняемости
    if (completionChart.value) {
      new Chart(completionChart.value, {
        type: 'doughnut',
        data: {
          labels: ['Выполнено', 'В работе', 'Не начато'],
          datasets: [{
            data: [65, 25, 10],
            backgroundColor: [
              'rgba(16, 185, 129, 0.7)',
              'rgba(59, 130, 246, 0.7)',
              'rgba(156, 163, 175, 0.7)'
            ],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '70%',
          plugins: {
            legend: { position: 'bottom' }
          }
        }
      });
    }

    // Диаграмма распределения по типам
    if (typeDistributionChart.value) {
      new Chart(typeDistributionChart.value, {
        type: 'pie',
        data: {
          labels: ['Разработка', 'Дизайн', 'Тестирование', 'Документация'],
          datasets: [{
            data: [40, 30, 15, 15],
            backgroundColor: [
              'rgba(59, 130, 246, 0.7)',
              'rgba(168, 85, 247, 0.7)',
              'rgba(22, 163, 74, 0.7)',
              'rgba(234, 88, 12, 0.7)'
            ],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom' }
          }
        }
      });
    }
  });
};

// Остальные методы остаются без изменений
const handleProjectSelect = (projectId: string) => {
  selectedProjectId.value = projectId;
  localStorage.setItem("selectedProjectId", projectId);
};

const loadProjects = async () => {
  try {
    const orgId = route.params.orgId as string;
    if (!orgId) throw new Error("Организация не найдена.");

    loading.value = true;
    error.value = null;
    projects.value = await supabaseHelper.fetchProjects(orgId);
  } catch (err) {
    console.error("Ошибка при загрузке проектов:", err);
    error.value = err instanceof Error ? err.message : String(err);
  } finally {
    loading.value = false;
  }
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
    const { members: memberList, leaderEmail } =
      await supabaseHelper.fetchOrgMembersWithLeader(orgId);

    members.value = memberList.map((email) => ({
      email,
      isLeader: email === leaderEmail,
    }));
  } catch (error) {
    console.error("Ошибка при получении данных участников:", error);
  }
};

const openAddMemberModal = () => {
  addMemberModal.value?.openModal();
};

const handleMemberAdded = async (data: { email: string; message: string }) => {
  showNotification.value = true;
  notificationMessage.value = data.message;
  setTimeout(() => showNotification.value = false, 5000);
  await fetchMemberData();
};

onMounted(() => {
  loadProjects();
  fetchMemberData();
  
  const savedProjectId = localStorage.getItem("selectedProjectId");
  if (savedProjectId) {
    selectedProjectId.value = savedProjectId;
  }
  
  initCharts();
});

watch(projects, (newProjects) => {
  if (newProjects.length > 0 && !selectedProjectId.value) {
    selectedProjectId.value = newProjects[0].id;
  }
}, { immediate: true });
</script>

<style scoped>
/* Стили для скроллбара */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #1f2937;
}

::-webkit-scrollbar-thumb {
  background-color: #4b5563;
  border-radius: 3px;
}

/* Анимации */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Общие стили переходов */
.transition-colors {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
</style>