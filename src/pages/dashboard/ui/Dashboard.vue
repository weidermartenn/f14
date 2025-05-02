<template>
  <div class="min-h-[calc(100vh-180px)] w-full p-4 md:p-6">
    <div class="flex flex-col md:flex-row gap-20 justify-center items-start">
      <OPanel
        :selected-org-id="selectedOrg?.id"
        @select="selectOrg"
        class="w-full md:w-1/3 lg:w-1/4"
      />

      <!-- Правая колонка - виджеты -->
      <div class="w-full md:w-1/3 lg:w-3/4 space-y-6">
        <div v-if="!isCurrentUserLeader" class="bg-bg-accent-dark rounded-lg shadow-lg p-5">
          <h3 class="text-xl font-semibold text-gray-300 flex"><p class="mr-1 text-teal-700">Вы</p> - лидер организации</h3>
        </div>
        <!-- Виджет выбранной организации -->
        <div
          v-if="selectedOrg"
          class="bg-bg-accent-dark rounded-lg shadow-lg p-5"
        >
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
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

        <div v-else class="bg-bg-accent-dark rounded-lg shadow-lg p-5 h-48 flex items-center justify-center">
          <LoadingSpinner />
        </div>

        <div class="bg-bg-accent-dark rounded-lg shadow-lg p-5">
            <button @click="handleRedirectToOrg">Подробнее →</button>
        </div>

        <!-- Виджет статистики -->
        <div class="bg-bg-accent-dark rounded-lg shadow-lg p-5">
          <h3 class="text-lg font-semibold text-gray-300 mb-4">Статистика</h3>
          <div
            class="h-64"
          >
            <canvas ref="chartCanvas"></canvas>
          </div>
        </div>

        <!-- Виджет последних действий -->
        <div class="bg-bg-accent-dark rounded-lg shadow-lg p-5">
          <h3 class="text-lg font-semibold text-gray-300 mb-4">
            Последние действия
          </h3>
          <div class="space-y-3">
            <ActivityItem
              v-for="(item, index) in activities"
              :key="index"
              :activity="{
                ...item,
                type: getActivityType(item.action),
              }"
            />
          </div>
          <button
            class="mt-3 text-blue-500 hover:text-blue-400 text-sm font-medium"
          >
            Показать все действия →
          </button>
        </div>
      </div>
    </div>
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
import { Chart, registerables } from 'chart.js';

const orgs = ref<Orgs[]>([]);
const selectedOrg = ref<Orgs | null>(null);
const loading = ref(false);
const router = useRouter();

const isCurrentUserLeader = computed(() => {
  return selectedOrg.value?.leaderId === user.value.id
})

// Определяем тип активности по тексту действия
const getActivityType = (action: string) => {
  if (action.includes("проект")) return "project";
  if (action.includes("документ")) return "document";
  if (action.includes("участник")) return "member";
  if (action.includes("задача")) return "task";
  return "event";
};

// Тестовые данные активности с автоматическим определением типа
const activities = ref([
  {
    action: "Создан проект",
    name: "Маркетплейс",
    date: "2 часа назад",
    user: "Иван Петров",
  },
  {
    action: "Обновлен документ",
    name: "Требования",
    date: "5 часов назад",
    user: "Алексей Смирнов",
  },
  {
    action: "Добавлен участник",
    name: "Ольга Козлова",
    date: "Вчера",
    user: "Вы",
  },
  {
    action: "Завершена задача",
    name: "Дизайн интерфейса",
    date: "3 дня назад",
    user: "Мария Иванова",
  },
  {
    action: "Назначено событие",
    name: "Совещание",
    date: "1 неделю назад",
    user: "Петр Сидоров",
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
  router.push({name: "projects", params: {orgId: selectedOrg.value?.id }})
}

const selectOrg = (org: Orgs) => {
  selectedOrg.value = org;
};

const handleCreateOrg = () => {
  router.push({ name: "create-organization" });
};

// const leaveOrg = async (orgId: string) => {
//   const isConfirmed = await confirm.show(
//     'Покинуть организацию',
//     'Вы уверены, что хотите покинуть эту организацию?'
//   )

//   if (isConfirmed) {
//     try {
//       await supabaseHelper.leaveOrg(orgId, user.value.id)
//       toast.success('Вы покинули организацию')
//       await fetchOrgs()
//     } catch (error) {
//       toast.error('Не удалось покинуть организацию')
//       console.error('Error leaving org:', error)
//     }
//   }
// }

Chart.register(...registerables)

const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

const chartConfig: ChartConfiguration<'bar', number[], string> = {
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
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(75, 85, 99, 0.2)'
        },
        ticks: {
          color: 'rgba(156, 163, 175, 1)'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: 'rgba(156, 163, 175, 1)'
        }
      }
    }
  }
}

onMounted(() => {
  if (chartCanvas.value) {
    new Chart(chartCanvas.value, chartConfig)
  };
  fetchOrgs;
});
</script>

<style scoped>
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
