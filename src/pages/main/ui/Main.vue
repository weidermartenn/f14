<template>
  <div :class="[isOnline ? 'online-layout' : 'offline-layout']">
    <!-- Онлайн-состояние -->
    <div v-if="isOnline" class="min-w-full flex flex-col items-center gap-10 p-4 mb-14">
      <!-- Приветственный блок -->
      <div class="flex flex-col justify-center items-center w-[44rem] h-[12rem] rounded-md gap-6 bg-gray-200 dark:bg-zinc-900">
        <span class="text-xl text-gray-900 dark:text-white">
          Добро пожаловать на <span class="font-semibold">FKanban</span>
        </span>
        <span class="text-center text-gray-800 dark:text-gray-300">
          Ваш идеальный инструмент для организации задач и управления проектами.
        </span>
        <button 
          @click="router.push({ name: 'dashboard' })" 
          class="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:scale-105 cursor-pointer duration-150"
        >
          Начать работу
        </button>
      </div>

      <!-- Основной текст -->
      <span class="text-xl text-gray-800 dark:text-gray-200 text-center whitespace-pre-line max-w-[40rem]">
        FKanban создан для разработчиков, которые ценят простоту, гибкость и эффективность.
      </span>

      <!-- Блоки с преимуществами -->
      <div class="grid grid-cols-2 gap-6 w-[44rem]">
        <!-- Блок 1 -->
        <div class="p-6 rounded-md flex flex-col items-center gap-4 bg-gray-200 dark:bg-zinc-800">
          <span class="text-4xl">🚀</span>
          <span class="text-xl font-semibold text-gray-900 dark:text-white">Упростите планирование</span>
          <span class="text-center text-gray-600 dark:text-gray-400">
            Визуализируйте задачи с помощью интуитивных досок.
          </span>
        </div>

        <!-- Блок 2 -->
        <div class="p-6 rounded-md flex flex-col items-center gap-4 bg-gray-200 dark:bg-zinc-800">
          <span class="text-4xl">📅</span>
          <span class="text-xl font-semibold text-gray-900 dark:text-white">Контролируйте сроки</span>
          <span class="text-center text-gray-600 dark:text-gray-400">
            Отслеживайте прогресс и не упускайте дедлайны.
          </span>
        </div>

        <!-- Блок 3 -->
        <div class="p-6 rounded-md flex flex-col items-center gap-4 bg-gray-200 dark:bg-zinc-800">
          <span class="text-4xl">🎯</span>
          <span class="text-xl font-semibold text-gray-900 dark:text-white">Сфокусируйтесь на главном</span>
          <span class="text-center text-gray-600 dark:text-gray-400">
            Разбивайте большие задачи на шаги.
          </span>
        </div>

        <!-- Блок 4 -->
        <div class="p-6 rounded-md flex flex-col items-center gap-4 bg-gray-200 dark:bg-zinc-800">
          <span class="text-4xl">🌐</span>
          <span class="text-xl font-semibold text-gray-900 dark:text-white">Работайте из любого места</span>
          <span class="text-center text-gray-600 dark:text-gray-400">
            Прогресс синхронизируется на всех устройствах.
          </span>
        </div>
      </div>
    </div>

    <!-- Оффлайн-состояние -->
    <div v-else class="flex mt-44 justify-center">
      <div class="w-[28rem] h-[7rem] p-6 rounded-md flex flex-col justify-center items-center bg-zinc-900">
        <span class="material-symbols-outlined text-white">wifi_off</span>
        <span class="text-2xl text-white">Нет подключения к Интернету =(</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useInternetConnection } from '../../../features/check-internet-conn/lib/useInternetConnection';
import { useRouter } from 'vue-router';

const { isOnline } = useInternetConnection();
const router = useRouter();
</script>