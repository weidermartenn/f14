<template>
    <div class="px-20 py-10 min-h-[calc(100vh-180px)]">
        <div class="flex items-center justify-center">
            <div class="min-w-[800px] max-w-[1200px]">
                <h2 class="text-3xl mt-4 py-2 mb-4 border-b-2 text-zinc-800 dark:text-f14-font-dark border-zinc-800 dark:border-gray-700">Профиль</h2>
                <span class="text-md text-zinc-700 dark:text-gray-400">Персональная информация</span>
                <div class="mt-10 bg-gray-200 dark:bg-bg-accent-dark p-8 rounded-lg shadow-lg">
                    <div class="grid grid-cols-2 items-center">
                        <div class="flex flex-col gap-4">
                            <span class="text-zinc-800 dark:text-f14-font-dark">User ID</span>
                        </div>
                        <div class="flex flex-col gap-4">
                            <Input type="text" :model-value="user?.id" :error="''" placeholder="" disabled/>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 items-center">
                        <div class="flex flex-col gap-4">
                            <span class="text-zinc-800 dark:text-f14-font-dark">Электронная почта</span>
                        </div>
                        <div class="flex flex-col gap-4">
                            <Input type="text" :model-value="user?.email" :error="''" placeholder="E-mail" enabled/>
                        </div>
                    </div>
                </div>
                <div class="mt-10 bg-gray-200 dark:bg-bg-accent-dark p-8 rounded-lg shadow-lg">
                    <div class="grid grid-cols-1 items-center mb-10">
                        <div class="flex flex-col gap-2">
                            <div class="flex flex-col">
                                <span class="text-zinc-800 dark:text-f14-font-dark">Рабочих проектов: 0</span>
                                <span class="text-zinc-800 dark:text-f14-font-dark">Завершенных задач: 0</span>
                            </div>
                            <div class="flex flex-col gap-4">
                                <span class="text-zinc-800 dark:text-gray-400">Личная продуктивность</span>
                                <ActivityChart :graph-name="''" class="min-w-[400px] min-h-[200px]"/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Input } from '../../../shared/ui/Input';
import { user } from '../../../shared/lib/auth';
import { ActivityChart } from '../../../widgets/activitychart';
</script>

<style scoped>

</style>