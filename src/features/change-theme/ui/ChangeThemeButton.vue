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
import { ref, onMounted } from "vue";

const isDark = ref(false);
const isRotating = ref(false);

const toggleTheme = () => {
  isRotating.value = true;
  setTimeout(() => {
    isRotating.value = false;
  }, 500);

  isDark.value = !isDark.value;
  updateTheme();
};

const updateTheme = () => {
  const root = document.documentElement;

  if (isDark.value) {
    root.classList.add("dark");
    localStorage.theme = "dark";
  } else {
    root.classList.remove("dark");
    localStorage.theme = "light";
  }
};

onMounted(() => {
  const savedTheme = localStorage.theme;
  const root = document.documentElement;

  if (
    savedTheme === "dark" ||
    (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)
  ) {
    isDark.value = true;
    root.classList.add("dark");
  } else {
    isDark.value = false;
    root.classList.remove("dark");
  }
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
</style>
