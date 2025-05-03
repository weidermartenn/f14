<template>
  <div class="min-h-[calc(100vh-180px)] w-full p-4 md:p-6">
    <div class="flex flex-col md:flex-row gap-20 justify-center items-start">
      <!-- Левая панель с организациями -->
      <OPanel
        :selected-org-id="selectedOrg?.id"
        @select="selectOrg"
        class="w-full md:w-1/3 lg:w-1/4"
      />

      <!-- Правая колонка - виджеты -->
      <div class="w-full md:w-1/3 lg:w-3/4 space-y-6">
        <!-- Блок для лидера организации -->
        <transition name="fade-slide">
          <div
            v-if="isCurrentUserLeader"
            class="relative bg-gradient-to-r from-teal-900/30 to-bg-accent-dark rounded-lg shadow-lg p-5 flex items-center justify-between border-l-4 border-teal-500 overflow-hidden"
          >
            <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-teal-500/10 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
            
            <div class="flex items-center gap-3 z-10">
              <div class="p-2 bg-teal-500/20 rounded-full transition-all duration-300 hover:bg-teal-500/30 hover:scale-105">
                <i class="fa-solid fa-crown text-teal-400 text-lg transition-all duration-500 hover:text-teal-300"></i>
              </div>
              
              <div>
                <h3 class="text-lg font-semibold text-gray-200 flex items-center">
                  <span class="text-teal-400 font-bold mr-1 transition-colors duration-300 hover:text-teal-300">Вы</span>
                  <span class="text-gray-400 transition-colors duration-300 hover:text-gray-300">— лидер этой организации</span>
                </h3>
                <p class="text-sm text-gray-500 mt-1 transition-colors duration-300 hover:text-gray-400">
                  У вас есть полные права управления организацией
                </p>
              </div>
            </div>
            
            <button
              @click="openGuide"
              class="relative z-10 text-xs bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 hover:text-teal-300 px-3 py-1 rounded-md transition-all duration-300 flex items-center gap-1 group"
            >
              <i class="fa-solid fa-info-circle transition-transform duration-300 group-hover:rotate-12"></i>
              <span class="transition-all duration-300 group-hover:translate-x-0.5">Руководство</span>
            </button>
          </div>
        </transition>

        <!-- Виджет выбранной организации -->
        <transition name="fade" mode="out-in">
          <div
            v-if="selectedOrg && !loading"
            key="org-info"
            class="bg-bg-accent-dark rounded-lg shadow-lg p-5"
          >
            <div class="flex justify-between items-start">
              <h2 class="text-xl font-bold text-gray-200">{{ selectedOrg.name }}</h2>
              <div class="flex gap-2">
                <button class="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                  <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button 
                  @click="leaveOrg(selectedOrg.id)"
                  class="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <i class="fa-solid fa-right-from-bracket"></i>
                </button>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <StatCard 
                title="Участники" 
                :value="selectedOrg.members_count" 
                icon="users"
                color="blue"
              />
              <StatCard 
                title="Проекты" 
                :value="selectedOrg.projects_count || 0" 
                icon="folder"
                color="green"
              />
              <StatCard 
                title="Активность" 
                value="Высокая" 
                icon="activity"
                color="yellow"
              />
            </div>
          </div>
          <div
            v-else
            key="loading"
            class="bg-bg-accent-dark rounded-lg shadow-lg p-5 h-48 flex items-center justify-center"
          >
            <LoadingSpinner class="text-teal-400 text-2xl" />
          </div>
        </transition>

        <!-- Кнопка перехода -->
        <transition name="fade">
          <div
            v-if="selectedOrg"
            class="bg-bg-accent-dark rounded-lg shadow-lg p-5"
          >
            <button
              @click="handleRedirectToOrg"
              class="w-full py-2 px-4 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 rounded-md transition-colors duration-300 flex items-center justify-between"
            >
              <span>Подробнее об организации</span>
              <i class="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </transition>

        <!-- Виджет статистики -->
        <transition name="fade" appear>
          <div class="bg-bg-accent-dark rounded-lg shadow-lg p-5">
            <h3 class="text-lg font-semibold text-gray-300 mb-4">Статистика</h3>
            <div class="h-64 relative">
              <transition name="fade" mode="out-in">
                <div
                  v-if="chartLoading"
                  key="chart-loading"
                  class="absolute inset-0 flex items-center justify-center"
                >
                  <LoadingSpinner class="text-blue-400 text-xl" />
                </div>
                <canvas
                  v-else
                  key="chart"
                  ref="chartCanvas"
                  class="w-full h-full"
                ></canvas>
              </transition>
            </div>
          </div>
        </transition>

        <!-- Виджет последних действий -->
        <transition name="fade-slide" appear>
          <div class="bg-bg-accent-dark rounded-lg shadow-lg p-5">
            <h3 class="text-lg font-semibold text-gray-300 mb-4">
              Последние действия
            </h3>
            <transition-group name="list" tag="div" class="space-y-3">
              <ActivityItem
                v-for="(item, index) in activities"
                :key="item.id || index"
                :activity="{
                  ...item,
                  type: getActivityType(item.action),
                }"
              />
            </transition-group>
            <button
              class="mt-3 text-blue-500 hover:text-blue-400 text-sm font-medium transition-colors duration-300"
            >
              Показать все действия <i class="fa-solid fa-arrow-right ml-1"></i>
            </button>
          </div>
        </transition>
      </div>
    </div>

    <!-- Модальное окно руководства -->
    <transition name="modal">
      <div
        v-if="showGuide"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        @click.self="closeGuide"
      >
        <div class="relative bg-bg-accent-dark rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div class="sticky top-0 bg-bg-accent-dark p-5 border-b border-gray-800 flex justify-between items-center">
            <h2 class="text-xl font-bold text-teal-400 flex items-center gap-2">
              <i class="fa-solid fa-crown"></i>
              Руководство для лидера организации
            </h2>
            <button
              @click="closeGuide"
              class="text-gray-400 hover:text-white p-1 transition-colors"
            >
              <i class="fa-solid fa-xmark text-xl"></i>
            </button>
          </div>

          <div class="p-6 space-y-6">
            <section class="space-y-4">
              <h3 class="text-lg font-semibold text-gray-200 flex items-center gap-2">
                <i class="fa-solid fa-users text-blue-400"></i>
                Управление участниками
              </h3>
              <ul class="space-y-3 pl-5">
                <li class="flex gap-3">
                  <i class="fa-solid fa-user-plus text-green-400 mt-1"></i>
                  <div>
                    <p class="text-gray-200">Добавление участников</p>
                    <p class="text-gray-500 text-sm mt-1">
                      Перейдите в раздел "Участники" и нажмите "Пригласить".
                    </p>
                  </div>
                </li>
                <li class="flex gap-3">
                  <i class="fa-solid fa-user-slash text-red-400 mt-1"></i>
                  <div>
                    <p class="text-gray-200">Управление правами</p>
                    <p class="text-gray-500 text-sm mt-1">
                      В карточке участника вы можете изменить его роль или исключить из организации.
                    </p>
                  </div>
                </li>
              </ul>
            </section>

            <section class="space-y-4">
              <h3 class="text-lg font-semibold text-gray-200 flex items-center gap-2">
                <i class="fa-solid fa-folder-open text-purple-400"></i>
                Управление проектами
              </h3>
              <ul class="space-y-3 pl-5">
                <li class="flex gap-3">
                  <i class="fa-solid fa-plus-circle text-teal-400 mt-1"></i>
                  <div>
                    <p class="text-gray-200">Создание проектов</p>
                    <p class="text-gray-500 text-sm mt-1">
                      Нажмите "Новый проект" в верхней панели.
                    </p>
                  </div>
                </li>
                <li class="flex gap-3">
                  <i class="fa-solid fa-lock text-yellow-400 mt-1"></i>
                  <div>
                    <p class="text-gray-200">Настройки доступа</p>
                    <p class="text-gray-500 text-sm mt-1">
                      В настройках проекта вы можете назначить ответственных.
                    </p>
                  </div>
                </li>
              </ul>
            </section>
          </div>

          <div class="sticky bottom-0 bg-bg-accent-dark p-4 border-t border-gray-800 flex justify-end">
            <button
              @click="closeGuide"
              class="px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-md text-white transition-colors duration-300"
            >
              Понятно
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { supabaseHelper } from "../../../shared/api/sbHelper";
import { user } from "../../../shared/lib/auth";
import { LoadingSpinner } from "../../../shared/ui/LoadingSpinner";
import { StatCard } from "../../../widgets/statcard";
import { ActivityItem } from "../../../widgets/activityitem";
import type { Orgs } from "../../../entities/org/types";
import { OPanel } from "../../../widgets/opanel";
import { Chart, type ChartConfiguration, registerables } from "chart.js";

