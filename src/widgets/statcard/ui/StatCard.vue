<template>
  <div
    class="flex flex-col p-4 rounded-lg transition-all"
    :class="{
      'border-l-4 border-blue-500': color === 'blue',
      'border-l-4 border-green-500': color === 'green',
      'border-l-4 border-yellow-500': color === 'yellow',
      'border-l-4 border-purple-500': color === 'purple',
      'border-l-4 border-red-500': color === 'red',
    }"
  >
    <div class="flex items-center justify-between mb-2">
      <h3 class="text-sm font-medium text-zinc-700 dark:text-gray-400">{{ title }}</h3>
      <div
        class="p-2 rounded-md"
        :class="{
          'bg-blue-500/20 text-blue-400': color === 'blue',
          'bg-green-500/20 text-green-400': color === 'green',
          'bg-yellow-500/20 text-yellow-400': color === 'yellow',
          'bg-purple-500/20 text-purple-400': color === 'purple',
          'bg-red-500/20 text-red-400': color === 'red',
        }"
      >
        <i
          class="text-sm"
          :class="{
            'fa-solid fa-users': icon === 'users',
            'fa-solid fa-folder': icon === 'folder',
            'fa-solid fa-chart-line': icon === 'activity',
            'fa-solid fa-tasks': icon === 'tasks',
            'fa-solid fa-calendar': icon === 'calendar',
          }"
        ></i>
      </div>
    </div>

    <p class="text-2xl font-bold text-zinc-700 dark:text-gray-200">{{ value }}</p>

    <div
      v-if="trend"
      class="flex items-center mt-2 text-xs"
      :class="{
        'text-green-400': trend.direction === 'up',
        'text-red-400': trend.direction === 'down',
      }"
    >
      <span>{{ trend.value }}</span>
      <i
        class="ml-1"
        :class="{
          'fa-solid fa-arrow-up': trend.direction === 'up',
          'fa-solid fa-arrow-down': trend.direction === 'down',
        }"
      ></i>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Trend {
  direction: "up" | "down";
  value: string;
}

interface Props {
  title: string;
  value: string | number;
  icon: "users" | "folder" | "activity" | "tasks" | "calendar";
  color: "blue" | "green" | "yellow" | "purple" | "red";
  trend?: Trend;
}

defineProps<Props>();
</script>
