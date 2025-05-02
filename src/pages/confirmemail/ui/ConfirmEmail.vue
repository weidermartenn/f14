<template>
  <div
    class="flex flex-col items-center justify-center min-h-[calc(100vh-180px)] bg-bg-dark text-white"
  >
    <div class="bg-bg-accent-dark p-8 rounded-lg shadow-lg max-w-md w-full">
      <h1 class="text-2xl font-bold mb-4 text-center">Подтверждение email</h1>

      <div v-if="loading" class="flex flex-col items-center">
        <LoadingSpinner class="mb-4" />
        <p>Проверяем вашу почту...</p>
      </div>

      <div v-if="error" class="text-red-500 text-center">
        {{ error }}
      </div>

      <div v-if="success" class="text-center">
        <i class="fas fa-check-circle text-green-500 text-5xl mb-4"></i>
        <p class="mb-4">
          Вы успешно подтвердили email и добавлены в организацию!
        </p>
        <button
          @click="redirectToDashboard"
          class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
        >
          Перейти в Dashboard
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { supabaseHelper } from "../../../shared/api/sbHelper";
import { supabase } from "../../../shared/api/supabaseClient";
import LoadingSpinner from "../../../shared/ui/LoadingSpinner/ui/LoadingSpinner.vue";

const loading = ref(true);
const error = ref<string | null>(null);
const success = ref(false);

const route = useRoute();
const router = useRouter();

const redirectToDashboard = () => {
  router.push({ name: "dashboard" });
};

onMounted(async () => {
  try {
    // Wait for user to be authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error("Пользователь не аутентифицирован");
    }

    // Get the organization ID from the URL fragment or query
    const orgId =
      (route.query.orgId as string) || window.location.hash.split("orgId=")[1];

    if (!orgId) {
      throw new Error("ID организации не найден");
    }

    // Add user to organization
    await supabaseHelper.addOrgMember(orgId, user.email!);

    success.value = true;
  } catch (err) {
    console.error("Ошибка подтверждения email:", err);
    error.value =
      err instanceof Error ? err.message : "Произошла неизвестная ошибка";
  } finally {
    loading.value = false;
  }
});
</script>
