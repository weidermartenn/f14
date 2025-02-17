<template>
  <button
    @click="toggleTheme"
    class="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-500"
    :class="{ 'rotate-180': isRotating }"
    aria-label="Change theme"
  >
    <Transition name="icon-fade" mode="out-in">
      <span
        v-if="isDark"
        key="moon"
        class="fa-solid fa-moon text-gray-800 dark:text-gray-200"
      ></span>
      <span
        v-else
        key="sun"
        class="fa-solid fa-sun text-amber-500 dark:text-gray-200"
      ></span>
    </Transition>
  </button>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const isDark = ref(false);
const isRotating = ref(false);
const isInitialLoad = ref(true);

const toggleTheme = () => {
  isRotating.value = true;
  setTimeout(() => {
    isRotating.value = false;
  }, 500);
  
  isDark.value = !isDark.value;
  updateTheme(true);
};

const updateTheme = (withAnimation: boolean) => {
  const root = document.documentElement;
  
  if (withAnimation) {
    root.style.transition = 'background-color 0.5s ease, color 0.5s ease';
  }

  if (isDark.value) {
    root.classList.add('dark');
    localStorage.theme = 'dark';
  } else {
    root.classList.remove('dark');
    localStorage.theme = 'light';
  }

  if (withAnimation) {
    setTimeout(() => {
      root.style.transition = '';
    }, 500);
  }
};

onMounted(() => {
  const savedTheme = localStorage.theme;
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Применяем тему без анимации
  isDark.value = savedTheme === 'dark' || (!savedTheme && prefersDark);
  updateTheme(false);
  
  // Убираем флаг начальной загрузки после первого рендера
  setTimeout(() => {
    isInitialLoad.value = false;
  }, 100);
});
</script>

<style scoped>
.rotate-180 {
  transform: rotate(180deg);
  transition: transform 0.5s ease;
}

.icon-fade-enter-active,
.icon-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.icon-fade-enter-from {
  opacity: 0;
  transform: rotate(-90deg);
}

.icon-fade-leave-to {
  opacity: 0;
  transform: rotate(90deg);
}

/* Глобальные стили в вашем основном CSS-файле */
html {
  background-color: theme('colors.bg');
  color: theme('colors.f14-font');
}

.dark {
  background-color: theme('colors.bg-dark');
  color: theme('colors.f14-font-dark');
}

html,
body {
  transition: background-color 0.5s ease, color 0.5s ease;
}
</style>