<template>
  <div class="flex flex-col gap-4 items-center">
    <button
      @click="router.back"
      class="flex items-center gap-2 hover:text-gray-300"
    >
      <i class="fa-solid fa-chevron-left"></i>
      <span>Вернуться назад</span>
    </button>
    <div class="bg-gray-200 dark:bg-bg-accent-dark p-8 rounded-lg shadow-lg w-full max-w-md">
      <h2 class="text-2xl text-zinc-800 dark:text-f14-font-dark font-bold mb-6 text-center">
        Придумайте название для проекта
      </h2>
      <form @submit.prevent="supabaseHelper.addProject!!">
        <Input
          type="text"
          v-model="input"
          :error="error"
          placeholder="Название"
          class="w-full rounded-md p-2 mb-4"
        />
        <button
          type="submit"
          :disabled="loading"
          :class="{ 'opacity-50 cursor-not-allowed': loading }"
          @click="createProjectHandler"
          class="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {{ loading ? "Создаем..." : "Создать" }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Input } from "../../../shared/ui/Input";
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { supabase } from "../../../shared/api/supabaseClient";
import { generateId } from "../../../shared/lib/generateId";
import { supabaseHelper } from "../../../shared/api/sbHelper"; // Импортируем новую функцию

const loading = ref(false);
const input = ref("");
const error = ref("");

const router = useRouter();
const route = useRoute();

const orgId = ref(route.params.orgId as string);

const createProjectHandler = async () => {
  // Проверка на пустое значение
  if (!input.value) {
    error.value = "Пожалуйста, введите название.";
    return;
  }

  try {
    loading.value = true;
    error.value = "";

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const projectId = generateId();
    const createdAt = new Date().toISOString();

    // Создаем проект с помощью новой функции
    await supabaseHelper.addProject({
      id: projectId,
      name: input.value,
      userEmail: user?.email || "",
      createdAt,
      orgId: orgId.value,
    });

    router.back();
  } catch (err) {
    if (err instanceof Error) {
      alert(err.message);
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped></style>
