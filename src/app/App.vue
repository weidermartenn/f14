<template>
  <div class="min-w-max h-auto">
    <Header v-if="!isAuthPage && !isCreateProjectPage" />
    <RouterView class="mt-20" />
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { Header } from '../widgets/Header';
import { Footer } from '../widgets/footer';
import { useRoute } from 'vue-router';
import { computed } from 'vue';
import { initAuth } from "../shared/lib/auth";

const route = useRoute();
const isAuthPage = computed(() => route.path === '/auth');
const isCreateProjectPage = computed(() => route.path === '/create-new-project');

initAuth();

</script>

<style scoped>

</style>