Chart.register(...registerables);

const orgs = ref<Orgs[]>([]);
const selectedOrg = ref<Orgs | null>(null);
const loading = ref(false);
const router = useRouter();
const showGuide = ref(false);
const chartLoading = ref(true);

const isCurrentUserLeader = computed(() => {
  return selectedOrg.value?.leaderId === user.value.id;
});

const getActivityType = (action: string) => {
  if (action.includes("проект")) return "project";
  if (action.includes("документ")) return "document";
  if (action.includes("участник")) return "member";
  if (action.includes("задача")) return "task";
  return "event";
};

const activities = ref([
  {
    id: 1,
    action: "Создан проект",
    name: "Маркетплейс",
    date: "2 часа назад",
    user: "Иван Петров",
  },
  {
    id: 2,
    action: "Обновлен документ",
    name: "Требования",
    date: "5 часов назад",
    user: "Алексей Смирнов",
  },
  {
    id: 3,
    action: "Добавлен участник",
    name: "Ольга Козлова",
    date: "Вчера",
    user: "Вы",
  },
]);

const fetchOrgs = async () => {
  try {
    loading.value = true;
    orgs.value = await supabaseHelper.fetchOrgs(user.value.email);
    if (orgs.value.length > 0) {
      selectedOrg.value = orgs.value[0];
    }
  } catch (error) {
    console.error("Не удалось загрузить организации");
    console.error("Error fetching orgs:", error);
  } finally {
    loading.value = false;
  }
};

