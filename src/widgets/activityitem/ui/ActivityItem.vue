<template>
  <div
    class="flex items-start gap-3 p-3 rounded-lg hover:bg-bg-accent-darker transition-colors"
  >
    <!-- Иконка действия -->
    <div class="flex-shrink-0 w-8 h-8 flex justify-center items-center mt-1 p-2 rounded-md" :class="iconClass">
      <i :class="activityIcon"></i>
    </div>

    <!-- Содержимое действия -->
    <div class="flex-1 min-w-0">
      <div class="flex justify-between items-baseline gap-2">
        <p class="text-sm font-medium text-gray-200 truncate">
          {{ activity.action }}
          <span class="text-blue-400">{{ activity.name }}</span>
        </p>
        <span class="text-xs text-gray-500 whitespace-nowrap">{{
          activity.date
        }}</span>
      </div>
      <p class="text-xs text-gray-400 mt-1">
        Инициатор: <span class="text-gray-300">{{ activity.user }}</span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Activity {
  action: string;
  name: string;
  date: string;
  user: string;
  type?: "project" | "document" | "member" | "task" | "event";
}

const props = defineProps<{
  activity: Activity;
}>();

// Определяем иконку и цвет в зависимости от типа действия
const activityIcon = computed(() => {
  const typesMap = {
    project: "fa-solid fa-folder",
    document: "fa-solid fa-file-lines",
    member: "fa-solid fa-user-plus",
    task: "fa-solid fa-square-check",
    event: "fa-solid fa-calendar-day",
    default: "fa-solid fa-circle-info",
  };

  return props.activity.type ? typesMap[props.activity.type] : typesMap.default;
});

const iconClass = computed(() => {
  const colorsMap = {
    project: "bg-purple-500/20 text-purple-400",
    document: "bg-blue-500/20 text-blue-400",
    member: "bg-green-500/20 text-green-400",
    task: "bg-yellow-500/20 text-yellow-400",
    event: "bg-red-500/20 text-red-400",
    default: "bg-gray-500/20 text-gray-400",
  };

  return props.activity.type
    ? colorsMap[props.activity.type]
    : colorsMap.default;
});
</script>
