<template>
  <div class="w-72 h-42 p-2 flex flex-col justify-between bg-bg-dark rounded-md border-2 border-gray-700">
    <div class="flex justify-between gap-4">
        <button id="edit" class="hover:bg-gray-600 w-6 h-6 flex items-center justify-center rounded-full duration-150">
          <i class="fa-solid fa-pen-to-square"></i>
        </button>
        <button id="froze" class="hover:bg-gray-600 w-6 h-6 flex items-center justify-center rounded-full duration-150">
          <i class="fa-solid fa-snowflake"></i>
        </button>
        <button id="hide" class="hover:bg-gray-600 w-6 h-6 flex items-center justify-center rounded-full duration-150">
          <i class="fa-solid fa-eye-slash"></i>
        </button>
        <button id="delete" class="hover:bg-gray-600 w-6 h-6 flex items-center justify-center rounded-full duration-150">
          <i class="fa-regular fa-trash-can"></i>
        </button>
    </div>
    <span class="inline-block mt-2 text-md truncate max-w-[100%]">Задача такая-то где-то созданная каким-то человеком</span>
    <div class="mt-4 flex justify-between">
      <div class="flex flex-col">
        <span class="flex gap-1 items-center text-xs text-gray-400">
          <i class="fa-solid fa-chart-simple"></i>
          <span>Низкий</span>
        </span>
        <span class="flex gap-1 items-center text-xs text-gray-400">
          <i class="fa-regular fa-calendar-days"></i>
          <span>01.01.2023</span>
        </span>
      </div>
      <div class="grid grid-cols-2 gap-1">
          <Label :label="'Frontend-1'"/>
          <Label :label="'Frontend-1'"/>
          <Label :label="'Frontend-1'"/>
      </div>
    </div>
    <div class="mt-4 flex gap-2 justify-center items-center">
      <i class="fa-solid fa-clock text-xl"></i>
      <span class="text-sm">01.01.2023</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Label } from '@/widgets/label';


</script>

<style scoped>

</style>