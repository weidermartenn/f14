<template>
  <div class="flex flex-col items-center justify-center min-h-[calc(100vh-150px)] bg-gradient-to-b from-zinc-900 to-emerald-950">
    <div class="absolute inset-0 flex items-center justify-center">
      <div class="animate-pulse absolute w-64 h-64 rounded-full bg-gray-800 opacity-20 animate-blob"></div>
      <div class="animate-pulse absolute w-64 h-64 rounded-full bg-emerald-500 opacity-20 animate-blob animation-delay-2000"></div>
      <div class="animate-pulse absolute w-64 h-64 rounded-full bg-blue-900 opacity-20 animate-blob animation-delay-4000"></div>
    </div>
    <div class="bg-bg-accent-dark mt-4 p-8 rounded-lg shadow-lg w-full max-w-lg z-10 animate__animated animate__fadeIn">
      <div class="flex flex-col items-center">
        <i class="fa-solid fa-envelope text-2xl"></i>
        <h2 class="text-2xl font-bold mb-6 text-center">Подтвердите почту</h2>
      </div>
      <p class="text-sm text-gray-400 text-wrap line-clamp-4 text-center">
        Мы отправили вам ссылку для входа на указанную почту
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
@keyframes blob {
  0% {
    transform: scale(1);
  }
  33% {
    transform: scale(1.1);
  }
  66% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
  }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animation-delay-2000 {
  animation-delay: 2s;
}

.animation-delay-4000 {
  animation-delay: 4s;
}
</style>
