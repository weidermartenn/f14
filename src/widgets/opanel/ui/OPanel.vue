<template>
  <div
    class="w-600 h-400 bg-bg-accent-dark p-4 flex flex-col gap-4 items-center rounded-md shadow-lg"
  >
    <span
      class="w-full text-center text-2xl py-2 text-gray-300 border-b-2 border-gray-300"
    >
      Организации
    </span>
    <button
      @click="handleCreateOrg"
      class="w-full flex items-center justify-center text-xl cursor-pointer border-2 border-gray-400 text-gray-400 rounded-lg hover:border-blue-500 hover:text-blue-500 transition-colors"
    >
      <i class="fa-solid fa-plus p-2"></i>
    </button>
    <div v-if="loading">
      <LoadingSpinner />
    </div>
    <div v-else class="w-full flex flex-col gap-4 items-center">
      <OPanelCard v-for="org in orgs" :key="org.id" :org="org" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import OPanelCard from "./OPanelCard.vue";
import { supabaseHelper } from "../../../shared/api/sbHelper";
import { user } from "../../../shared/lib/auth";
import type { Orgs } from "../../../entities/org/types";
import { LoadingSpinner } from "../../../shared/ui/LoadingSpinner";

const orgs = ref<Orgs[]>([]);
const loading = ref(false);
const router = useRouter();

const handleCreateOrg = async () => {
  router.push({ name: "create-organization" });
};

onMounted(async () => {
  try {
    loading.value = true;
    orgs.value = await supabaseHelper.fetchOrgs(user.value.email);
    console.log("Загруженные организации:", orgs.value); // Логирование для проверки данных
  } catch (error) {
    console.error("Ошибка при загрузке организаций:", error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
/* Дополнительные стили, если нужно */
</style>
