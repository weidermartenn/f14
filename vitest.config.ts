import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',
    coverage: {
      provider: 'istanbul',
      include: ['src/**/*.{vue,ts}'], // Указываем какие файлы учитывать
      exclude: ['**/__mocks__/**', 'src/main.ts'], // Исключаем ненужное
    },
    deps: {
        inline: ['@vue', 'vue-router']
    },
    // Настройки для имитации DOM
    environmentOptions: {
      jsdom: {
        url: 'http://localhost:3000', // Базовый URL
      },
    },
  },
})