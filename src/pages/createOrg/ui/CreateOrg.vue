<template>
    <div class="flex flex-col items-center justify-center overflow-hidden">
    <div  class="mt-52">
      <button
        @click="router.back"
        class="flex items-center gap-2 hover:text-gray-300"
      >
        <i class="fa-solid fa-chevron-left"></i>
        <span>Вернуться назад</span>
      </button>
      <div
        class="bg-bg-accent-dark mt-4 p-8 rounded-lg shadow-lg w-full max-w-md"
      >
        <h2 class="text-2xl font-bold mb-6 text-center">Создание организации</h2>
        <form @submit.prevent="handleCreateOrg">
          <Input type="text" v-model="name" placeholder="Название" />
          <div class="mb-10"></div>
          <button
            type="submit"
            class="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            :disabled="loading"
          >
            {{ loading ? "Загрузка..." : "Создать организацию" }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { supabaseHelper } from '../../../shared/api/sbHelper';
import { Input } from '../../../shared/ui/Input';
import { user } from '../../../shared/lib/auth';

const loading = ref(false);
const email = ref(user.value.email);
const name = ref('');
const error = ref('');

const router = useRouter();

const handleCreateOrg = async () => {
  try {
    loading.value = true;
    await supabaseHelper.createOrg(name.value, email.value);
    if (error.value) throw new Error(error.value);
    router.push({ name: 'projects' });
  } catch (e) {
    if (e instanceof Error) {
      error.value = e.message;
    }
  } finally {
    loading.value = false;
  }
};


</script>

<style scoped>

</style>