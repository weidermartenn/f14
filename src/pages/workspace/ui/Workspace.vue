<template>
    <div class="flex flex-col items-center">
        <span class="text-2xl "><code class="bg-bg-accent-dark text-white rounded-md px-2 py-1">{{ projectName }}</code></span>
        <KanbanBoard />
        <ActivityChart class="mb-20"/>
    </div>
</template>

<script setup lang="ts">
import { KanbanBoard } from "@/widgets/kanban/";
import { ActivityChart } from "@/widgets/activitychart";
import { ref } from 'vue';
import { useRoute } from 'vue-router'

const route = useRoute();
const projectName = ref(route.query.name || "")

</script>

<style scoped>

</style>