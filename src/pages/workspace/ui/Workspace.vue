<template>
    <div class="flex flex-col items-center">
        <KanbanBoard />
        <ActivityChart class="mb-20"/>
    </div>
</template>

<script setup lang="ts">
import { KanbanBoard } from "@/widgets/kanban/";
import { ActivityChart } from "@/widgets/activitychart";
</script>

<style scoped>

</style>