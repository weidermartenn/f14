<template>
  <div class="flex flex-col items-center">
    <span class="text-2xl">
      <code class="bg-bg-accent-dark text-white rounded-md px-2 py-1">{{
        projectName
      }}</code>
    </span>
    <KanbanBoard :projectId="projectId" :projectName="projectName" />
    <ActivityChart class="mb-20" />
  </div>
</template>

<script setup lang="ts">
import { KanbanBoard } from "../../../widgets/kanban/";
import { ActivityChart } from "../../../widgets/activitychart";
import { ref, watch } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const projectId = ref<string | undefined>(
  typeof route.query.projectId === "string" ? route.query.projectId : undefined
);
const projectName = ref<string | undefined>(
  typeof route.query.name === "string" ? route.query.name : undefined
);

// Если route.query.projectId или route.query.name изменятся, обновите projectId и projectName
watch(
  () => route.query.projectId,
  (newProjectId) => {
    if (typeof newProjectId === "string") {
      projectId.value = newProjectId;
    } else {
      projectId.value = undefined;
    }
  }
);

watch(
  () => route.query.name,
  (newName) => {
    if (typeof newName === "string") {
      projectName.value = newName;
    } else {
      projectName.value = undefined;
    }
  }
);
</script>

<style scoped></style>
