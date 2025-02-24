<template>
    <div class="px-20 py-10 min-h-[calc(100vh-180px)]">
        <div class="flex items-center justify-center">
            <div class="min-w-[800px] max-w-[1200px]">
                <h2 class="text-3xl mt-4 py-2 mb-4 border-b-2 border-gray-700">Профиль</h2>
                <span class="text-md text-gray-400">Персональная информация</span>
                <div class="mt-10 bg-bg-accent-dark p-8 rounded-lg shadow-lg">
                    <div class="grid grid-cols-2 items-center mb-10">
                        <div class="p-4 flex flex-col items-center">
                            <img class="border-2 border-gray-400 rounded-full" src="https://cdn-icons-png.flaticon.com/128/17561/17561717.png">
                        </div>
                        <div class="flex flex-col gap-2">
                            <div class="flex flex-col">
                                <span>Рабочих проектов: 0</span>
                                <span>Завершенных задач: 0</span>
                            </div>
                            <div class="flex flex-col gap-4">
                                <span class="text-gray-400">Личная продуктивность</span>
                                <ActivityChart :graph-name="''" class="min-w-[400px] min-h-[200px]"/>
                            </div>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 items-center">
                        <div class="flex flex-col gap-4">
                            <span>User ID</span>
                        </div>
                        <div class="flex flex-col gap-4">
                            <Input type="text" :model-value="user?.id" :error="''" placeholder="" disabled/>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 items-center">
                        <div class="flex flex-col gap-4">
                            <span>Электронная почта</span>
                        </div>
                        <div class="flex flex-col gap-4">
                            <Input type="text" :model-value="user?.email" :error="''" placeholder="E-mail" enabled/>
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