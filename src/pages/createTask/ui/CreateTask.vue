<template>
    <div class="mt-28 flex flex-col items-center gap-4">
        <div>
            <button @click="router.back" class="flex items-center gap-2 hover:text-gray-300">
                <i class="fa-solid fa-chevron-left"></i>
                <span>Вернуться назад</span>
            </button>
        </div>
        <div class="bg-bg-accent-dark p-8 rounded-lg shadow-lg w-[60%] grid grid-cols-[2fr_1fr] gap-4">
            <div>
                <span class="text-xl text-gray-300 ml-2">Создание задачи</span>
                <Input type="text" placeholder="Название" class="rounded-md p-2 max-w-md"/>
                <TextEditor v-model="description" />
            </div>
            <div class="flex flex-col gap-4 bg-bg-dark rounded-md">
                <DatePicker v-model="selectedDate" placeholder="Выберите дату" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import { Input } from '@/shared/ui/Input';
import { TextEditor } from '@/widgets/editor';
import { DatePicker } from '@/shared/ui/DatePicker';

const router = useRouter();
const description = ref('')

const selectedDate = ref <Date | null>(new Date());
</script>

<style scoped>

</style>