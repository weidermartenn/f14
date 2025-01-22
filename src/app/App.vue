<template>
  <div class="min-w-max h-auto">
    <Header v-if="!isAuthPage" />
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { Header } from '@/widgets/Header/';
import { useRoute } from 'vue-router';
import { computed } from 'vue';
import { initAuth } from "@/shared/lib/auth";

const route = useRoute();
const isAuthPage = computed(() => route.path === '/auth');
const isRegPage = computed(() => route.path === '/reg');

initAuth();

</script>

<style scoped>

</style>