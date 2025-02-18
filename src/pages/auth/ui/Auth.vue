<template>
    <div class="flex flex-col items-center justify-center overflow-hidden mt-52">
      <button @click="router.back" class="flex items-center gap-2 hover:text-gray-300">
            <i class="fa-solid fa-chevron-left"></i>
            <span>Вернуться назад</span>
        </button>
      <div class="bg-bg-accent-dark mt-4 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 class="text-2xl font-bold mb-6 text-center">Войти в систему</h2>
        <form @submit.prevent="handleLogin">
          <EmailInput v-model="email" :error="error" />
          <div class="mb-10"></div>
          <span class="text-xs text-gray-400 text-wrap line-clamp-4">После нажатия кнопки мы отправим вам ссылку для входа на указанную почту</span>
          <div class="mb-4"></div>
          <button
            type="submit"
            class="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            :disabled="loading"
          >
            {{ loading ? "Загрузка..." : "Отправить ссылку" }}
          </button>
        </form>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { EmailInput } from "../../../shared/ui/EmailInput";
  import { ref } from "vue";
  import { useRouter } from "vue-router";
  import { supabase } from "../../../shared/api/supabaseClient";
  import { updateUserState } from "../../../shared/lib/user";
  
  const loading = ref(false);
  const email = ref('');
  const error = ref('');
  
  const router = useRouter();
  const handleLogin = async () => {
    // Проверка на пустое значение
    if (!email.value) {
        error.value = "Пожалуйста, введите email.";
        return;
    }
      try {
          loading.value = true
          error.value = "";

          const { error: supabaseError } = await supabase.auth.signInWithOtp({
              email: email.value,
          })
          if (supabaseError) throw supabaseError;
          alert('Проверьте почту для подтверждения');
      } catch (error) {
          if (error instanceof Error) {
              alert(error.message)
          }
      } finally {
          loading.value = false
      }

      await updateUserState();
      router.push("/projects");
  };
  
  </script>
  
  <style scoped>
  
  </style>
  