const handleRedirectToOrg = () => {
  if (selectedOrg.value?.id) {
    router.push({ name: "projects", params: { orgId: selectedOrg.value.id } });
  }
};

const selectOrg = (org: Orgs) => {
  selectedOrg.value = org;
};

const openGuide = () => {
  showGuide.value = true;
  document.body.style.overflow = "hidden";
};

const closeGuide = () => {
  showGuide.value = false;
  document.body.style.overflow = "";
};

const leaveOrg = async (orgId: string) => {
  // Реализация выхода из организации
};

const chartCanvas = ref<HTMLCanvasElement | null>(null);

const chartConfig: ChartConfiguration<"bar", number[], string> = {
  type: "bar",
  data: {
    labels: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
    datasets: [
      {
        label: "Активность",
        data: [12, 19, 8, 15, 22, 13, 7],
        backgroundColor: "rgba(59, 130, 246, 0.7)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(75, 85, 99, 0.2)",
        },
        ticks: {
          color: "rgba(156, 163, 175, 1)",
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "rgba(156, 163, 175, 1)",
        },
      },
    },
  },
};

onMounted(() => {
  fetchOrgs();
  
  setTimeout(() => {
    if (chartCanvas.value) {
      new Chart(chartCanvas.value, chartConfig);
      chartLoading.value = false;
    }
  }, 1500);
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-slide-enter-active {
  transition: all 0.3s ease-out;
}
.fade-slide-leave-active {
  transition: all 0.2s ease-in;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
.list-move {
  transition: transform 0.5s ease;
}

.modal-enter-active {
  transition: all 0.3s ease-out;
}
.modal-leave-active {
  transition: all 0.2s ease-in;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.scroll-container {
  scrollbar-width: thin;
  scrollbar-color: #4b5563 #1f2937;
}

.scroll-container::-webkit-scrollbar {
  width: 6px;
}

.scroll-container::-webkit-scrollbar-track {
  background: #1f2937;
}

.scroll-container::-webkit-scrollbar-thumb {
  background-color: #4b5563;
  border-radius: 3px;
}

.transition-colors {
  transition-property: color, background-color, border-color,
    text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}
</style>