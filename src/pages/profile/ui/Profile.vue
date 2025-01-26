<template>
  <div class="mt-40 flex items-center justify-center p-4">
    <div class="col-span-1 w-60 h-72 flex flex-col items-center bg-bg-accent-dark rounded-md">
      <div
        class="relative w-32 h-32 mt-6 rounded-full overflow-hidden border-4 border-gray-700"
      >
        <img
          :src="`https://ui-avatars.com/api/?name=?`"
          class="w-full h-full object-cover"
        />
        <button
          class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity"
        >
          <i class="fa-solid fa-camera text-white text-2xl"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped></style>
