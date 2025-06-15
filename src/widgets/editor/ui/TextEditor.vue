<template>
  <div class="flex flex-col gap-4">
    <!-- Панель инструментов -->
    <div
      class="bg-white dark:bg-gray-800 rounded-lg p-2 flex flex-wrap justify-between gap-2 px-4 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
    >
      <div class="flex flex-wrap gap-2">
        <!-- Bold -->
        <button
          @click="toggleBold"
          :class="[
            'p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors',
            editor?.isActive('bold') ? 'bg-gray-100 dark:bg-gray-700' : '',
          ]"
          title="Жирный"
        >
          <span class="fa-solid fa-bold"></span>
        </button>
        <!-- Italic -->
        <button
          @click="toggleItalic"
          :class="[
            'p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors',
            editor?.isActive('italic') ? 'bg-gray-100 dark:bg-gray-700' : '',
          ]"
          title="Курсив"
        >
          <span class="fa-solid fa-italic"></span>
        </button>
        <!-- Underline -->
        <button
          @click="toggleUnderline"
          :class="[
            'p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors',
            editor?.isActive('underline') ? 'bg-gray-100 dark:bg-gray-700' : '',
          ]"
          title="Подчеркивание"
        >
          <span class="fa-solid fa-underline"></span>
        </button>
        <!-- Strikethrough -->
        <button
          @click="toggleStrike"
          :class="[
            'p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors',
            editor?.isActive('strike') ? 'bg-gray-100 dark:bg-gray-700' : '',
          ]"
          title="Зачеркивание"
        >
          <span class="fa-solid fa-strikethrough"></span>
        </button>
        <!-- Link -->
        <button
          @click="toggleLink"
          :class="[
            'p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors',
            editor?.isActive('link') ? 'bg-gray-100 dark:bg-gray-700' : '',
          ]"
          title="Ссылка"
        >
          <span class="fa-solid fa-link"></span>
        </button>
      </div>
      <div class="flex flex-wrap gap-2">
        <!-- Bulleted List -->
        <button
          @click="toggleBulletList"
          :class="[
            'p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors',
            editor?.isActive('bulletList') ? 'bg-gray-100 dark:bg-gray-700' : '',
          ]"
          title="Маркированный список"
        >
          <span class="fa-solid fa-list-ul"></span>
        </button>
        <!-- Numbered List -->
        <button
          @click="toggleOrderedList"
          :class="[
            'p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors',
            editor?.isActive('orderedList') ? 'bg-gray-100 dark:bg-gray-700' : '',
          ]"
          title="Нумерованный список"
        >
          <span class="fa-solid fa-list-ol"></span>
        </button>
        <!-- Quote -->
        <button
          @click="toggleBlockquote"
          :class="[
            'p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors',
            editor?.isActive('blockquote') ? 'bg-gray-100 dark:bg-gray-700' : '',
          ]"
          title="Цитата"
        >
          <span class="fa-solid fa-quote-left"></span>
        </button>
      </div>
    </div>

    <!-- Область редактирования -->
    <div
      class="bg-white dark:bg-gray-800 rounded-lg p-4 flex justify-between gap-4 text-gray-800 dark:text-gray-200 overflow-y-auto max-h-[650px] border border-gray-200 dark:border-gray-700"
    >
      <div class="w-full h-full">
        <editor-content :editor="editor" class="h-full break-words" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { EditorContent } from "@tiptap/vue-3";
import { useTextEditor } from "../model/useTextEditor";
import { watch, defineProps, defineEmits } from "vue";

const props = defineProps({
  modelValue: String,
});

const emit = defineEmits(["update:modelValue"]);

const { 
  editor,
  toggleBold,
  toggleItalic,
  toggleUnderline,
  toggleStrike,
  toggleLink,
  toggleBulletList,
  toggleOrderedList,
  toggleBlockquote
} = useTextEditor(props.modelValue || '');

watch(() => editor.value?.getHTML(), (newValue) => {
  emit("update:modelValue", newValue || '');
});
</script>

<style scoped>
/* Стили для редактора */
:deep(.tiptap) {
  padding: 0.5rem;
  height: 100%;
  outline: none;
  word-break: break-word;
  overflow-wrap: anywhere;
  min-width: 0;
}

:deep(.tiptap p) {
  margin: 0 0 0.5rem 0;
  line-height: 1.5;
}

:deep(.tiptap a) {
  color: #3b82f6;
  text-decoration: underline;
  cursor: pointer;
}

/* Стили для маркированных списков */
:deep(.tiptap ul),
:deep(.tiptap ol) {
  padding-left: 1.5rem;
  margin: 0.5rem 0;
}

:deep(.tiptap ul) {
  list-style-type: disc;
}

/* Стили для нумерованных списков */
:deep(.tiptap ol) {
  list-style-type: decimal;
}

/* Стили для цитат */
:deep(.tiptap blockquote) {
  border-left: 3px solid #d1d5db;
  padding-left: 1rem;
  margin: 0.5rem 0;
  color: #6b7280;
}

.dark :deep(.tiptap blockquote) {
  border-left-color: #4b5563;
  color: #9ca3af;
}

/* Плейсхолдер */
:deep(.tiptap p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  color: #9ca3af;
  pointer-events: none;
  height: 0;
}

/* Активное состояние для кнопок */
:deep(.tiptap .is-active) {
  background-color: #f3f4f6;
}

.dark :deep(.tiptap .is-active) {
  background-color: #374151;
}

/* Стили для скроллбара */
:deep(.tiptap)::-webkit-scrollbar {
  width: 8px;
}

:deep(.tiptap)::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

:deep(.tiptap)::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}

.dark :deep(.tiptap)::-webkit-scrollbar-track {
  background: #374151;
}

.dark :deep(.tiptap)::-webkit-scrollbar-thumb {
  background: #6b7280;
}
</style>