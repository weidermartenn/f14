<template>
    <div>
        <!-- Онлайн-состояние -->
        <div class="min-w-full flex flex-col items-center gap-10 p-4 mb-14" v-if="isOnline">
            <!-- Приветственный блок -->
            <div class="flex flex-col justify-center items-center w-[44rem] h-[12rem] bg-zinc-900 rounded-md gap-6">
                <span class="text-xl text-white">Добро пожаловать на FKanbannnnnnnn</span>
                <span class="text-center text-gray-300">Ваш идеальный инструмент для организации задач и управления проектами.</span>
                <button @click="createProject">Создать проект</button>
            </div>

            <!-- Основной текст -->
            <span class="text-xl text-center whitespace-pre-line max-w-[40rem]">
                FKanban создан для разработчиков, которые ценят простоту, гибкость и эффективность.
            </span>

            <!-- Блоки с преимуществами в матрице 2x2 -->
            <div class="grid grid-cols-2 gap-6 w-[44rem]">
                <!-- Блок 1 -->
                <div class="p-6 bg-zinc-900 rounded-md flex flex-col items-center gap-4">
                    <span class="text-4xl">🚀</span>
                    <span class="text-xl font-semibold">Упростите планирование</span>
                    <span class="text-center text-gray-300">
                        Визуализируйте задачи с помощью интуитивных досок.
                    </span>
                </div>

                <!-- Блок 2 -->
                <div class="p-6 bg-zinc-900 rounded-md flex flex-col items-center gap-4">
                    <span class="text-4xl">📅</span>
                    <span class="text-xl font-semibold">Контролируйте сроки</span>
                    <span class="text-center text-gray-300">
                        Отслеживайте прогресс и не упускайте дедлайны.
                    </span>
                </div>

                <!-- Блок 3 -->
                <div class="p-6 bg-zinc-900 rounded-md flex flex-col items-center gap-4">
                    <span class="text-4xl">🎯</span>
                    <span class="text-xl font-semibold">Сфокусируйтесь на главном</span>
                    <span class="text-center text-gray-300">
                        Разбивайте большие задачи на шаги.
                    </span>
                </div>

                <!-- Блок 4 -->
                <div class="p-6 bg-zinc-900 rounded-md flex flex-col items-center gap-4">
                    <span class="text-4xl">🌐</span>
                    <span class="text-xl font-semibold">Работайте из любого места</span>
                    <span class="text-center text-gray-300">
                        Прогресс синхронизируется на всех устройствах.
                    </span>
                </div>
            </div>
        </div>
        <!-- Оффлайн-состояние -->
        <div class="flex mt-44 text-white justify-self-center" v-else>
            <div class="w-[28rem] h-[7rem] p-6 bg-zinc-900 rounded-md flex flex-col justify-center items-center">
                <span class="material-symbols-outlined">wifi_off</span>
                <span class="text-2xl">Нет подключения к Интернету =(</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useInternetConnection } from '../../../features/check-internet-conn/lib/useInternetConnection';
import { useRouter } from 'vue-router';

const { isOnline } = useInternetConnection();

const router = useRouter();

const createProject = () => {
    router.push('/create-new-project');
}
</script>

<style scoped>
/* Дополнительные стили, если нужно */
</style>