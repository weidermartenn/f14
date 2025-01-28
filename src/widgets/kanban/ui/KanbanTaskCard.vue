<template>
  <div class="w-72 h-38 p-2 flex flex-col justify-between bg-bg-dark rounded-md border-2 border-gray-700">
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
        <span class="text-xs text-gray-400">Приоритет: 1</span>
        <span class="text-xs text-gray-400">Дата создания: 1</span>
      </div>
      <div class="grid grid-cols-2 gap-1">
          <Label :label="'Frontend-1'"/>
          <Label :label="'Frontend-1'"/>
          <Label :label="'Frontend-1'"/>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import { Label } from '@/widgets/label';

tippy('#edit', {
  content: 'Редактировать',
  theme: 'dark',
  arrow: true,
  animation: 'scale',
  placement: 'bottom',
});

tippy('#froze', {
  content: 'Заморозить',
  theme: 'dark',
  arrow: true,
  animation: 'scale',
  placement: 'bottom',
});

tippy('#hide', {
  content: 'Скрыть',
  theme: 'dark',
  arrow: true,
  animation: 'scale',
  placement: 'bottom',
});

tippy('#delete', {
  content: 'Удалить',
  theme: 'dark',
  arrow: true,
  animation: 'scale',
  placement: 'bottom',
});

</script>

<style scoped>

</style>