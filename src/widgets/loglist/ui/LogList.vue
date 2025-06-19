<template>
  <div class="p-4 w-full">
    <div v-if="loading">
      <LoadingSpinner />
    </div>
    <div v-else>
      <!-- Sorting and Filtering Controls -->
      <div class="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <div class="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <input
            v-model="sortByAction"
            placeholder="Сортировать по действию"
            class="bg-gray-300 dark:bg-gray-700 text-zinc-800 dark:text-white px-4 py-2 rounded-md w-full md:w-64"
          />
          <input
            v-model="sortByName"
            placeholder="Сортировать по имени"
            class="bg-gray-300 dark:bg-gray-700 text-zinc-800 dark:text-white px-4 py-2 rounded-md w-full md:w-64"
          />
          <input
            v-model="sortByUsername"
            placeholder="Сортировать по пользователю"
            class="bg-gray-300 dark:bg-gray-700 text-zinc-800 dark:text-white px-4 py-2 rounded-md w-full md:w-64"
          />
          <div class="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <input
              v-model="startDate"
              type="date"
              class="bg-gray-300 dark:bg-gray-700 text-zinc-800 dark:text-white py-2 px-2 rounded-md w-full md:w-auto"
            />
            <input
              v-model="endDate"
              type="date"
              class="bg-gray-300 dark:bg-gray-700 text-zinc-800 dark:text-white py-2 px-2 rounded-md w-full md:w-auto"
            />
            <button
              @click="sortByDateRange"
              class="bg-gray-300 dark:bg-gray-700 text-zinc-800 dark:text-white px-4 py-2 rounded-md hover:bg-gray-600 w-full md:w-auto"
            >
              Сортировать по дате
            </button>
          </div>
        </div>
      </div>

      <!-- Log List -->
      <div class="mb-6">
        <div
          v-for="log in filteredLogs"
          :key="log.id"
          class="bg-gray-300 dark:bg-bg-dark p-4 rounded-lg shadow-sm mb-2 transition-all duration-300 hover:shadow-lg"
        >
          <h3 class="text-lg text-zinc-800 dark:text-f14-font-dark font-medium">{{ log.action }} <span class="text-zinc-800 dark:text-gray-300 ml-4">{{ log.name }}</span></h3>
          <p class="text-sm text-gray-300 mt-2"></p>
          <div class="flex flex-col md:flex-row justify-between mt-4 gap-2">
            <span class="text-md text-zinc-700 dark:text-gray-300">Пользователь: {{ getUsername(log.userId!!) }}</span>
            <span class="text-md text-zinc-700 dark:text-gray-300">{{ formatDate(new Date(log.createdAt)) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { supabaseHelper } from '../../../shared/api/sbHelper';
import { LoadingSpinner } from '../../../shared/ui/LoadingSpinner';
import type { Log } from '../../../entities/log/types';

const route = useRoute();

const logs = ref<Log[]>([]);
const loading = ref(true);
const sortByAction = ref<string>("");
const sortByName = ref<string>("");
const sortByUsername = ref<string>("");
const startDate = ref<string>("");
const endDate = ref<string>("");
const usernames = ref<{ [key: string]: string }>({});

const fetchLogs = async () => {
  try {
    const data = await supabaseHelper.fetchLogs(route.params.orgId as string);
    logs.value = data;
    await fetchUsernames();
  } catch (error) {
    console.error("Error fetching logs:", error);
  }
};

const fetchUsernames = async () => {
  try {
    const uniqueUserIds = [...new Set(logs.value.map(log => log.userId))];
    for (const userId of uniqueUserIds) {
      const email = await supabaseHelper.getUserEmail(userId!!);
      usernames.value[userId!!] = email.split("@")[0];
    }
  } catch (error) {
    console.error("Error fetching usernames:", error);
  }
};

const getUsername = (userId: string) => {
  return usernames.value[userId] || userId;
};

const filteredLogs = computed(() => {
  let filtered = [...logs.value];

  if (sortByAction.value) {
    filtered = filtered.filter(log => log.action.toLowerCase().includes(sortByAction.value.toLowerCase()));
  }

  if (sortByName.value) {
    filtered = filtered.filter(log => log.name?.toLowerCase().includes(sortByName.value.toLowerCase()));
  }

  if (sortByUsername.value) {
    filtered = filtered.filter(log => getUsername(log.userId!!).toLowerCase().includes(sortByUsername.value.toLowerCase()));
  }

  if (startDate.value && endDate.value) {
    const start = new Date(startDate.value).getTime();
    const end = new Date(endDate.value).getTime();
    filtered = filtered.filter(log => {
      const logDate = new Date(log.createdAt).getTime();
      return logDate >= start && logDate <= end;
    });
  }

  return filtered;
});

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('ru-RU');
};

const sortByDateRange = () => {
  // Sorting by date range is handled by the computed property `filteredLogs`
};

onMounted(async () => {
  await fetchLogs();
  loading.value = false;
});
</script>

<style scoped>
/* Responsive styles */
@media (max-width: 768px) {
  .flex-col {
    flex-direction: column;
  }
  .gap-4 {
    gap: 1rem;
  }
  .w-full {
    width: 100%;
  }
}
</style>
