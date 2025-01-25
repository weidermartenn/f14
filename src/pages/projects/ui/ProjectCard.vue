<template>
    <div class="w-64 h-40 bg-bg-accent-dark hover:bg-opacity-60 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
        <h3 class="text-xl font-semibold">{{ project.name }}</h3>
        <p class="text-gray-300 text-sm mt-2">Создан: {{ formatDate(project.createdAt) }}</p>
    </div>
</template>

<script setup lang="ts">
import { defineProps } from "vue";
import type { Project } from "@/entities/project/types";

const props = defineProps<{
    project: Project;
}>();

const formatDate = (date: Date) => {
    return date.toLocaleDateString("ru-RU", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};

</script>

<style scoped>

</style>