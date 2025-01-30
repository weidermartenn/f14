<template>
  <div class="mt-28 flex flex-col items-center gap-4">
    <div>
      <button
        @click="router.back"
        class="flex items-center gap-2 hover:text-gray-300"
      >
        <i class="fa-solid fa-chevron-left"></i>
        <span>Вернуться назад</span>
      </button>
    </div>
    <div
      class="bg-bg-accent-dark p-8 rounded-lg shadow-lg w-[70%] grid grid-cols-[2fr_1fr] gap-4"
    >
    <!--Первый столбец-->
      <div>
        <span class="text-xl text-gray-300 ml-2">
          Создание задачи для проекта
          <code
            class="text-f14-font-dark bg-bg-dark rounded-md px-2 ml-2"
          ></code>
        </span>
        <Input
          type="text"
          v-model="name"
          placeholder="Название"
          class="rounded-md p-2 max-w-md"
        />
        <TextEditor v-model="description" />
      </div>

      <!--Второй столбец-->
      <div class="flex flex-col gap-4 bg-bg-dark rounded-md p-4 overflow-y-auto max-h-[550px]">
        <span>Выполнить до:</span>
        <DatePicker v-model="selectedDate" placeholder="Выберите дату" />
        <div class="flex gap-4 items-center">
          <span>Приоритет:</span>
          <select class="bg-bg-accent-dark rounded-md p-2">
            <option value="1">Низкий</option>
            <option value="2">Средний</option>
            <option value="3">Высокий</option>
          </select>
        </div>

        <span>Метки</span>
        <div class="grid grid-cols-3 gap-2">
          <Label
            class="w-20 h-8"
            v-for="i in 7"
            :key="i"
            :label="'Frontend-' + i"
          />
          <Label :label="'+'" />
        </div>

        <div class="flex gap-4 items-center mt-6">
          <label for="file-input" class="cursor-pointer">
            <span
              class="bg-blue-500 text-xs text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
              Прикрепить файлы
            </span>
          </label>
          <input
            id="file-input"
            type="file"
            multiple
            class="hidden"
            @change="handleFileInput"
          />
        </div>
        <span class="text-xs text-gray-400"
            >Максимальное количество файлов: 5</span
          >

        <div v-if="selectedFiles.length > 0" class=mt-4>
            <ul class="space-y-2">
                <li v-for="(file, index) in selectedFiles" :key="index" class="flex items-center text-gray-300 gap-2">
                    
                    <i class="text-md" :class="getIcon(file)"></i>
                    
                    <span class="text-xs">{{ file.name }}</span>
                    <button @click="removeFile(index)" class="text-red-500 hover:text-red-700">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </li>
            </ul>
        </div>

        <button
        class="flex justify-center gap-2 hover:text-gray-300"
      >
        Создать
      </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { ref } from "vue";
import { Input } from "@/shared/ui/Input";
import { TextEditor } from "@/widgets/editor";
import { DatePicker } from "@/shared/ui/DatePicker";
import { Label } from "@/widgets/label";
import { supabase } from "@/shared/api/supabaseClient";

const router = useRouter();
const description = ref("");

const name = ref("");

const selectedDate = ref<Date | null>(new Date());
const selectedFiles = ref<File[]>([]);

const handleFileInput = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    const files = target.files;

    if (files && files.length > 5) {
        alert('Максимальное количество файлов: 5');
        target.value = '';
    } else if (files) {
        selectedFiles.value = Array.from(files);
    }
};

const removeFile = (index: number) => {
    selectedFiles.value.splice(index, 1);
}

const getIcon = (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();

    switch (extension) {
        case 'pdf':
            return 'fa-solid fa-file-pdf';
        case 'doc':
        case 'docx':
            return 'fa-solid fa-file-word';
        case 'xls':
        case 'xlsx':
            return 'fa-solid fa-file-excel';
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
            return 'fa-solid fa-file-image';
        case 'txt':
            return 'fa-solid fa-file-lines';
        case 'cpp':
        case 'py':
        case 'js':
        case 'ts':
        case 'kt':
        case 'dart':
        case 'cs':
        case 'java':
            return 'fa-solid fa-file-code';
        case 'rar':
        case 'zip':
            return 'fa-solid fa-file-zipper';
        default:
            return 'fa-solid fa-file';
    }
};
</script>

<style scoped></style>
