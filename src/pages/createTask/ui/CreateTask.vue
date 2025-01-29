<template>
    <div class="mt-10 flex flex-col items-center gap-4">
        <div>
            <button @click="router.back" class="flex items-center gap-2 hover:text-gray-300">
                <i class="fa-solid fa-chevron-left"></i>
                <span>Вернуться назад</span>
            </button>
        </div>
        <div class="bg-bg-accent-dark p-8 rounded-lg shadow-lg w-full flex flex-col">
            <form submit.prevent="handleSubmit">
                <span class="text-xl text-gray-300 ml-2">Создание задачи</span>
                <Input type="text" placeholder="Название" class="rounded-md p-2 max-w-md"/>

                <TextEditor v-model="description" />
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ref } from 'vue';
import { Input } from '@/shared/ui/Input';
import { TextEditor } from '@/widgets/editor';

const router = useRouter();
const description = ref('')
</script>

<style scoped>

</style>